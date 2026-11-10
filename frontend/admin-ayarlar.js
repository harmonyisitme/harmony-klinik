
import {
    API_URL,
    checkAuth,
    showToast,
    initLogout,
    initDarkMode,
    initPageTransitions
} from './utils.js';

let mevcutHizmetler = [];
let secilenHizmetIndex = null;

const iconLibrary = [
    'fa-solid fa-ear-listen',
    'fa-solid fa-ear-deaf',
    'fa-solid fa-baby',
    'fa-solid fa-bell',
    'fa-solid fa-user-doctor',
    'fa-solid fa-stethoscope',
    'fa-solid fa-heart-pulse',
    'fa-solid fa-hospital',
    'fa-solid fa-notes-medical',
    'fa-solid fa-file-medical',
    'fa-solid fa-calendar-check',
    'fa-solid fa-phone',
    'fa-solid fa-envelope',
    'fa-solid fa-location-dot',
    'fa-solid fa-circle-info',
    'fa-solid fa-check',
    'fa-solid fa-star',
    'fa-solid fa-comment-medical',
    'fa-solid fa-hand-holding-medical',
    'fa-solid fa-brain',
    'fa-solid fa-tooth',
    'fa-solid fa-eye',
    'fa-solid fa-lungs',
    'fa-solid fa-dna',
    'fa-solid fa-syringe',
    'fa-solid fa-pills',
    'fa-solid fa-microscope',
    'fa-solid fa-user-nurse',
    'fa-solid fa-wheelchair',
    'fa-solid fa-crutch',
    'fa-solid fa-x-ray',
    'fa-solid fa-kit-medical'
];

// Güvenli input doldurma
function alanDoldur(id, deger) {
    const eleman = document.getElementById(id);
    if (eleman) eleman.value = deger ?? '';
}

// Görsel önizleme
function gorselOnizleme(id, url) {
    const alan = document.getElementById(id);
    if (!alan || !url) return;

    const img = alan.querySelector('img');

    if (img) {
        img.src = url;
        alan.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();

    await ayarlariGetir();

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('iconModal');
        if (modal && e.target === modal) {
            modal.style.display = 'none';
        }
    });

    const btnSesTest = document.getElementById('btnSesTest');

    if (btnSesTest) {
        btnSesTest.addEventListener('click', () => {
            const ses = document.getElementById('bildirimSesi')?.value;

            if (ses === 'mute') return;

            let url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

            if (ses === 'soft') {
                url = 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3';
            }

            if (ses === 'alert') {
                url = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';
            }

            new Audio(url).play().catch(() => {
                alert('Ses çalınamadı.');
            });
        });
    }

    initLogout();
    initDarkMode();
    initPageTransitions();

    const form = document.getElementById('ayarlarFormu');

    if (form) {
        form.addEventListener('submit', ayarlariKaydet);
    }

    const btnHizmetEkle = document.getElementById('btnHizmetEkle');

    if (btnHizmetEkle) {
        btnHizmetEkle.addEventListener('click', () => {
            verileriSenkronizeEt();

            mevcutHizmetler.push({
                baslik: '',
                ikon: '',
                ozet: '',
                key: 'new-' + Date.now(),
                detay: '<p>Detaylar yakında...</p>'
            });

            hizmetleriListele();
        });
    }
});

// Yönetim modülleri
function modulKartlariniEkle() {
    const mainContainer = document.querySelector('.admin-container');
    if (!mainContainer) return;

    const modulesHTML = `
        <div class="admin-modules">
            <a href="admin.html" class="module-card">
                <div class="icon">📅</div>
                <h3>Randevu Listesi</h3>
                <p>Randevu taleplerini yönetin.</p>
            </a>
            <a href="admin-takvim.html" class="module-card">
                <div class="icon">🗓️</div>
                <h3>Takvim Görünümü</h3>
                <p>Randevuları takvimde görün.</p>
            </a>
            <a href="admin-hastalar.html" class="module-card">
                <div class="icon">👥</div>
                <h3>Hastalar</h3>
                <p>Kayıtlı hastaları görüntüleyin.</p>
            </a>
            <a href="admin-blog.html" class="module-card">
                <div class="icon">✍️</div>
                <h3>Blog Yönetimi</h3>
                <p>Blog yazılarını düzenleyin.</p>
            </a>
            <a href="admin-medya.html" class="module-card">
                <div class="icon">📷</div>
                <h3>Medya Galeri</h3>
                <p>Görselleri yönetin.</p>
            </a>
            <a href="admin-urunler.html" class="module-card">
                <div class="icon">📦</div>
                <h3>Ürün Yönetimi</h3>
                <p>Ürünleri ve stokları yönetin.</p>
            </a>
            <a href="admin-ayarlar.html" class="module-card active">
                <div class="icon">⚙️</div>
                <h3>Site Ayarları</h3>
                <p>İletişim ve hizmetleri güncelleyin.</p>
            </a>
        </div>
    `;

    const headerAction = document.querySelector('.header-action');

    if (headerAction) {
        headerAction.insertAdjacentHTML('beforebegin', modulesHTML);
    } else {
        mainContainer.insertAdjacentHTML('afterbegin', modulesHTML);
    }
}

// AYARLARI SUNUCUDAN GETİR
async function ayarlariGetir() {
    try {
        const response = await fetch(`${API_URL}/site-ayarlari`);

        if (!response.ok) {
            throw new Error('Ayarlar sunucudan alınamadı. HTTP: ' + response.status);
        }

        const ayarlar = await response.json();

        console.log('Sunucudan gelen site ayarları:', ayarlar);

        // Logo
        alanDoldur('mevcutLogoUrl', ayarlar.logo);
        gorselOnizleme('logoOnizleme', ayarlar.logo);

        // Favicon
        alanDoldur('mevcutFaviconUrl', ayarlar.favicon);
        gorselOnizleme('faviconOnizleme', ayarlar.favicon);

        // Ana sayfa görseli
        alanDoldur('mevcutHeroUrl', ayarlar.heroGorsel);
        gorselOnizleme('heroOnizleme', ayarlar.heroGorsel);

        // Renkler
        alanDoldur('anaRenk', ayarlar.anaRenk || '#a61d21');
        alanDoldur('ikincilRenk', ayarlar.ikincilRenk || '#a61a21');

        // Hakkımızda
        const hakkimizda = ayarlar.hakkimizda || {};

        alanDoldur('hakkimizdaBaslik', hakkimizda.baslik);
        alanDoldur('hakkimizdaIcerik', hakkimizda.icerik);
        alanDoldur('mevcutHakkimizdaUrl', hakkimizda.gorsel);

        gorselOnizleme('hakkimizdaOnizleme', hakkimizda.gorsel);

        // Yasal metinler
        const yasal = ayarlar.yasalMetinler || {};

        alanDoldur('gizlilikPolitikasi', yasal.gizlilikPolitikasi);
        alanDoldur('kullanimSartlari', yasal.kullanimSartlari);
        alanDoldur('kvkkMetni', yasal.kvkkMetni);

        // İletişim
        const iletisim = ayarlar.iletisim || {};

        alanDoldur('telefon', iletisim.telefon);
        alanDoldur('email', iletisim.email);
        alanDoldur('adres', iletisim.adres);
        alanDoldur('haritaEmbed', ayarlar.haritaEmbed);

        // Çalışma saatleri
        const saatler = ayarlar.calismaSaatleri || {};

        alanDoldur('haftaici', saatler.haftaici);
        alanDoldur('cumartesi', saatler.cumartesi);
        alanDoldur('pazar', saatler.pazar);

        // Sosyal medya
        const sm = ayarlar.sosyalMedya || {};

        alanDoldur('sm-facebook', sm.facebook);
        alanDoldur('sm-twitter', sm.twitter);
        alanDoldur('sm-instagram', sm.instagram);
        alanDoldur('sm-linkedin', sm.linkedin);

        // Hizmetler
        mevcutHizmetler = Array.isArray(ayarlar.hizmetler)
            ? ayarlar.hizmetler
            : [];

        hizmetleriListele();

        // Bildirim sesi
        alanDoldur(
            'bildirimSesi',
            localStorage.getItem('notificationSound') || 'default'
        );

    } catch (error) {
        console.error('Ayarlar yüklenemedi:', error);
        alert('Site ayarları yüklenemedi: ' + error.message);
    }
}

// DOSYA YÜKLEME
async function uploadFile(fileInput, currentUrl) {
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        return currentUrl;
    }

    const formData = new FormData();
    formData.append('dosya', fileInput.files[0]);

    // API_URL zaten /api ile bitiyor.
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            'x-auth-token': localStorage.getItem('ranaToken')
        },
        body: formData
    });

    const sonuc = await response.json();

    if (!response.ok) {
        throw new Error(sonuc.mesaj || sonuc.hata || 'Dosya yüklenemedi.');
    }

    return sonuc.url;
}

// AYARLARI KAYDET
async function ayarlariKaydet(e) {
    e.preventDefault();

    const btn = document.querySelector('.btn-save');

    if (!btn) return;

    btn.disabled = true;
    btn.innerText = 'Kaydediliyor...';

    try {
        const email = document.getElementById('email')?.value || '';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            alert('Geçersiz e-posta adresi. Lütfen kontrol ediniz.');
            return;
        }

        const bildirimSesi = document.getElementById('bildirimSesi');

        if (bildirimSesi) {
            localStorage.setItem('notificationSound', bildirimSesi.value);
        }

        // Hizmet verilerini al
        const guncelHizmetler = mevcutHizmetler.map((h, index) => ({
            ...h,
            baslik: document.getElementById(`hizmet-baslik-${index}`)?.value ?? h.baslik ?? '',
            ikon: document.getElementById(`hizmet-ikon-${index}`)?.value ?? h.ikon ?? '',
            ozet: document.getElementById(`hizmet-ozet-${index}`)?.value ?? h.ozet ?? ''
        }));

        // Harita bağlantısını düzenle
        let haritaDegeri = document.getElementById('haritaEmbed')?.value || '';

        if (haritaDegeri.includes('<iframe')) {
            const match = haritaDegeri.match(/src=["']([^"']+)["']/);

            if (match) {
                haritaDegeri = match[1];
            }
        }

        // Mevcut görselleri koruyarak verileri hazırla
        const veri = {
            logo: await uploadFile(
                document.getElementById('logoDosya'),
                document.getElementById('mevcutLogoUrl')?.value || ''
            ),

            favicon: await uploadFile(
                document.getElementById('faviconDosya'),
                document.getElementById('mevcutFaviconUrl')?.value || ''
            ),

            heroGorsel: await uploadFile(
                document.getElementById('heroDosya'),
                document.getElementById('mevcutHeroUrl')?.value || ''
            ),

            anaRenk: document.getElementById('anaRenk')?.value || '#a61d21',
            ikincilRenk: document.getElementById('ikincilRenk')?.value || '#a61a21',

            haritaEmbed: haritaDegeri,

            hakkimizda: {
                baslik: document.getElementById('hakkimizdaBaslik')?.value || '',
                icerik: document.getElementById('hakkimizdaIcerik')?.value || '',
                gorsel: await uploadFile(
                    document.getElementById('hakkimizdaDosya'),
                    document.getElementById('mevcutHakkimizdaUrl')?.value || ''
                )
            },

            yasalMetinler: {
                gizlilikPolitikasi: document.getElementById('gizlilikPolitikasi')?.value || '',
                kullanimSartlari: document.getElementById('kullanimSartlari')?.value || '',
                kvkkMetni: document.getElementById('kvkkMetni')?.value || ''
            },

            iletisim: {
                telefon: document.getElementById('telefon')?.value || '',
                email: email,
                adres: document.getElementById('adres')?.value || ''
            },

            calismaSaatleri: {
                haftaici: document.getElementById('haftaici')?.value || '',
                cumartesi: document.getElementById('cumartesi')?.value || '',
                pazar: document.getElementById('pazar')?.value || ''
            },

            sosyalMedya: {
                facebook: document.getElementById('sm-facebook')?.value || '',
                twitter: document.getElementById('sm-twitter')?.value || '',
                instagram: document.getElementById('sm-instagram')?.value || '',
                linkedin: document.getElementById('sm-linkedin')?.value || ''
            },

            hizmetler: guncelHizmetler
        };

        const response = await fetch(`${API_URL}/site-ayarlari`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': localStorage.getItem('ranaToken')
            },
            body: JSON.stringify(veri)
        });

        const sonuc = await response.json();

        if (!response.ok) {
            throw new Error(sonuc.hata || sonuc.mesaj || 'Ayarlar kaydedilemedi.');
        }

        alert('Ayarlar başarıyla güncellendi!');

    } catch (error) {
        console.error('Ayar kaydetme hatası:', error);
        alert('Hata: ' + error.message);

    } finally {
        btn.disabled = false;
        btn.innerText = 'Ayarları Kaydet';
    }
}

// HİZMETLERİ LİSTELE
function hizmetleriListele() {
    const container = document.getElementById('hizmetlerContainer');

    if (!container) return;

    container.innerHTML = '';

    mevcutHizmetler.forEach((hizmet, index) => {
        const div = document.createElement('div');
        div.className = 'service-item';

        div.innerHTML = `
            <div class="form-row" style="margin-bottom: 10px;">
                <input
                    type="text"
                    id="hizmet-baslik-${index}"
                    placeholder="Başlık"
                >

                <div style="display: flex; gap: 10px; align-items: center;">
                    <div
                        id="ikon-onizleme-${index}"
                        style="width: 30px; text-align: center; font-size: 20px; color: #0f3460;"
                    ></div>

                    <input
                        type="text"
                        id="hizmet-ikon-${index}"
                        placeholder="İkon Sınıfı"
                        readonly
                        style="flex: 1; background-color: #f9f9f9; cursor: pointer;"
                        onclick="ikonSecModalAc(${index})"
                    >

                    <button
                        type="button"
                        onclick="ikonSecModalAc(${index})"
                        style="background: #6c757d; color: white; border: none; padding: 0 15px; border-radius: 5px; cursor: pointer; height: 100%;"
                    >Seç</button>
                </div>
            </div>

            <textarea
                id="hizmet-ozet-${index}"
                rows="2"
                placeholder="Özet Açıklama"
            ></textarea>

            <button
                type="button"
                onclick="hizmetSil(${index})"
                style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 5px;"
            >Sil</button>
        `;

        container.appendChild(div);

        alanDoldur(`hizmet-baslik-${index}`, hizmet.baslik);
        alanDoldur(`hizmet-ikon-${index}`, hizmet.ikon);
        alanDoldur(`hizmet-ozet-${index}`, hizmet.ozet);

        if (hizmet.ikon) {
            const onizleme = document.getElementById(`ikon-onizleme-${index}`);

            if (onizleme) {
                onizleme.innerHTML = `<i class="${hizmet.ikon}"></i>`;
            }
        }
    });
}

// HİZMETLERİ SENKRONİZE ET
function verileriSenkronizeEt() {
    mevcutHizmetler = mevcutHizmetler.map((h, index) => ({
        ...h,
        baslik: document.getElementById(`hizmet-baslik-${index}`)?.value ?? h.baslik ?? '',
        ikon: document.getElementById(`hizmet-ikon-${index}`)?.value ?? h.ikon ?? '',
        ozet: document.getElementById(`hizmet-ozet-${index}`)?.value ?? h.ozet ?? ''
    }));
}

// HİZMET SİL
window.hizmetSil = (index) => {
    if (!confirm('Bu hizmeti listeden kaldırmak istediğinize emin misiniz?')) {
        return;
    }

    verileriSenkronizeEt();
    mevcutHizmetler.splice(index, 1);
    hizmetleriListele();
};

// İKON SEÇİM MODALI
window.ikonSecModalAc = (index) => {
    secilenHizmetIndex = index;

    const modal = document.getElementById('iconModal');
    const grid = document.getElementById('iconGrid');

    if (!modal || !grid) return;

    grid.innerHTML = '';

    iconLibrary.forEach(iconClass => {
        const div = document.createElement('div');

        div.className = 'icon-item';

        div.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${iconClass.replace('fa-solid fa-', '')}</span>
        `;

        div.onclick = () => window.ikonSec(iconClass);

        grid.appendChild(div);
    });

    modal.style.display = 'block';
};

// İKON SEÇ
window.ikonSec = (iconClass) => {
    const ikonInput = document.getElementById(`hizmet-ikon-${secilenHizmetIndex}`);
    const ikonOnizleme = document.getElementById(`ikon-onizleme-${secilenHizmetIndex}`);
    const modal = document.getElementById('iconModal');

    if (ikonInput) ikonInput.value = iconClass;

    if (ikonOnizleme) {
        ikonOnizleme.innerHTML = `<i class="${iconClass}"></i>`;
    }

    if (modal) modal.style.display = 'none';
};
