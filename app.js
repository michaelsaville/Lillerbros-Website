const express = require('express');
const session = require('express-session');
const helmet  = require('helmet');
const path    = require('path');
const config  = require('./config');
const { csrfMiddleware } = require('./csrf');

const app = express();

// nginx terminates TLS in front of us
app.set('trust proxy', 1);

// Security headers — CSP allows Google Maps iframe + data: images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   ["'self'", "'unsafe-inline'"],
      styleSrc:    ["'self'", "'unsafe-inline'"],
      imgSrc:      ["'self'", "data:", "https:"],
      fontSrc:     ["'self'", "data:"],
      frameSrc:    ["https://maps.google.com", "https://www.google.com"],
      connectSrc:  ["'self'"],
      objectSrc:   ["'none'"],
      baseUri:     ["'self'"],
      formAction:  ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,  // we embed Google Maps which doesn't send CORP
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static
app.use(express.static(path.join(__dirname, 'public')));

// Body parsing (urlencoded only — no file uploads)
app.use(express.urlencoded({ extended: false, limit: '64kb' }));

// Sessions (used by CSRF + rate limit)
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,  // 1 day
  },
}));

// CSRF after session/body so token + body are in scope
app.use(csrfMiddleware);

// Template globals
app.use((req, res, next) => {
  res.locals.company = config.company;
  res.locals.baseUrl = config.baseUrl;
  res.locals.flash   = req.session.flash || null;
  res.locals.path    = req.path;
  delete req.session.flash;
  next();
});

// Routes
app.use('/', require('./routes/site'));
app.use('/', require('./routes/contact'));

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// 500 — generic message in production
app.use((err, req, res, next) => {
  console.error(err.stack);
  const isProd = process.env.NODE_ENV === 'production';
  res.status(500).render('error', {
    title: 'Server Error',
    error: isProd ? 'Something went wrong. Please try again or contact us if the problem persists.' : (err.message || 'Server error'),
  });
});

app.listen(config.port, () => {
  console.log(`Lillerbros website running on port ${config.port}`);
  console.log(`Base URL: ${config.baseUrl}`);
});
