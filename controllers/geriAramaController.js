// "Sizi Arayalım" formu: ziyaretçi ad, telefon ve semt bırakır.
// Talep hem veritabanına (yönetim paneli > Mesajlar) kaydedilir
// hem de e-posta ile bildirilir. E-posta gönderilemese bile talep kaybolmaz.
const IletisimMesaji = require('../models/IletisimMesaji');
const { epostaGonder, epostaAyarliMi } = require('../utils/eposta');

function temizle(deger, uzunluk) {
    return String(deger || '')
        .replace(/[\r\n\t]+/g, ' ')
        .replace(/[<>]/g, '')
        .trim()
        .slice(0, uzunluk);
}

function telefonuDuzenle(ham) {
    let rakamlar = String(ham || '').replace(/\D/g, '');
    if (rakamlar.startsWith('90') && rakamlar.length === 12) rakamlar = rakamlar.slice(2);
    if (rakamlar.length === 10 && rakamlar.startsWith('5')) rakamlar = '0' + rakamlar;
    if (!/^0\d{10}$/.test(rakamlar)) return null;
    return `${rakamlar.slice(0, 4)} ${rakamlar.slice(4, 7)} ${rakamlar.slice(7, 9)} ${rakamlar.slice(9)}`;
}

const geriAramaTalebi = async (req, res) => {
    try {
        const govde = req.body || {};

        // Bot tuzağı: gerçek ziyaretçi bu gizli alanı doldurmaz
        if (govde.web_sitesi) {
            return res.status(201).json({ mesaj: 'Talebiniz alındı.' });
        }

        const adSoyad = temizle(govde.adSoyad, 80);
        const semt = temizle(govde.semt, 60);
        const sayfa = temizle(govde.sayfa, 200);
        const telefon = telefonuDuzenle(govde.telefon);

        if (adSoyad.length < 2) {
            return res.status(400).json({ mesaj: 'Lütfen adınızı ve soyadınızı yazın.' });
        }
        if (!telefon) {
            return res.status(400).json({ mesaj: 'Lütfen geçerli bir telefon numarası yazın (ör. 0532 123 45 67).' });
        }
        if (govde.kvkkOnay !== true) {
            return res.status(400).json({ mesaj: 'Devam etmek için aydınlatma metnini onaylayın.' });
        }

        const zaman = new Date().toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' });
        const metin = [
            'Web sitesinden yeni bir "Sizi Arayalım" talebi geldi.',
            '',
            `Ad Soyad : ${adSoyad}`,
            `Telefon  : ${telefon}`,
            `Semt     : ${semt || '-'}`,
            `Zaman    : ${zaman}`,
            `Sayfa    : ${sayfa || '-'}`,
            '',
            'Lütfen bu kişiyi en kısa sürede arayın.'
        ].join('\n');

        await IletisimMesaji.create({
            adSoyad,
            email: telefon,
            konu: `Sizi Arayalım talebi – ${telefon}`,
            mesaj: metin
        });

        if (epostaAyarliMi()) {
            try {
                await epostaGonder({
                    konu: `Yeni arama talebi: ${adSoyad} – ${telefon}`,
                    metin
                });
            } catch (hata) {
                console.error('❌ Geri arama e-postası gönderilemedi:', hata.message);
            }
        } else {
            console.warn('⚠️ SMTP_USER / SMTP_PASS tanımlı değil; geri arama talebi sadece panele kaydedildi.');
        }

        res.status(201).json({ mesaj: 'Talebiniz alındı. En kısa sürede sizi arayacağız.' });
    } catch (error) {
        console.error('❌ Geri arama talebi hatası:', error);
        res.status(500).json({ mesaj: 'Talebiniz şu anda alınamadı. Lütfen bizi 0551 984 93 33 numarasından arayın.' });
    }
};

module.exports = { geriAramaTalebi };
