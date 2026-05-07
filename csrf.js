const crypto = require('crypto');

// Per-session CSRF token, validated with constant-time compare. Mirrors the
// pattern used in GS-Graphics. No multipart routes here, so we don't need the
// per-route variant.
function csrfMiddleware(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const submitted = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  const expected = req.session.csrfToken;
  if (submitted.length !== expected.length) return reject(res);
  let ok = false;
  try { ok = crypto.timingSafeEqual(Buffer.from(submitted), Buffer.from(expected)); } catch { ok = false; }
  if (!ok) return reject(res);
  next();
}

function reject(res) {
  return res.status(403).send('Invalid CSRF token. Please reload the page and try again.');
}

module.exports = { csrfMiddleware };
