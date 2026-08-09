const express = require('express');
const router = express.Router();
const { urunEkle, urunleriGetir, urunGetirById, urunGuncelle, urunSil } = require('../controllers/urunController');
const authMiddleware = require('../middleware/authMiddleware');

// Herkese açık ürün listeleme ve tekil ürün getirme rotaları
router.get('/', urunleriGetir);
router.get('/:id', urunGetirById);

// Admin yetkisi gerektiren rotalar
router.post('/', authMiddleware, urunEkle);
router.put('/:id', authMiddleware, urunGuncelle);
router.delete('/:id', authMiddleware, urunSil);

module.exports = router;
