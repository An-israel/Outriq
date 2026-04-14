import jwt from 'jsonwebtoken'
import { getOne, run } from '../db.js'

export function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    req.user = decoded

    // Ensure user row exists in DB so queries work after Vercel /tmp DB resets
    const exists = getOne('SELECT id FROM users WHERE id = ?', [decoded.id])
    if (!exists && decoded.email) {
      // Remove any auto-seeded row with same email but different ID (cold-start seed conflict)
      run('DELETE FROM users WHERE email = ? AND id != ?', [decoded.email, decoded.id])
      run(
        'INSERT OR IGNORE INTO users (id, email, name, password, tier, email_verified) VALUES (?,?,?,?,?,?)',
        [decoded.id, decoded.email, decoded.name || 'User', 'jwt-recovery', decoded.tier || 'free', 1]
      )
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
