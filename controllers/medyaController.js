
const cloudinary = require('cloudinary').v2;

// Cloudinary'deki görselleri listele
const dosyalariGetir = async (req, res) => {
    try {
        const sonuc = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'rana-isitme/urunler',
            max_results: 500,
            resource_type: 'image'
        });

        const dosyalar = sonuc.resources.map((dosya) => ({
            ad: dosya.public_id,
            url: dosya.secure_url,
            public_id: dosya.public_id
        }));

        res.status(200).json(dosyalar);

    } catch (error) {
        console.error('Cloudinary medya listeleme hatası:', error);
        res.status(500).json({
            mesaj: 'Görseller listelenemedi.'
        });
    }
};

// Cloudinary'den görsel sil
const dosyaSil = async (req, res) => {
    try {
        const publicId = req.params.dosyaAdi;

        if (!publicId || !publicId.startsWith('rana-isitme/urunler/')) {
            return res.status(400).json({
                mesaj: 'Geçersiz görsel bilgisi.'
            });
        }

        const sonuc = await cloudinary.uploader.destroy(publicId, {
            resource_type: 'image'
        });

        if (sonuc.result === 'ok') {
            return res.status(200).json({
                mesaj: 'Görsel başarıyla silindi.'
            });
        }

        return res.status(404).json({
            mesaj: 'Görsel bulunamadı.'
        });

    } catch (error) {
        console.error('Cloudinary görsel silme hatası:', error);
        res.status(500).json({
            mesaj: 'Görsel silinemedi.'
        });
    }
};

module.exports = {
    dosyalariGetir,
    dosyaSil
};
