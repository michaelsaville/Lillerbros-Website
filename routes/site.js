const express = require('express');
const fs      = require('fs');
const path    = require('path');
const config  = require('../config');
const router  = express.Router();

// Generate the gallery list at startup from public/img/gallery/.
// Files are pre-numbered 01.jpg..NN.jpg.
const galleryDir = path.join(__dirname, '..', 'public', 'img', 'gallery');
let GALLERY = [];
try {
  GALLERY = fs.readdirSync(galleryDir)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .sort()
    .map(f => `/img/gallery/${f}`);
} catch { /* gallery dir missing — fine */ }

router.get('/', (req, res) => {
  res.render('home', {
    title: 'Liller Brothers Paving — Asphalt, Sealcoating, Plowing',
    pricing: config.pricing,
  });
});

router.get('/about', (req, res) => {
  res.render('about', { title: 'About Us' });
});

router.get('/services', (req, res) => {
  res.render('services', {
    title: 'Services',
    gallery: GALLERY,
  });
});

router.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact Us', submitted: false });
});

module.exports = router;
