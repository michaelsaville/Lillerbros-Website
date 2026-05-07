require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT) || 3500,
  baseUrl: process.env.BASE_URL || 'http://localhost:3500',
  sessionSecret: process.env.SESSION_SECRET || 'changeme-in-production',

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },

  contactEmail: process.env.CONTACT_EMAIL || '',

  // Current published pricing — owner edits these and rebuilds.
  // Keep dates in ISO (YYYY-MM-DD); the view formats for humans.
  pricing: {
    asphaltPerTon: 80,
    lastUpdated: '2026-05-07',
  },

  // Static company info — change here, no DB.
  company: {
    name: 'Liller Brothers Paving',
    tagline: 'Asphalt paving, sealcoating, and pavement maintenance — PA, MD & WV',
    phone: '301-729-0505',
    email: 'lillerbrothers@gmail.com',
    mailingAddress: 'P.O. Box 109, Pinto, MD 21556',
    plantAddress: '15313 McMullen Hwy SW, Cresaptown, MD 21502',
    facebookUrl: 'https://www.facebook.com/lillerbrothers',
  },
};
