const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Yönetici Girişi (POST /api/auth/login)
router.post('/login', (req, res) => {
    const { kullaniciAdi, sifre } = req.body;

    // Gelen bilgileri .env dosyasındaki bilgilerle karşılaştır
    if (kullaniciAdi === process.env.ADMIN_KULLANICI && sifre === process.env.ADMIN_SIFRE) {
        // Kullanıcı bilgileri doğruysa, JWT oluştur.
        const payload = { kullanici: kullaniciAdi, rol: 'admin' };
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ mesaj: 'Sunucu yapılandırma hatası: JWT anahtarı eksik.' });
        }
        const token = jwt.sign(payload, secret, { expiresIn: '1d' }); // Token 1 gün geçerli olacak
        res.status(200).json({ mesaj: 'Giriş başarılı!', token });
    } else {
        // Yanlışsa hata fırlat
        res.status(401).json({ mesaj: 'Kullanıcı adı veya şifre hatalı!' });
    }
});

module.exports = router;