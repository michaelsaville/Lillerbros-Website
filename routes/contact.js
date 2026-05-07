const express = require('express');
const rateLimit = require('express-rate-limit');
const fs      = require('fs');
const path    = require('path');
const router  = express.Router();
const config  = require('../config');
const { sendContactEmail } = require('../mailer');

// 5 contact submissions per IP per hour. Real customers send once.
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many submissions from this address. Please try again later.',
});

const LOG_PATH = path.join(__dirname, '..', 'logs', 'contact-submissions.jsonl');

function appendLog(record) {
  try {
    fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
    fs.appendFileSync(LOG_PATH, JSON.stringify(record) + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write contact log:', err.message);
  }
}

router.post('/contact', contactLimiter, async (req, res) => {
  // Honeypot — real users can't see this field
  if (req.body.website && String(req.body.website).trim() !== '') {
    return res.render('contact', { title: 'Thanks', submitted: true });
  }

  // Per-session rate limit (60s) on top of IP-based limit
  const now = Date.now();
  if (now - (req.session.lastContactSubmitAt || 0) < 60_000) {
    req.session.flash = { type: 'error', message: 'Please wait a moment before sending another message.' };
    return res.redirect('/contact');
  }

  const stripCRLF = (s) => String(s || '').replace(/[\r\n]+/g, ' ');
  const name    = stripCRLF(req.body.name).trim().slice(0, 200);
  const email   = stripCRLF(req.body.email).trim().slice(0, 200);
  const phone   = stripCRLF(req.body.phone).trim().slice(0, 50);
  const message = String(req.body.message || '').trim().slice(0, 5000);

  if (!name || !email || !message) {
    req.session.flash = { type: 'error', message: 'Please fill in name, email, and message.' };
    return res.redirect('/contact');
  }

  req.session.lastContactSubmitAt = now;

  // Always log first — never lose a submission even if SMTP fails
  const record = {
    received_at: new Date().toISOString(),
    name, email, phone, message,
    ip: req.ip,
    email_status: 'pending',
    email_error: '',
  };

  // Send via SMTP (best-effort)
  const sendBody = phone ? `Phone: ${phone}\n\n${message}` : message;
  const result = await sendContactEmail({
    to: config.contactEmail,
    fromName: name,
    fromEmail: email,
    message: sendBody,
  });
  record.email_status = result.status;
  record.email_error = result.error || '';
  appendLog(record);

  res.render('contact', { title: 'Thanks', submitted: true });
});

module.exports = router;
