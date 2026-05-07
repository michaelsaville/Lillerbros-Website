const nodemailer = require('nodemailer');
const config = require('./config');

function smtpConfigured() {
  return Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);
}

let cached = null;
function transporter() {
  if (!smtpConfigured()) return null;
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
  return cached;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function sendContactEmail({ to, fromName, fromEmail, message }) {
  if (!to) return { status: 'skipped', error: 'No recipient configured' };
  if (!smtpConfigured()) return { status: 'skipped', error: 'SMTP not configured' };

  const safeName = String(fromName || '').replace(/[\r\n]+/g, ' ').slice(0, 200);
  const safeEmail = String(fromEmail || '').replace(/[\r\n]+/g, ' ').slice(0, 200);

  const fromHeader = config.smtp.from || `"${config.company.name}" <${config.smtp.user}>`;
  const subject = `Website contact form: ${safeName}`;
  const text = `From: ${safeName} <${safeEmail}>\n\n${message}`;
  const html = `<p><strong>From:</strong> ${escapeHtml(safeName)} &lt;${escapeHtml(safeEmail)}&gt;</p>
<p style="white-space:pre-wrap;">${escapeHtml(message)}</p>`;

  try {
    await transporter().sendMail({
      from: fromHeader, to, subject, text, html,
      replyTo: safeEmail ? `"${safeName}" <${safeEmail}>` : undefined,
    });
    return { status: 'sent', error: '' };
  } catch (err) {
    return { status: 'failed', error: err.message || String(err) };
  }
}

module.exports = { sendContactEmail, smtpConfigured };
