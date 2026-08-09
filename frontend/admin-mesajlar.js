import { API_URL, showToast, checkAuth } from './utils.js';

let tumMesajlar = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    modulKartlariniEkle();
    mesajlariGetir();

    // Modal Kapatma
    const modal = document.getElementById('mesajModal');
    const closeBtn = document.querySelector('#mesajModal .close-modal');
    if (closeBtn) {
        closeBtn.onclick = () => modal.style.display = "none";
    }
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

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
            <a href="admin-ayarlar.html" class="module-card">
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
async function mesajlariGetir() {
    const liste = document.getElementById('mesajListesi');
    const filtreEl = document.getElementById('mesajFiltresi');
    const siralamaEl = document.getElementById('mesajSiralama');
    
    // Elementler yoksa varsayılan değerleri kullan (Hata önleme)
    const filtre = filtreEl ? filtreEl.value : 'tumu';
    const siralama = siralamaEl ? siralamaEl.value : 'yeni';

    if (!liste) {
        console.error('HATA: HTML sayfasında id="mesajListesi" olan bir div bulunamadı.');
        return;
    }

    liste.innerHTML = '<p class="loading-text">Yükleniyor...</p>';

    try {
        // Cache sorununu önlemek için timestamp (?_t=...) ve filtre/sıralama parametreleri ekledik
        const response = await fetch(`${API_URL}/iletisim?durum=${filtre}&sirala=${siralama}&_t=${Date.now()}`, {
            headers: { 'x-auth-token': localStorage.getItem('ranaToken') }
        });

        if (!response.ok) {
            throw new Error('Veriler çekilemedi. Lütfen tekrar giriş yapın.');
        }

        const mesajlar = await response.json();
        tumMesajlar = mesajlar;

        liste.innerHTML = '';

        if (!mesajlar || mesajlar.length === 0) {
            liste.innerHTML = '<div style="text-align:center; padding: 20px; color: #666;">📭 Henüz gelen kutunuzda mesaj yok.</div>';
            return;
        }

        mesajlar.forEach(msg => {
            const tarih = msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('tr-TR') : '-';
            const saat = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString('tr-TR') : '';
            const mesajMetni = msg.mesaj || '';

            // Okundu durumu kontrolü
            const okunduClass = msg.okunduMu ? 'opacity: 0.7;' : 'border-left: 5px solid #28a745;';
            const okunduBtnText = msg.okunduMu ? 'Okunmadı Yap' : 'Okundu İşaretle';
            const okunduBtnIcon = msg.okunduMu ? '📖' : '✅';
            const okunduBtnAction = msg.okunduMu ? false : true;
            const msgId = msg._id || msg.id;

            const div = document.createElement('div');
            div.className = 'message-card';
            div.style.cssText = okunduClass;
            div.innerHTML = `
                <div class="msg-header">
                    <span><strong>${msg.adSoyad || 'İsimsiz'}</strong> (${msg.email || '-'})</span>
                    <span>${tarih} ${saat}</span>
                </div>
                <div class="msg-body">
                    <h4>${msg.konu || 'Konu Yok'}</h4>
                    <p>${mesajMetni.substring(0, 100)}${mesajMetni.length > 100 ? '...' : ''}</p>
                </div>
                <div class="msg-footer">
                    <button class="btn-refresh" onclick="mesajDurumDegistir('${msgId}', ${okunduBtnAction})" style="padding: 5px 15px; font-size: 12px; background-color: #6c757d; margin-right: 5px;">${okunduBtnIcon} ${okunduBtnText}</button>
                    <button class="btn-refresh" onclick="mesajOku('${msgId}')" style="padding: 5px 15px; font-size: 12px;">Oku</button>
                    <button class="btn-action delete" onclick="mesajSil('${msgId}')" style="font-size: 16px;">🗑️</button>
                </div>
            `;
            liste.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        liste.innerHTML = `<div style="color:red; text-align:center; padding: 20px;">⚠️ Mesajlar yüklenirken bir sorun oluştu.<br><small>${error.message}</small></div>`;
    }
}

window.mesajOku = (id) => {
    console.log('Mesaj Oku ID:', id);
    const msg = tumMesajlar.find(m => String(m._id || m.id) === String(id));
    if (!msg) {
        console.error('Mesaj bulunamadı!');
        return;
    }

    const tarih = msg.createdAt ? new Date(msg.createdAt).toLocaleString('tr-TR') : '-';
    const mesajIcerigi = msg.mesaj ? msg.mesaj.replace(/\n/g, '<br>') : '';

    document.getElementById('modalIcerik').innerHTML = `
        <div class="detail-row"><strong>Gönderen:</strong> ${msg.adSoyad || 'İsimsiz'}</div>
        <div class="detail-row"><strong>E-posta:</strong> ${msg.email || '-'}</div>
        <div class="detail-row"><strong>Tarih:</strong> ${tarih}</div>
        <div class="detail-row"><strong>Konu:</strong> ${msg.konu || '-'}</div>
        <div class="detail-row"><strong>Mesaj:</strong> <div style="margin-top:10px; background:#f9f9f9; padding:15px; border-radius:5px; line-height:1.5;">${mesajIcerigi}</div></div>
    `;
    document.getElementById('btnYanitla').href = `mailto:${msg.email}?subject=YNT: ${msg.konu}`;
    document.getElementById('mesajModal').style.display = 'block';
};

window.mesajSil = async (id) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
        const res = await fetch(`${API_URL}/iletisim/${id}`, { method: 'DELETE', headers: { 'x-auth-token': localStorage.getItem('ranaToken') } });
        if (res.ok) { showToast('Mesaj silindi.', 'success'); mesajlariGetir(); }
        else showToast('Silinemedi.', 'error');
    } catch (err) { showToast('Hata oluştu.', 'error'); }
};

// Mesaj Durumunu Değiştir (Okundu/Okunmadı)
window.mesajDurumDegistir = async (id, yeniDurum) => {
    try {
        const response = await fetch(`${API_URL}/iletisim/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': localStorage.getItem('ranaToken') },
            body: JSON.stringify({ okunduMu: yeniDurum })
        });

        if (response.ok) {
            showToast(`Mesaj durumu güncellendi.`, 'success');
            mesajlariGetir(); // Listeyi yenile
        } else { showToast('Güncelleme başarısız.', 'error'); }
    } catch (error) { showToast('Hata oluştu.', 'error'); }
};