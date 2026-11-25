const express = require('express');
const rateLimit = require('express-rate-limit');
const { geriAramaTalebi } = require('../controllers/geriAramaController');

const router = express.Router();

// Aynı yerden kısa sürede çok sayıda talep gönderilmesini engelle
const talepSiniri = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { mesaj: 'Çok fazla talep gönderildi. Lütfen bizi 0551 984 93 33 numarasından arayın.' }
});

router.post('/', talepSiniri, geriAramaTalebi);

module.exports = router;
