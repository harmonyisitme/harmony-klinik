
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const multer = require('multer');
const authMiddleware = require('./middleware/authMiddleware');
const rateLimit = require('express-rate-limit');
const sequelize = require('./config/database');
const cloudinary = require('cloudinary').v2;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Cloudinary bağlantısı
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Giriş güvenliği
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        mesaj: 'Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.'
    }
});

// Görsel yükleme ayarları
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            return cb(null, true);
        }
        cb(new Error('Yalnızca resim dosyaları yüklenebilir!'));
    }
});

// Cloudinary'ye görsel gönderme
app.post('/api/upload', authMiddleware, (req, res) => {
    upload.single('dosya')(req, res, async function (err) {
        if (err) {
            return res.status(400).json({ mesaj: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ mesaj: 'Dosya seçilmedi.' });
        }

        if (
            !process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET
        ) {
            return res.status(500).json({
                mesaj: 'Görsel depolama ayarları eksik.'
            });
        }

        try {
            const sonuc = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'rana-isitme/urunler',
                        resource_type: 'image'
                    },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

            return res.status(200).json({
                url: sonuc.secure_url,
                public_id: sonuc.public_id
            });

        } catch (error) {
            console.error('Cloudinary yükleme hatası:', error);
            return res.status(500).json({
                mesaj: 'Görsel yüklenemedi. Lütfen tekrar deneyin.'
            });
        }
    });
});

// API rotaları
app.use('/api/randevular', require('./routes/randevuRoutes'));
app.use('/api/auth', loginLimiter, require('./routes/authRoutes'));
app.use('/api/blog', require('./routes/blogRoutes'));
app.use('/api/site-ayarlari', require('./routes/siteRoutes'));
app.use('/api/hastalar', require('./routes/hastaRoutes'));
app.use('/api/iletisim', require('./routes/iletisimRoutes'));
app.use('/api/urunler', require('./routes/urunRoutes'));
app.use('/api/medya', require('./routes/medyaRoutes'));

// Sunucu kontrol
app.get('/api-durum', (req, res) => {
    res.send('Rana Klinik Backend Sunucusu Çalışıyor!');
});

// Genel hata yakalayıcı
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        mesaj: 'Sunucu tarafında beklenmedik bir hata oluştu.'
    });
});

const PORT = process.env.PORT || 5501;

sequelize.sync({ alter: true })
    .then(() => {
        console.log('Veritabanı başarıyla senkronize edildi.');
        app.listen(PORT, () => {
            console.log(`Sunucu ${PORT} portunda başarıyla başlatıldı.`);
        });
    })
    .catch(error => {
        console.error('Sunucu başlatılamadı:', error);
    });
