import { Router }    from 'express'
import bcrypt        from 'bcryptjs'
import jwt           from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { getOne, run } from '../db.js'

const router = Router()

// ── Helpers ───────────────────────────────────────────────────
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function issueToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' })
}

// ── Register ──────────────────────────────────────────────────
router.post('/register', async (req, res, next) => {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()])
    if (existing) return res.status(409).json({ error: 'An account with this email already exists' })

    const hash  = await bcrypt.hash(password, 10)
    const id    = uuid()
    const clean = email.toLowerCase().trim()

    run('INSERT INTO users (id, email, name, password, tier, email_verified) VALUES (?,?,?,?,?,?)',
      [id, clean, name.trim(), hash, 'free', 0])

    // Generate OTP
    const code      = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 min
    run('INSERT INTO verify_tokens (id, user_id, code, expires_at) VALUES (?,?,?,?)',
      [uuid(), id, code, expiresAt])

    // TODO: Send real email when SMTP is configured (set SMTP_HOST, SMTP_USER, SMTP_PASS in env)
    // For now, code is returned so the UI can display it during demo
    res.status(201).json({
      needsVerify: true,
      userId: id,
      email: clean,
      // In production, remove demoCode and send actual email
      demoCode: code,
    })
  } catch (err) { next(err) }
})

// ── Verify Email ──────────────────────────────────────────────
router.post('/verify-email', async (req, res, next) => {
  try {
    const { userId, code } = req.body
    if (!userId || !code) return res.status(400).json({ error: 'userId and code required' })

    const token = getOne(
      `SELECT * FROM verify_tokens WHERE user_id = ? AND code = ? AND used = 0 AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 1`,
      [userId, code.trim()]
    )

    if (!token) {
      return res.status(400).json({ error: 'Invalid or expired code. Check the code and try again.' })
    }

    // Mark token used and verify user
    run('UPDATE verify_tokens SET used = 1 WHERE id = ?', [token.id])
    run('UPDATE users SET email_verified = 1 WHERE id = ?', [userId])

    const user = getOne('SELECT id, email, name, tier FROM users WHERE id = ?', [userId])
    const jwt_token = issueToken(user)

    res.json({ token: jwt_token, user })
  } catch (err) { next(err) }
})

// ── Resend Verification Code ──────────────────────────────────
router.post('/resend-verify', async (req, res, next) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const user = getOne('SELECT id, email, email_verified FROM users WHERE id = ?', [userId])
    if (!user) return res.status(404).json({ error: 'Account not found' })
    if (user.email_verified) return res.status(400).json({ error: 'Email already verified' })

    // Expire old tokens
    run("UPDATE verify_tokens SET used = 1 WHERE user_id = ?", [userId])

    const code      = generateOTP()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    run('INSERT INTO verify_tokens (id, user_id, code, expires_at) VALUES (?,?,?,?)',
      [uuid(), userId, code, expiresAt])

    res.json({ ok: true, demoCode: code })
  } catch (err) { next(err) }
})

// ── Login ─────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const user = getOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()])
    if (!user) return res.status(401).json({ error: 'No account found with this email' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Incorrect password' })

    // Block unverified users
    if (!user.email_verified) {
      // Generate a fresh OTP so they can verify
      run("UPDATE verify_tokens SET used = 1 WHERE user_id = ?", [user.id])
      const code      = generateOTP()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()
      run('INSERT INTO verify_tokens (id, user_id, code, expires_at) VALUES (?,?,?,?)',
        [uuid(), user.id, code, expiresAt])

      return res.status(403).json({
        error: 'Please verify your email before logging in.',
        needsVerify: true,
        userId: user.id,
        email: user.email,
        demoCode: code,
      })
    }

    const token = issueToken(user)
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, tier: user.tier } })
  } catch (err) { next(err) }
})

// ── Change Password ───────────────────────────────────────────
router.post('/change-password', async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' })
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })

    const user = getOne('SELECT * FROM users WHERE id = ?', [decoded.id])
    if (!user) return res.status(404).json({ error: 'Account not found' })

    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return res.status(401).json({ error: 'Current password is incorrect' })

    const hash = await bcrypt.hash(newPassword, 10)
    run('UPDATE users SET password = ? WHERE id = ?', [hash, user.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── Update Profile ────────────────────────────────────────────
router.patch('/profile', async (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const { name } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Name required' })
    run('UPDATE users SET name = ? WHERE id = ?', [name.trim(), decoded.id])
    res.json({ ok: true })
  } catch (err) { next(err) }
})

// ── Me ────────────────────────────────────────────────────────
router.get('/me', (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const full    = getOne('SELECT id, email, name, tier, created_at FROM users WHERE id = ?', [decoded.id])
    if (!full) return res.status(401).json({ error: 'Account not found' })
    res.json(full)
  } catch { res.status(401).json({ error: 'Invalid token' }) }
})

export default router
