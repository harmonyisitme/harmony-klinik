const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const multer = require('multer');
const authMiddleware = require('./middleware/authMiddleware');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');

const app = express();

// Orta Katmanlar (Middleware)
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// --- RATE LIMITING (HIZ SINIRI) ---
// Giriş denemeleri için sınırlayıcı: 15 dakikada maksimum 5 deneme
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5, // Maksimum 5 istek
    message: { mesaj: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.' }
});

// --- DOSYA YÜKLEME AYARLARI (MULTER) ---
const uploadDir = path.join(__dirname, 'frontend', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Dosya ismini benzersiz yap: timestamp + orijinal uzantı
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB Boyut Sınırı
    fileFilter: function (req, file, cb) {
        // Sadece 'image/' ile başlayan mimetype'lara izin ver (tüm resim formatları)
        if (file.mimetype.startsWith('image/')) {
            return cb(null, true);
        } else {
            cb(new Error('Güvenlik Uyarısı: Yalnızca resim dosyaları yüklenebilir!'));
        }
    }
});

// Dosya Yükleme Rotası
app.post('/api/upload', authMiddleware, (req, res) => {
    upload.single('dosya')(req, res, function (err) {
        if (err) {
            // Multer veya dosya türü hatası
            return res.status(400).json({ mesaj: err.message });
        }
        if (!req.file) return res.status(400).json({ mesaj: 'Dosya seçilmedi.' });
        
        res.status(200).json({ url: `/uploads/${req.file.filename}` });
    });
});

// API Rotaları
app.use('/api/randevular', require('./routes/randevuRoutes'));
app.use('/api/auth', loginLimiter, require('./routes/authRoutes')); // Giriş rotasına sınırlayıcıyı uygula
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/site-ayarlari', require('./routes/siteRoutes'));
app.use('/api/hastalar', require('./routes/hastaRoutes'));
app.use('/api/iletisim', require('./routes/iletisimRoutes'));
app.use('/api/urunler', require('./routes/urunRoutes'));
app.use('/api/medya', require('./routes/medyaRoutes'));

// Test Rotası (Ana sayfa artık frontend olacağı için bu rotayı değiştirdik)
app.get('/api-durum', (req, res) => {
    res.send('Rana Klinik Backend Sunucusu Çalışıyor! 🚀');
});

// Global Hata Yakalayıcı (En sonda olmalı)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ mesaj: 'Sunucu tarafında beklenmedik bir hata oluştu.' });
});

const PORT = process.env.PORT || 5501;

// Veritabanına bağlan, ardından sunucuyu başlat
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Veritabanı başarıyla senkronize edildi.');
        app.listen(PORT, () => {
            console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı. 🚀`);
            console.log(`Uygulamayı tarayıcıda açmak için tıklayın: http://localhost:${PORT}`);
        });
    }).catch(error => {
        console.error('❌ Sunucu başlatılamadı! Veritabanı bağlantı hatası:', error);
    });