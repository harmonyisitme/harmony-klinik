import { API_URL, checkAuth, showToast, initLogout, initDarkMode, initPageTransitions } from './utils.js';

let mevcutHizmetler = [];
let secilenHizmetIndex = null; // Hangi hizmet için ikon seçildiğini takip eder

// Kullanılabilir İkon Kütüphanesi (FontAwesome)
const iconLibrary = [
    'fa-solid fa-ear-listen', 'fa-solid fa-ear-deaf', 'fa-solid fa-baby', 'fa-solid fa-bell',
    'fa-solid fa-user-doctor', 'fa-solid fa-stethoscope', 'fa-solid fa-heart-pulse', 'fa-solid fa-hospital',
    'fa-solid fa-notes-medical', 'fa-solid fa-file-medical', 'fa-solid fa-calendar-check', 'fa-solid fa-phone',
    'fa-solid fa-envelope', 'fa-solid fa-location-dot', 'fa-solid fa-circle-info', 'fa-solid fa-check',
    'fa-solid fa-star', 'fa-solid fa-comment-medical', 'fa-solid fa-hand-holding-medical', 'fa-solid fa-brain',
    'fa-solid fa-tooth', 'fa-solid fa-eye', 'fa-solid fa-lungs', 'fa-solid fa-dna',
    'fa-solid fa-syringe', 'fa-solid fa-pills', 'fa-solid fa-microscope', 'fa-solid fa-user-nurse',
    'fa-solid fa-wheelchair', 'fa-solid fa-crutch', 'fa-solid fa-x-ray', 'fa-solid fa-kit-medical'
];

document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    await ayarlariGetir();

    // İkon Modalını Kapatma (Dışına tıklayınca)
    window.addEventListener('click', (e) => {
        const iconModal = document.getElementById('iconModal');
        if (e.target == iconModal) iconModal.style.display = 'none';
    });

    // Ses Test Butonu
    const btnSesTest = document.getElementById('btnSesTest');
    if (btnSesTest) {
        btnSesTest.addEventListener('click', () => {
            const ses = document.getElementById('bildirimSesi').value;
            if (ses === 'mute') return;
            
            let url = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
            if (ses === 'soft') url = 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3';
            if (ses === 'alert') url = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';
            
            new Audio(url).play().catch(e => alert('Ses çalınamadı.'));
        });
    }

    initLogout();
    initDarkMode();
    initPageTransitions();
});

function modulKartlariniEkle() {
    const mainContainer = document.querySelector('.admin-container');
    if (!mainContainer) return;

    const modulesHTML = `
        <div class="admin-modules">
            <a href="admin.html" class="module-card">
                <div class="icon">📅</div><h3>Randevu Listesi</h3><p>Randevu taleplerini yönetin.</p>
            </a>
            <a href="admin-takvim.html" class="module-card">
                <div class="icon">🗓️</div><h3>Takvim Görünümü</h3><p>Randevuları takvimde görün.</p>
            </a>
            <a href="admin-hastalar.html" class="module-card">
                <div class="icon">👥</div><h3>Hastalar</h3><p>Kayıtlı hastaları görüntüleyin.</p>
            </a>
            <a href="admin-blog.html" class="module-card">
                <div class="icon">✍️</div><h3>Blog Yönetimi</h3><p>Blog yazılarını düzenleyin.</p>
            </a>
            <a href="admin-medya.html" class="module-card">
                <div class="icon">📷</div><h3>Medya Galeri</h3><p>Görselleri yönetin.</p>
            </a>
            <a href="admin-urunler.html" class="module-card">
                <div class="icon">📦</div><h3>Ürün Yönetimi</h3><p>Ürünleri ve stokları yönetin.</p>
            </a>
            <a href="admin-ayarlar.html" class="module-card active">
                <div class="icon">⚙️</div><h3>Site Ayarları</h3><p>İletişim ve hizmetleri güncelleyin.</p>
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

async function ayarlariGetir() {
    try {
        const response = await fetch(`${API_URL}/site-ayarlari`);
        const ayarlar = await response.json();

        // Logo
        document.getElementById('mevcutLogoUrl').value = ayarlar.logo || '';
        if (ayarlar.logo) {
            const onizleme = document.getElementById('logoOnizleme');
            onizleme.style.display = 'block';
            onizleme.querySelector('img').src = ayarlar.logo;
        }

        // Favicon
        document.getElementById('mevcutFaviconUrl').value = ayarlar.favicon || '';
        if (ayarlar.favicon) {
            const onizleme = document.getElementById('faviconOnizleme');
            onizleme.style.display = 'block';
            onizleme.querySelector('img').src = ayarlar.favicon;
        }

        // Hero Görsel
        document.getElementById('mevcutHeroUrl').value = ayarlar.heroGorsel || '';
        if (ayarlar.heroGorsel) {
            const heroOnizleme = document.getElementById('heroOnizleme');
            heroOnizleme.style.display = 'block';
            heroOnizleme.querySelector('img').src = ayarlar.heroGorsel;
        }

        // Ana Renk
        document.getElementById('anaRenk').value = ayarlar.anaRenk || '#0056b3';
        document.getElementById('ikincilRenk').value = ayarlar.ikincilRenk || '#e94560';

        // Hakkımızda
        const hakkimizda = ayarlar.hakkimizda || {};
        document.getElementById('hakkimizdaBaslik').value = hakkimizda.baslik || '';
        document.getElementById('hakkimizdaIcerik').value = hakkimizda.icerik || '';
        document.getElementById('mevcutHakkimizdaUrl').value = hakkimizda.gorsel || '';
        
        if (hakkimizda.gorsel) {
            const hOnizleme = document.getElementById('hakkimizdaOnizleme');
            hOnizleme.style.display = 'block';
            hOnizleme.querySelector('img').src = hakkimizda.gorsel;
        }

        // Yasal Metinler
        const yasal = ayarlar.yasalMetinler || {};
        document.getElementById('gizlilikPolitikasi').value = yasal.gizlilikPolitikasi || '';
        document.getElementById('kullanimSartlari').value = yasal.kullanimSartlari || '';
        document.getElementById('kvkkMetni').value = yasal.kvkkMetni || '';

        const iletisim = ayarlar.iletisim || { telefon: '', email: '', adres: '' };
        document.getElementById('telefon').value = iletisim.telefon || '';
        document.getElementById('email').value = iletisim.email || '';
        document.getElementById('adres').value = iletisim.adres || '';
        document.getElementById('haritaEmbed').value = ayarlar.haritaEmbed || '';

        const calismaSaatleri = ayarlar.calismaSaatleri || { haftaici: '', cumartesi: '', pazar: '' };
        document.getElementById('haftaici').value = calismaSaatleri.haftaici || '';
        document.getElementById('cumartesi').value = calismaSaatleri.cumartesi || '';
        document.getElementById('pazar').value = calismaSaatleri.pazar || '';

        // Sosyal Medya
        const sm = ayarlar.sosyalMedya || {};
        document.getElementById('sm-facebook').value = sm.facebook || '';
        document.getElementById('sm-twitter').value = sm.twitter || '';
        document.getElementById('sm-instagram').value = sm.instagram || '';
        document.getElementById('sm-linkedin').value = sm.linkedin || '';

        // Hizmetler
        mevcutHizmetler = Array.isArray(ayarlar.hizmetler) ? ayarlar.hizmetler : [];
        hizmetleriListele();

        // Bildirim Sesi (LocalStorage'dan çek)
        document.getElementById('bildirimSesi').value = localStorage.getItem('notificationSound') || 'default';
    } catch (error) {
        console.error('Ayarlar yüklenemedi', error);
    }
}

document.getElementById('ayarlarFormu').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.querySelector('.btn-save');
    btn.disabled = true;
    btn.innerText = 'Kaydediliyor...';

    // E-posta Doğrulama
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Geçersiz E-posta Adresi! Lütfen kontrol ediniz.');
        btn.disabled = false; btn.innerText = 'Ayarları Kaydet';
        return;
    }

    // Bildirim Sesini Kaydet (LocalStorage)
    localStorage.setItem('notificationSound', document.getElementById('bildirimSesi').value);

    // Dosya Yükleme İşlemleri (Refactor Edilmiş)
    const uploadFile = async (fileInput, currentUrl) => {
        if (fileInput.files.length === 0) return currentUrl;
        const formData = new FormData();
        formData.append('dosya', fileInput.files[0]);
        const response = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers: { 'x-auth-token': localStorage.getItem('ranaToken') }, body: formData });
        if (response.ok) return (await response.json()).url;
        return currentUrl;
    };

    // Hizmet verilerini formdan topla
    const guncelHizmetler = mevcutHizmetler.map((h, index) => ({
        ...h, // Eski verileri (detay, key) koru
        baslik: document.getElementById(`hizmet-baslik-${index}`).value,
        ikon: document.getElementById(`hizmet-ikon-${index}`).value,
        ozet: document.getElementById(`hizmet-ozet-${index}`).value
    }));

    // Harita Linkini Düzenle (iframe kodu yapıştırılırsa içinden src'yi al)
    let haritaDegeri = document.getElementById('haritaEmbed').value;
    if (haritaDegeri.includes('<iframe')) {
        const match = haritaDegeri.match(/src=["']([^"']+)["']/);
        if (match) {
            haritaDegeri = match[1];
        }
    }

    const veri = {
        logo: await uploadFile(document.getElementById('logoDosya'), document.getElementById('mevcutLogoUrl').value),
        favicon: await uploadFile(document.getElementById('faviconDosya'), document.getElementById('mevcutFaviconUrl').value),
        heroGorsel: await uploadFile(document.getElementById('heroDosya'), document.getElementById('mevcutHeroUrl').value),
        anaRenk: document.getElementById('anaRenk').value,
        ikincilRenk: document.getElementById('ikincilRenk').value,
        haritaEmbed: haritaDegeri,
        hakkimizda: {
            baslik: document.getElementById('hakkimizdaBaslik').value,
            icerik: document.getElementById('hakkimizdaIcerik').value,
            gorsel: await uploadFile(document.getElementById('hakkimizdaDosya'), document.getElementById('mevcutHakkimizdaUrl').value)
        },
        yasalMetinler: {
            gizlilikPolitikasi: document.getElementById('gizlilikPolitikasi').value,
            kullanimSartlari: document.getElementById('kullanimSartlari').value,
            kvkkMetni: document.getElementById('kvkkMetni').value
        },
        iletisim: {
            telefon: document.getElementById('telefon').value,
            email: document.getElementById('email').value,
            adres: document.getElementById('adres').value
        },
        calismaSaatleri: {
            haftaici: document.getElementById('haftaici').value,
            cumartesi: document.getElementById('cumartesi').value,
            pazar: document.getElementById('pazar').value
        },
        sosyalMedya: {
            facebook: document.getElementById('sm-facebook').value,
            twitter: document.getElementById('sm-twitter').value,
            instagram: document.getElementById('sm-instagram').value,
            linkedin: document.getElementById('sm-linkedin').value
        },
        hizmetler: guncelHizmetler
    };

    try {
        const response = await fetch(`${API_URL}/site-ayarlari`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('ranaToken') },
            body: JSON.stringify(veri)
        });

        if (response.ok) alert('Ayarlar başarıyla güncellendi!');
        else alert('Hata oluştu.');
    } catch (error) {
        alert('Sunucu hatası.');
    } finally { btn.disabled = false; btn.innerText = 'Ayarları Kaydet'; }
});

// --- YENİ EKLENEN FONKSİYONLAR ---

// Hizmetleri Ekrana Basan Fonksiyon
function hizmetleriListele() {
    const container = document.getElementById('hizmetlerContainer');
    container.innerHTML = '';

    mevcutHizmetler.forEach((hizmet, index) => {
        const div = document.createElement('div');
        div.className = 'service-item';
        div.innerHTML = `
            <div class="form-row" style="margin-bottom: 10px;">
                <input type="text" id="hizmet-baslik-${index}" placeholder="Başlık">
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div id="ikon-onizleme-${index}" style="width: 30px; text-align: center; font-size: 20px; color: #0f3460;"></div>
                    <input type="text" id="hizmet-ikon-${index}" placeholder="İkon Sınıfı" readonly style="flex: 1; background-color: #f9f9f9; cursor: pointer;" onclick="ikonSecModalAc(${index})">
                    <button type="button" onclick="ikonSecModalAc(${index})" style="background: #6c757d; color: white; border: none; padding: 0 15px; border-radius: 5px; cursor: pointer; height: 100%;">Seç</button>
                </div>
            </div>
            <textarea id="hizmet-ozet-${index}" rows="2" placeholder="Özet Açıklama"></textarea>
            <button type="button" onclick="hizmetSil(${index})" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 5px;">Sil</button>
        `;
        container.appendChild(div);

        // Verileri güvenli bir şekilde inputlara ata (Tırnak işareti sorununu önler)
        document.getElementById(`hizmet-baslik-${index}`).value = hizmet.baslik || '';
        document.getElementById(`hizmet-ikon-${index}`).value = hizmet.ikon || '';
        if (hizmet.ikon) {
            document.getElementById(`ikon-onizleme-${index}`).innerHTML = `<i class="${hizmet.ikon}"></i>`;
        }
        document.getElementById(`hizmet-ozet-${index}`).value = hizmet.ozet || '';
    });
}

// Mevcut Inputlardaki Verileri Array'e Kaydet (Ekle/Sil yaparken veri kaybını önler)
function verileriSenkronizeEt() {
    mevcutHizmetler = mevcutHizmetler.map((h, index) => ({
        ...h,
        baslik: document.getElementById(`hizmet-baslik-${index}`).value,
        ikon: document.getElementById(`hizmet-ikon-${index}`).value,
        ozet: document.getElementById(`hizmet-ozet-${index}`).value
    }));
}

// Yeni Hizmet Ekleme Butonu
document.getElementById('btnHizmetEkle').addEventListener('click', () => {
    verileriSenkronizeEt(); // Önce mevcut yazılanları kaydet
    // Yeni boş hizmet objesi ekle
    mevcutHizmetler.push({ baslik: '', ikon: '', ozet: '', key: 'new-' + Date.now(), detay: '<p>Detaylar yakında...</p>' });
    hizmetleriListele(); // Listeyi yeniden çiz
});

// Hizmet Silme Fonksiyonu
window.hizmetSil = (index) => {
    if(!confirm('Bu hizmeti listeden kaldırmak istediğinize emin misiniz?')) return;
    verileriSenkronizeEt();
    mevcutHizmetler.splice(index, 1);
    hizmetleriListele();
};

// --- İKON SEÇİM FONKSİYONLARI ---

window.ikonSecModalAc = (index) => {
    secilenHizmetIndex = index;
    const modal = document.getElementById('iconModal');
    const grid = document.getElementById('iconGrid');
    
    // İkonları oluştur (Sadece ilk açılışta veya her seferinde temizleyip)
    grid.innerHTML = '';
    iconLibrary.forEach(iconClass => {
        const div = document.createElement('div');
        div.className = 'icon-item';
        div.innerHTML = `<i class="${iconClass}"></i><span>${iconClass.replace('fa-solid fa-', '')}</span>`;
        div.onclick = () => ikonSec(iconClass);
        grid.appendChild(div);
    });

    modal.style.display = 'block';
};

window.ikonSec = (iconClass) => {
    document.getElementById(`hizmet-ikon-${secilenHizmetIndex}`).value = iconClass;
    document.getElementById(`ikon-onizleme-${secilenHizmetIndex}`).innerHTML = `<i class="${iconClass}"></i>`;
    document.getElementById('iconModal').style.display = 'none';
};
