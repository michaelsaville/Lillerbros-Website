# Lillerbros Website

Marketing site for **Liller Brothers Paving** (Cresaptown, MD).
Live at https://lillerbros.pcc2k.com.

## Stack
Node 20 / Express / EJS / nodemailer SMTP. No database — contact form submissions write to a JSONL log on disk and (if SMTP is configured) email the operator. Containerized via docker-compose; reverse-proxied through nginx on `100.91.194.83`.

## Quickstart

```bash
docker compose up -d --build
# http://localhost:3500
```

## Pages
- `/` — hero + service summary + CTA
- `/about` — about us
- `/services` — service descriptions + photo gallery
- `/contact` — phone/address/email + form

## Environment
See `.env.example`. Notable:
- `SMTP_*` — outbound email; if absent, the contact form still saves submissions to `logs/contact-submissions.jsonl`.
- `CONTACT_EMAIL` — where contact-form messages go.

## Layout
- `app.js` — Express bootstrap, helmet, sessions, CSRF
- `routes/site.js` — page routes
- `routes/contact.js` — contact-form POST + JSONL log
- `views/` — EJS templates
- `public/img/` — hero, logo, gallery
- `public/css/style.css` — asphalt-themed CSS
