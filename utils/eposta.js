// Basit e-posta gönderici (ek paket gerektirmez).
// Gmail SMTP (smtp.gmail.com:465, SSL) ile "Uygulama şifresi" kullanarak gönderir.
//
// Gerekli ortam değişkenleri:
//   SMTP_USER        Gönderen Gmail adresi (ör. ankararanaisitme@gmail.com)
//   SMTP_PASS        Bu hesabın 16 haneli Google "Uygulama şifresi"
// İsteğe bağlı:
//   BILDIRIM_EPOSTA  Bildirimin gideceği adres(ler), virgülle ayrılabilir (varsayılan: SMTP_USER)
//   SMTP_HOST        Varsayılan: smtp.gmail.com
//   SMTP_PORT        Varsayılan: 465
const tls = require('tls');

function b64(metin) {
    return Buffer.from(String(metin), 'utf8').toString('base64');
}

function satirlaraBol(metin) {
    return metin.replace(/.{1,76}/g, '$&\r\n');
}

function epostaAyarliMi() {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function smtpGonder({ host, port, kullanici, sifre, gonderen, alicilar, hamMesaj }) {
    return new Promise((resolve, reject) => {
        const soket = tls.connect({ host, port, servername: host });
        soket.setEncoding('utf8');
        soket.setTimeout(20000, () => {
            soket.destroy();
            reject(new Error('SMTP zaman aşımı'));
        });

        let tampon = '';
        const bekleyenler = [];

        soket.on('data', (parca) => {
            tampon += parca;
            // Çok satırlı yanıtlar "250-..." ile devam eder, "250 ..." ile biter
            let satirSonu;
            while ((satirSonu = tampon.indexOf('\r\n')) !== -1) {
                const satir = tampon.slice(0, satirSonu);
                tampon = tampon.slice(satirSonu + 2);
                if (/^\d{3} /.test(satir) && bekleyenler.length) {
                    bekleyenler.shift()(satir);
                }
            }
        });
        soket.on('error', reject);

        const yanit = () => new Promise((r) => bekleyenler.push(r));
        const komut = async (metin, beklenen) => {
            if (metin !== null) soket.write(metin + '\r\n');
            const satir = await yanit();
            const kod = satir.slice(0, 3);
            if (!beklenen.includes(kod)) {
                throw new Error(`SMTP beklenmeyen yanıt: ${satir}`);
            }
            return satir;
        };

        (async () => {
            await komut(null, ['220']);
            await komut('EHLO ranaisitme.com.tr', ['250']);
            await komut('AUTH LOGIN', ['334']);
            await komut(b64(kullanici), ['334']);
            await komut(b64(sifre), ['235']);
            await komut(`MAIL FROM:<${gonderen}>`, ['250']);
            for (const alici of alicilar) {
                await komut(`RCPT TO:<${alici}>`, ['250', '251']);
            }
            await komut('DATA', ['354']);
            // Nokta ile başlayan satırları kaçır
            const govde = hamMesaj.replace(/\r\n\./g, '\r\n..');
            await komut(govde + '\r\n.', ['250']);
            soket.write('QUIT\r\n');
            soket.end();
            resolve();
        })().catch((hata) => {
            soket.destroy();
            reject(hata);
        });
    });
}

async function epostaGonder({ konu, metin }) {
    if (!epostaAyarliMi()) {
        throw new Error('E-posta ayarları (SMTP_USER / SMTP_PASS) tanımlı değil');
    }
    const kullanici = process.env.SMTP_USER;
    const alicilar = (process.env.BILDIRIM_EPOSTA || kullanici)
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

    const basliklar = [
        `From: =?UTF-8?B?${b64('Rana İşitme Web Sitesi')}?= <${kullanici}>`,
        `To: ${alicilar.join(', ')}`,
        `Subject: =?UTF-8?B?${b64(konu)}?=`,
        `Date: ${new Date().toUTCString()}`,
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64'
    ];
    const hamMesaj = basliklar.join('\r\n') + '\r\n\r\n' + satirlaraBol(b64(metin)).trimEnd();

    await smtpGonder({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT || 465),
        kullanici,
        sifre: process.env.SMTP_PASS.replace(/\s+/g, ''),
        gonderen: kullanici,
        alicilar,
        hamMesaj
    });
}

module.exports = { epostaGonder, epostaAyarliMi };
