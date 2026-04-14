import jwt from 'jsonwebtoken'
import { getOne, run } from '../db.js'

export function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  // Step 1: Verify JWT — this is the ONLY thing that can cause a 401
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Step 2: Best-effort DB upsert — never blocks auth if it fails
  try {
    const exists = getOne('SELECT id FROM users WHERE id = ?', [req.user.id])
    if (!exists && req.user.email) {
      run('DELETE FROM users WHERE email = ? AND id != ?', [req.user.email, req.user.id])
      run(
        'INSERT OR IGNORE INTO users (id, email, name, password, tier, email_verified) VALUES (?,?,?,?,?,?)',
        [req.user.id, req.user.email, req.user.name || 'User', 'jwt-recovery', req.user.tier || 'free', 1]
      )
    }
  } catch {
    // DB failed — continue anyway, JWT is valid
  }

  next()
}
