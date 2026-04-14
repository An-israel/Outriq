import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { getOne, run } from '../db.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { email, name, password } = req.body
    if (!email || !name || !password) return res.status(400).json({ error: 'email, name, password required' })

    const existing = getOne('SELECT id FROM users WHERE email = ?', [email])
    if (existing) return res.status(409).json({ error: 'Email already registered' })

    const hash = await bcrypt.hash(password, 10)
    const id = uuid()
    run('INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)', [id, email, name, hash])

    const token = jwt.sign({ id, email, name }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.status(201).json({ token, user: { id, email, name, tier: 'free' } })
  } catch (err) { next(err) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'email and password required' })

    const user = getOne('SELECT * FROM users WHERE email = ?', [email])
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' })

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, tier: user.tier } })
  } catch (err) { next(err) }
})

router.get('/me', (req, res, next) => {
  try {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
    const user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const full = getOne('SELECT id, email, name, tier, created_at FROM users WHERE id = ?', [user.id])
    res.json(full || user)
  } catch { res.status(401).json({ error: 'Invalid token' }) }
})

export default router
