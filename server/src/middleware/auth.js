/**
 * auth.js — Session-based authentication middleware
 */

function requireStaff(req, res, next) {
  if (req.session && req.session.stylistId) return next()
  return res.status(401).json({ error: 'Staff authentication required.' })
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) return next()
  return res.status(401).json({ error: 'Admin authentication required.' })
}

module.exports = { requireStaff, requireAdmin }
