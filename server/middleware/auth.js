import jwt from 'jsonwebtoken'
import { getOne, run } from '../db.js'

export async function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Best-effort: ensure user row exists in DB (never blocks auth)
  try {
    const exists = await getOne('SELECT id FROM users WHERE id = ?', [req.user.id])
    if (!exists && req.user.email) {
      await run('DELETE FROM users WHERE email = ? AND id != ?', [req.user.email, req.user.id])
      await run(
        'INSERT INTO users (id, email, name, password, tier, email_verified) VALUES (?,?,?,?,?,?) ON CONFLICT DO NOTHING',
        [req.user.id, req.user.email, req.user.name || 'User', 'jwt-recovery', req.user.tier || 'free', 1]
      )
    }
  } catch {}

  next()
}
