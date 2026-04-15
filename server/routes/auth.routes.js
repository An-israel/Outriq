import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import supabase, { check } from '../db.js'
import { sendVerificationEmail } from '../services/email.service.js'

const router = Router()

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' })
}
function generateOTP() { return Math.floor(100000 + Math.random() * 900000).toString() }

router.post('/register', async (req, res, next) => {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) return res.status(400).json({ error: 'Full name, email and password are required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const clean = email.toLowerCase().trim()
    const { data: existing } = await supabase.from('users').select('id').eq('email', clean).maybeSingle()
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' })

    const hash = await bcrypt.hash(password, 10)
    const id = uuid()
    check(await supabase.from('users').insert({ id, email: clean, name: name.trim(), password: hash, tier: 'free', email_verified: 0 }))

    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    check(await supabase.from('verify_tokens').insert({ id: uuid(), user_id: id, code, expires_at: expiresAt }))

    const result = await sendVerificationEmail(clean, name.trim(), code)
    res.status(201).json({ needsVerify: true, userId: id, email: clean, emailSent: result.sent, ...(result.sent ? {} : { demoCode: code }) })
  } catch (err) { next(err) }
})

router.post('/verify-email', async (req, res, next) => {
  try {
    const { userId, code } = req.body
    if (!userId || !code) return res.status(400).json({ error: 'userId and code required' })

    const { data: token } = await supabase.from('verify_tokens')
      .select('*').eq('user_id', userId).eq('code', code.trim()).eq('used', 0)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (!token) return res.status(400).json({ error: 'Invalid or expired code.' })

    check(await supabase.from('verify_tokens').update({ used: 1 }).eq('id', token.id))
    check(await supabase.from('users').update({ email_verified: 1 }).eq('id', userId))

    const { data: user } = await supabase.from('users').select('id, email, name, tier').eq('id', userId).single()
    res.json({ token: issueToken(user), user })
  } catch (err) { next(err) }
})

router.post('/resend-verify', async (req, res, next) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const { data: user } = await supabase.from('users').select('id, email, name, email_verified').eq('id', userId).maybeSingle()
    if (!user) return res.status(404).json({ error: 'Account not found' })
    if (user.email_verified) return res.status(400).json({ error: 'Email already verified' })

    check(await supabase.from('verify_tokens').update({ used: 1 }).eq('user_id', userId))
    const code = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    check(await supabase.from('verify_tokens').insert({ id: uuid(), user_id: userId, code, expires_at: expiresAt }))

    const result = await sendVerificationEmail(user.email, user.name, code)
    res.json({ ok: true, emailSent: result.sent, ...(result.sent ? {} : { demoCode: code }) })
  } catch (err) { next(err) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const { data: user } = await supabase.from('users').select('*').eq('email', email.toLowerCase().trim()).maybeSingle()
    if (!user) return res.status(401).json({ error: 'No account found with this email' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Incorrect password' })

    if (!user.email_verified) {
      check(await supabase.from('verify_tokens').update({ used: 1 }).eq('user_id', user.id))
      const code = generateOTP()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      check(await supabase.from('verify_tokens').insert({ id: uuid(), user_id: user.id, code, expires_at: expiresAt }))
      const result = await sendVerificationEmail(user.email, user.name, code)
      return res.status(403).json({ error: 'Please verify your email first.', needsVerify: true, userId: user.id, email: user.email, emailSent: result.sent, ...(result.sent ? {} : { demoCode: code }) })
    }

    res.json({ token: issueToken(user), user: { id: user.id, email: user.email, name: user.name, tier: user.tier } })
  } catch (err) { next(err) }
})

router.post('/change-password', async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'Minimum 6 characters' })

    const { data: user } = await supabase.from('users').select('*').eq('id', decoded.id).maybeSingle()
    if (!user) return res.status(404).json({ error: 'Account not found' })
    if (!(await bcrypt.compare(currentPassword, user.password))) return res.status(401).json({ error: 'Current password is incorrect' })

    check(await supabase.from('users').update({ password: await bcrypt.hash(newPassword, 10) }).eq('id', user.id))
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.patch('/profile', async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' })
    check(await supabase.from('users').update({ name: name.trim() }).eq('id', decoded.id))
    res.json({ ok: true })
  } catch (err) { next(err) }
})

router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { data } = await supabase.from('users').select('id, email, name, tier, created_at').eq('id', decoded.id).maybeSingle()
    res.json(data || { id: decoded.id, email: decoded.email, name: decoded.name, tier: 'free' })
  } catch { res.status(401).json({ error: 'Invalid token' }) }
})

export default router
