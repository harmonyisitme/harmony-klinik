import { API_URL, checkAuth, showToast, initLogout, initDarkMode, initPageTransitions, fetchWithAuth } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('urunFormu');
    const formBaslik = document.getElementById('formBaslik');
    const urunIdInput = document.getElementById('urunId');
    const adInput = document.getElementById('ad');
    const aciklamaInput = document.getElementById('aciklama');
    const kategoriInput = document.getElementById('kategori');
    const markaInput = document.getElementById('marka');
    const stokDurumuInput = document.getElementById('stokDurumu');
    const gorselDosyaInput = document.getElementById('gorselDosya');
    const mevcutGorselUrlInput = document.getElementById('mevcutGorselUrl');
    const gorselOnizleme = document.getElementById('gorselOnizleme');
    const urunlerTablosuBody = document.querySelector('#urunlerTablosu tbody');
    const btnVazgec = document.getElementById('btnVazgec');

    checkAuth(); // Güvenlik kontrolü

    const urunleriGetir = async () => {
        try {
            const response = await fetch(`${API_URL}/urunler`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': localStorage.getItem('ranaToken')
                }
            });
            if (!response.ok) throw new Error('Ürünler getirilemedi.');

            const { veri } = await response.json();
            urunlerTablosuBody.innerHTML = '';
            veri.forEach(urun => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${urun.gorselUrl || 'logo.png'}" alt="${urun.ad}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;"></td>
                    <td>${urun.ad}</td>
                    <td>${urun.kategori || '-'}</td>
                    <td>${urun.marka || '-'}</td>
                    <td><span class="status ${urun.stokDurumu ? 'status-active' : 'status-inactive'}">${urun.stokDurumu ? 'Stokta Var' : 'Stokta Yok'}</span></td>
                    <td>
                        <button class="btn-action btn-edit" data-id="${urun.id}"><i class="fas fa-edit"></i> Düzenle</button>
                        <button class="btn-action btn-delete" data-id="${urun.id}"><i class="fas fa-trash"></i> Sil</button>
                    </td>
                `;
                urunlerTablosuBody.appendChild(tr);
            });
        } catch (error) {
            showToast(error.message, 'error');
        }
    };

    const formuTemizle = () => {
        form.reset();
        urunIdInput.value = '';
        mevcutGorselUrlInput.value = '';
        gorselOnizleme.innerHTML = '';
        gorselOnizleme.style.display = 'none';
        formBaslik.textContent = 'Yeni Ürün Ekle';
        btnVazgec.style.display = 'none';
    };

    gorselDosyaInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('dosya', file);

        try {
            const response = await fetchWithAuth(`${API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.mesaj || 'Dosya yüklenemedi.');
            }

            const { url } = await response.json();
            mevcutGorselUrlInput.value = url;
            gorselOnizleme.innerHTML = `<img src="${url}" alt="Yeni Görsel" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">`;
            gorselOnizleme.style.display = 'block';
            showToast('Görsel başarıyla yüklendi.');
        } catch (error) {
            showToast(error.message, 'error');
            gorselDosyaInput.value = '';
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = urunIdInput.value;
        
        const urunVerisi = {
            ad: adInput.value,
            aciklama: aciklamaInput.value,
            kategori: kategoriInput.value,
            marka: markaInput.value,
            stokDurumu: stokDurumuInput.value === 'true',
            gorselUrl: mevcutGorselUrlInput.value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/urunler/${id}` : `${API_URL}/urunler`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'x-auth-token': localStorage.getItem('ranaToken'),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(urunVerisi)
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.mesaj || 'İşlem başarısız.');
            
            showToast(result.mesaj);
            formuTemizle();
            await urunleriGetir();
        } catch (error) {
            showToast(error.message, 'error');
        }
    });

    urunlerTablosuBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        const id = target.dataset.id;

        if (target.classList.contains('btn-edit')) {
            try {
                // Düzenleme için de token gerekli
                const response = await fetchWithAuth(`${API_URL}/urunler/${id}`, {
                    headers: {
                        'x-auth-token': localStorage.getItem('ranaToken')
                    }
                });
                const { veri: urun } = await response.json();

                if (urun) {
                    formBaslik.textContent = 'Ürünü Düzenle';
                    urunIdInput.value = urun.id;
                    adInput.value = urun.ad;
                    aciklamaInput.value = urun.aciklama;
                    kategoriInput.value = urun.kategori;
                    markaInput.value = urun.marka;
                    stokDurumuInput.value = urun.stokDurumu;
                    mevcutGorselUrlInput.value = urun.gorselUrl;
                    if (urun.gorselUrl) {
                        gorselOnizleme.innerHTML = `<img src="${urun.gorselUrl}" alt="Mevcut Görsel" style="width: 100px; height: 100px; object-fit: cover; border-radius: 5px;">`;
                        gorselOnizleme.style.display = 'block';
                    } else {
                        gorselOnizleme.innerHTML = '';
                        gorselOnizleme.style.display = 'none';
                    }
                    btnVazgec.style.display = 'inline-block';
                    window.scrollTo(0, 0);
                }
            } catch (error) {
                showToast('Ürün bilgileri getirilemedi.', 'error');
            }
        }

        if (target.classList.contains('btn-delete')) {
            if (confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
                try {
                    const response = await fetch(`${API_URL}/urunler/${id}`, {
                        method: 'DELETE',
                        headers: {
                           'x-auth-token': localStorage.getItem('ranaToken')
                        }
                    });
                    const result = await response.json();
                    if (!response.ok) throw new Error(result.mesaj);
                    
                    showToast(result.mesaj);
                    await urunleriGetir();
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        }
    });

    btnVazgec.addEventListener('click', formuTemizle);

    // Sayfa yüklendiğinde ürünleri getir
    urunleriGetir();
    // Ortak fonksiyonları başlat
    initLogout();
    initDarkMode();
    initPageTransitions();
});
