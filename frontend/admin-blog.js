import { API_URL, checkAuth, showToast, initLogout, initDarkMode, initPageTransitions } from './utils.js';

let duzenlenecekId = null; // Düzenleme modunda olup olmadığımızı takip eder
let tumBloglar = []; // Blog verilerini tutar
let formDegisti = false; // Değişiklik takibi
let taslakModu = false; // Taslak mı yayın mı kontrolü

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    modulKartlariniEkle(); // Modül kartlarını dinamik olarak ekle
    listeAlaniOlustur(); // Listeyi göstereceğimiz HTML alanını yarat
    bloglariListele();   // Verileri çek

    // Form değişikliklerini izle
    document.getElementById('blogFormu').addEventListener('input', () => {
        formDegisti = true;
    });

    initLogout();
    initDarkMode();
    initPageTransitions();
});

// Buton Dinleyicileri
document.getElementById('btnTaslak').addEventListener('click', () => {
    taslakModu = true;
    // Form submit olayını manuel tetikle
    document.getElementById('blogFormu').dispatchEvent(new Event('submit'));
});

document.getElementById('btnYayinla').addEventListener('click', () => {
    taslakModu = false;
});

// Vazgeç Butonu
document.getElementById('btnVazgec').addEventListener('click', () => {
    if (formDegisti && !confirm('Değişiklikleriniz kaybolacak. Düzenlemeyi iptal etmek istiyor musunuz?')) {
        return;
    }
    duzenlemeModunuKapat();
});

function duzenlemeModunuKapat() {
    document.getElementById('blogFormu').reset();
    document.getElementById('mevcutGorselUrl').value = '';
    document.getElementById('gorselOnizleme').style.display = 'none';
    duzenlenecekId = null;
    formDegisti = false;
    document.getElementById('btnYayinla').innerText = 'Makaleyi Yayınla';
    document.getElementById('btnTaslak').innerText = 'Taslak Olarak Kaydet';
    document.getElementById('btnVazgec').style.display = 'none';
    document.getElementById('formBaslik').innerText = 'Yeni Blog Yazısı Ekle';
    document.getElementById('mesajKutusu').style.display = 'none';
}

// Sayfadan ayrılmaya çalışırsa uyarı ver
window.addEventListener('beforeunload', (e) => {
    if (formDegisti) {
        e.preventDefault();
        e.returnValue = '';
    }
});

document.getElementById('blogFormu').addEventListener('submit', async (e) => {
    e.preventDefault();

    const activeBtn = taslakModu ? document.getElementById('btnTaslak') : document.getElementById('btnYayinla');
    const orjinalBtnMetni = activeBtn.innerText;
    const mesajKutusu = document.getElementById('mesajKutusu');

    // Dosya Yükleme İşlemi
    let gorselUrl = document.getElementById('mevcutGorselUrl').value; // Varsayılan olarak mevcut olanı al
    const dosyaInput = document.getElementById('gorselDosya');

    if (dosyaInput.files.length > 0) {
        const formData = new FormData();
        formData.append('dosya', dosyaInput.files[0]);

        try {
            const uploadResponse = await fetch(`${API_URL}/upload`, { method: 'POST', headers: { 'x-auth-token': localStorage.getItem('ranaToken') }, body: formData });
            const uploadResult = await uploadResponse.json();
            if (uploadResponse.ok) gorselUrl = uploadResult.url;
        } catch (err) {
            console.error('Dosya yükleme hatası:', err);
        }
    }
    
    const blogVerisi = {
        baslik: document.getElementById('baslik').value,
        gorselUrl: gorselUrl || 'https://images.unsplash.com/photo-1599508704512-2f19efd1e35f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        yazar: document.getElementById('yazar').value,
        icerik: document.getElementById('icerik').value,
        yayinlandiMi: !taslakModu // Taslak ise false, yayınla ise true
    };

    // Butonu kilitle ve yükleniyor yap
    activeBtn.disabled = true;
    activeBtn.innerText = 'İşleniyor...';

    try {
        let url = `${API_URL}/blog`;
        let method = 'POST';

        // Eğer düzenleme modundaysak URL ve Method değişir
        if (duzenlenecekId) {
            url = `/api/blog/${duzenlenecekId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('ranaToken') },
            body: JSON.stringify(blogVerisi)
        });

        const veri = await response.json();

        if (response.ok) {
            duzenlemeModunuKapat(); // Formu ve UI'ı sıfırla
            mesajKutusu.style.display = 'block';
            mesajKutusu.style.backgroundColor = '#d4edda';
            mesajKutusu.style.color = '#155724';
            mesajKutusu.textContent = veri.mesaj;
            bloglariListele(); // Listeyi güncelle
        } else {
            throw new Error(veri.mesaj);
        }
    } catch (hata) {
        mesajKutusu.style.display = 'block';
        mesajKutusu.style.backgroundColor = '#f8d7da';
        mesajKutusu.style.color = '#721c24';
        mesajKutusu.textContent = 'İşlem sırasında hata oluştu: ' + hata.message;
    } finally {
        // İşlem bitince butonu eski haline getir
        activeBtn.disabled = false;
        activeBtn.innerText = orjinalBtnMetni;
    }
});

// --- YENİ EKLENEN FONKSİYONLAR ---

// Modül Kartlarını Dinamik Olarak Ekleyen Fonksiyon
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
            <a href="admin-blog.html" class="module-card active">
                <div class="icon">✍️</div><h3>Blog Yönetimi</h3><p>Blog yazılarını düzenleyin.</p>
            </a>
            <a href="admin-medya.html" class="module-card">
                <div class="icon">📷</div><h3>Medya Galeri</h3><p>Görselleri yönetin.</p>
            </a>
            <a href="admin-urunler.html" class="module-card">
                <div class="icon">📦</div><h3>Ürün Yönetimi</h3><p>Ürünleri ve stokları yönetin.</p>
            </a>
            <a href="admin-ayarlar.html" class="module-card">
                <div class="icon">⚙️</div><h3>Site Ayarları</h3><p>İletişim ve hizmetleri güncelleyin.</p>
            </a>
        </div>
    `;

    // Formun veya ana içeriğin öncesine ekle
    const formContainer = document.querySelector('.blog-form-container');
    if (formContainer) {
        formContainer.insertAdjacentHTML('beforebegin', modulesHTML);
    } else {
        mainContainer.insertAdjacentHTML('afterbegin', modulesHTML);
    }
}

// 1. Blog Listesi İçin HTML Alanı Oluştur
function listeAlaniOlustur() {
    const mainContainer = document.querySelector('.admin-container');
    const listeDiv = document.createElement('div');
    listeDiv.id = 'adminBlogListesi';
    listeDiv.style.marginTop = '40px';
    listeDiv.innerHTML = `
        <h2 style="margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Mevcut Blog Yazıları</h2>
        <div class="table-container">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8f9fa; text-align: left;">
                        <th style="padding: 12px;">Görsel</th>
                        <th style="padding: 12px;">Başlık</th>
                        <th style="padding: 12px;">Yazar</th>
                        <th style="padding: 12px;">Tarih</th>
                        <th style="padding: 12px;">Durum</th>
                        <th style="padding: 12px;">İşlemler</th>
                    </tr>
                </thead>
                <tbody id="blogTabloGovdesi"></tbody>
            </table>
        </div>
    `;
    mainContainer.appendChild(listeDiv);
}

// 2. Blogları Getir ve Listele
async function bloglariListele() {
    const tablo = document.getElementById('blogTabloGovdesi');
    tablo.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center;">Yükleniyor...</td></tr>';

    try {
        // Backend'den verileri çek (limit=100 diyerek son 100 yazıyı alıyoruz)
        // Cache (önbellek) sorununu önlemek için timestamp ekliyoruz
        const response = await fetch(`${API_URL}/blog?limit=100&admin=true&_t=${Date.now()}`);
        const sonuc = await response.json();
        tumBloglar = sonuc.veri;

        tablo.innerHTML = '';

        if (tumBloglar.length === 0) {
            tablo.innerHTML = '<tr><td colspan="5" style="padding:20px; text-align:center;">Henüz blog yazısı yok.</td></tr>';
            return;
        }

        tumBloglar.forEach(blog => {
            const tr = document.createElement('tr');
            
            // Durum etiketi
            const durumBadge = blog.yayinlandiMi 
                ? '<span class="status-badge" style="background:#d4edda; color:#155724;">Yayında</span>' 
                : '<span class="status-badge" style="background:#e2e3e5; color:#383d41;">Taslak</span>';

            tr.style.borderBottom = '1px solid #eee';
            tr.innerHTML = `
                <td style="padding: 12px;"><img src="${blog.gorselUrl}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;"></td>
                <td style="padding: 12px;">${blog.baslik}</td>
                <td style="padding: 12px;">${blog.yazar}</td>
                <td style="padding: 12px;">${new Date(blog.createdAt).toLocaleDateString('tr-TR')}</td>
                <td style="padding: 12px;">${durumBadge}</td>
                <td style="padding: 12px;">
                    <button onclick="duzenleModunaGec('${blog._id || blog.id}')" style="background: #ffc107; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">✏️</button>
                    <button onclick="blogSil('${blog._id || blog.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
                </td>
            `;
            tablo.appendChild(tr);
        });

    } catch (error) {
        console.error(error);
        tablo.innerHTML = '<tr><td colspan="5" style="color:red; text-align:center;">Veriler yüklenemedi.</td></tr>';
    }
}

// 3. Silme Fonksiyonu
window.blogSil = async (id) => {
    if (!confirm('Bu blog yazısını silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`${API_URL}/blog/${id}`, { method: 'DELETE', headers: { 'x-auth-token': localStorage.getItem('ranaToken') } });
        
        if (response.ok) {
            bloglariListele(); // Listeyi yenile
        } else {
            alert('Silme işlemi başarısız oldu. Sunucu hatası.');
        }
    } catch (error) {
        alert('Bağlantı hatası: Silinemedi.');
    }
};

// 4. Düzenleme Moduna Geç
window.duzenleModunaGec = (id) => {
    const blog = tumBloglar.find(b => String(b._id || b.id) === String(id));
    if (!blog) return;

    // Formu doldur
    document.getElementById('baslik').value = blog.baslik;
    
    // Görsel işlemleri
    document.getElementById('mevcutGorselUrl').value = blog.gorselUrl;
    const onizleme = document.getElementById('gorselOnizleme');
    onizleme.style.display = 'block';
    onizleme.querySelector('img').src = blog.gorselUrl;

    document.getElementById('yazar').value = blog.yazar;
    document.getElementById('icerik').value = blog.icerik;

    formDegisti = false; // Programatik doldurma sonrası değişikliği sıfırla

    // Modu güncelle
    duzenlenecekId = id;
    
    // Buton metnini değiştir ve yukarı kaydır
    document.getElementById('btnYayinla').innerText = 'Güncellemeyi Kaydet';
    document.getElementById('btnTaslak').innerText = 'Taslak Olarak Güncelle';
    document.getElementById('btnVazgec').style.display = 'block';
    document.getElementById('formBaslik').innerText = 'Blog Yazısını Düzenle';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Kullanıcıya bilgi ver
    const mesajKutusu = document.getElementById('mesajKutusu');
    mesajKutusu.style.display = 'block';
    mesajKutusu.style.backgroundColor = '#fff3cd';
    mesajKutusu.style.color = '#856404';
    mesajKutusu.textContent = `"${blog.baslik}" yazısını düzenliyorsunuz.`;
};