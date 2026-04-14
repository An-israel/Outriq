import jwt from 'jsonwebtoken'
import { getOne } from '../db.js'

export function verifyToken(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Ensure user actually exists in current DB instance (Vercel /tmp can reset)
    const user = getOne('SELECT id, email, name, tier FROM users WHERE id = ?', [decoded.id])
    if (!user) return res.status(401).json({ error: 'Session expired — please log in again' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
