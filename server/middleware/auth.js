import jwt from 'jsonwebtoken'
import supabase from '../db.js'

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

  // Best-effort: ensure user row exists in DB
  try {
    const { data } = await supabase.from('users').select('id').eq('id', req.user.id).maybeSingle()
    if (!data && req.user.email) {
      await supabase.from('users').delete().eq('email', req.user.email).neq('id', req.user.id)
      await supabase.from('users').upsert({
        id: req.user.id, email: req.user.email, name: req.user.name || 'User',
        password: 'jwt-recovery', tier: req.user.tier || 'free', email_verified: 1
      }, { onConflict: 'id' })
    }
  } catch {}

  next()
}
