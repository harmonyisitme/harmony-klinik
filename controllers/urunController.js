const Urun = require('../models/Urun');

// 1. Yeni Ürün Ekle (Admin Paneli İçin)
const urunEkle = async (req, res) => {
    try {
        const yeniUrun = await Urun.create(req.body);
        res.status(201).json({ mesaj: 'Ürün başarıyla eklendi!', veri: yeniUrun });
    } catch (error) {
        res.status(500).json({ mesaj: 'Ürün eklenirken bir hata oluştu.', hata: error.message });
    }
};

// 2. Tüm Ürünleri Getir (Hem site hem admin için)
const urunleriGetir = async (req, res) => {
    try {
        const urunler = await Urun.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({ veri: urunler });
    } catch (error) {
        res.status(500).json({ mesaj: 'Ürünler getirilirken bir hata oluştu.', hata: error.message });
    }
};

// 2.5 Tek bir ürünü ID ile getir (Verimlilik için eklendi)
const urunGetirById = async (req, res) => {
    try {
        const { id } = req.params;
        const urun = await Urun.findByPk(id);
        if (!urun) {
            return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
        }
        res.status(200).json({ veri: urun });
    } catch (error) {
        res.status(500).json({ mesaj: 'Ürün getirilirken bir hata oluştu.', hata: error.message });
    }
};
// 3. Ürünü Güncelle
const urunGuncelle = async (req, res) => {
    try {
        const { id } = req.params;
        const urun = await Urun.findByPk(id);
        if (!urun) {
            return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
        }
        const guncelUrun = await urun.update(req.body);
        res.status(200).json({ mesaj: 'Ürün başarıyla güncellendi.', veri: guncelUrun });
    } catch (error) {
        res.status(500).json({ mesaj: 'Ürün güncellenirken bir hata oluştu.', hata: error.message });
    }
};

// 4. Ürünü Sil
const urunSil = async (req, res) => {
    try {
        const { id } = req.params;
        const urun = await Urun.findByPk(id);
        if (!urun) {
            return res.status(404).json({ mesaj: 'Ürün bulunamadı.' });
        }
        await urun.destroy();
        res.status(200).json({ mesaj: 'Ürün başarıyla silindi.' });
    } catch (error) {
        res.status(500).json({ mesaj: 'Ürün silinirken bir hata oluştu.', hata: error.message });
    }
};

module.exports = {
    urunEkle,
    urunleriGetir,
    urunGetirById,
    urunGuncelle,
    urunSil
};
