/**
 * seed.js — Seeds initial services, one admin account, and three sample
 * stylists on first run. Skips everything if data already exists.
 */

const db      = require('./db')
const bcrypt  = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')

function seed() {
  // ── Admin ──────────────────────────────────────────────────────────────────
  const existingAdmin = db.prepare('SELECT id FROM admin WHERE id = ?').get('admin')
  if (!existingAdmin) {
    const username = process.env.ADMIN_USERNAME || 'admin'
    const password = process.env.ADMIN_PASSWORD || 'admin1234'
    const hash     = bcrypt.hashSync(password, 12)
    db.prepare('INSERT INTO admin (id, username, password_hash) VALUES (?,?,?)')
      .run('admin', username, hash)
    console.log(`[seed] Admin created  username="${username}"`)
  }

  // ── Services ───────────────────────────────────────────────────────────────
  const serviceCount = db.prepare('SELECT COUNT(*) AS n FROM services').get().n
  if (serviceCount === 0) {
    const services = [
      { id: 'svc-1', name: 'Signature Haircut',    description: 'Precision cut tailored to your face shape and style.',           price_inr: 4500, duration_min: 45, popular: 1 },
      { id: 'svc-2', name: 'Colour & Highlights',  description: 'Sun-kissed highlights or bold transformations.',                 price_inr: 7500, duration_min: 90, popular: 0 },
      { id: 'svc-3', name: 'Blowout & Style',      description: 'Luxury shampoo, nourishing treatment and flawless blowout.',    price_inr: 3500, duration_min: 40, popular: 0 },
      { id: 'svc-4', name: 'Deep Conditioning',    description: 'Intensive repair mask for stressed or colour-treated hair.',    price_inr: 2800, duration_min: 30, popular: 0 },
      { id: 'svc-5', name: 'Beard Trim & Shape',   description: 'Expert beard shaping with hot towel finish.',                   price_inr: 2200, duration_min: 25, popular: 0 },
      { id: 'svc-6', name: 'Scalp Treatment',      description: 'Relaxing scalp massage with nourishing serum.',                 price_inr: 3000, duration_min: 30, popular: 0 },
    ]
    const insertSvc = db.prepare(`
      INSERT INTO services (id, name, description, price_inr, duration_min, popular, active)
      VALUES (@id, @name, @description, @price_inr, @duration_min, @popular, 1)
    `)
    const insertMany = db.transaction((rows) => rows.forEach(r => insertSvc.run(r)))
    insertMany(services)
    console.log(`[seed] ${services.length} services created`)
  }

  // ── Stylists ───────────────────────────────────────────────────────────────
  const stylistCount = db.prepare('SELECT COUNT(*) AS n FROM stylists').get().n
  if (stylistCount === 0) {
    // Default PIN for all sample stylists is 1234 — change via admin panel
    const defaultPinHash = bcrypt.hashSync('1234', 10)
    const stylists = [
      { id: 'sty-1', name: 'Elena Vasquez', role: 'Senior Colourist',               avatar_initials: 'EV', pin_hash: defaultPinHash },
      { id: 'sty-2', name: 'Marcus Osei',   role: 'Master Stylist',                 avatar_initials: 'MO', pin_hash: defaultPinHash },
      { id: 'sty-3', name: 'Priya Nair',    role: 'Wellness & Treatment Specialist', avatar_initials: 'PN', pin_hash: defaultPinHash },
    ]
    const insertSty = db.prepare(`
      INSERT INTO stylists (id, name, role, pin_hash, avatar_initials, active)
      VALUES (@id, @name, @role, @pin_hash, @avatar_initials, 1)
    `)
    const insertMany = db.transaction((rows) => rows.forEach(r => insertSty.run(r)))
    insertMany(stylists)
    console.log(`[seed] ${stylists.length} stylists created  (default PIN: 1234)`)
  }
}

module.exports = seed
