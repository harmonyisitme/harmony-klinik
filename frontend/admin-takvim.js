// Güvenlik Kontrolü
if (!localStorage.getItem('ranaToken')) {
    window.location.href = 'login.html';
}

// --- TOAST BİLDİRİM FONKSİYONU ---
window.showToast = (mesaj, tip = 'info') => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${tip}`;
    
    let icon = '';
    if (tip === 'success') icon = '✅';
    if (tip === 'error') icon = '❌';
    if (tip === 'info') icon = 'ℹ️';
    
    toast.innerHTML = `${icon} <span>${mesaj}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
};

let sonRandevuSayisi = -1; // Bildirim takibi için

document.addEventListener('DOMContentLoaded', async () => {
    const calendarEl = document.getElementById('calendar');

    // --- KARANLIK MOD ---
    const darkModeBtn = document.getElementById('darkModeBtn');
    const body = document.body;

    // Kayıtlı tercihi kontrol et
    if (localStorage.getItem('darkMode') === 'enabled') {
        body.setAttribute('data-theme', 'dark');
        if(darkModeBtn) darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if (darkModeBtn) {
        darkModeBtn.addEventListener('click', () => {
            if (body.getAttribute('data-theme') === 'dark') {
                body.removeAttribute('data-theme');
                localStorage.setItem('darkMode', 'disabled');
                darkModeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            } else {
                body.setAttribute('data-theme', 'dark');
                localStorage.setItem('darkMode', 'enabled');
                darkModeBtn.innerHTML = '<i class="fas fa-sun"></i>';
            }
        });
    }

    // --- ÇIKIŞ YAP MODALI ---
    const cikisModal = document.getElementById('cikisModal');
    const btnLogout = document.getElementById('btnLogout');
    const btnCikisOnay = document.getElementById('btnCikisOnay');
    const btnCikisVazgec = document.getElementById('btnCikisVazgec');
    const closeCikisModal = document.getElementById('closeCikisModal');

    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (cikisModal) cikisModal.style.display = 'block';
        });
    }
    if (btnCikisOnay) {
        btnCikisOnay.addEventListener('click', () => {
            localStorage.removeItem('ranaToken');
            window.location.href = 'login.html';
        });
    }
    if (btnCikisVazgec) btnCikisVazgec.addEventListener('click', () => cikisModal.style.display = 'none');
    if (closeCikisModal) closeCikisModal.addEventListener('click', () => cikisModal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
        if (e.target == cikisModal) cikisModal.style.display = 'none';
    });

    // --- CANLI BİLDİRİM SİSTEMİ BAŞLAT ---
    try {
        const res = await fetch('/api/randevular?_t=' + Date.now());
        if (res.ok) {
            const data = await res.json();
            sonRandevuSayisi = data.length;
        }
    } catch (e) {}
    setInterval(yeniRandevuKontrol, 10000);

    // --- SAYFA GEÇİŞ EFEKTİ ---
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (!href || href.startsWith('#') || href.startsWith('javascript') || this.getAttribute('target') === '_blank') {
                return;
            }

            if (this.href === window.location.href) {
                e.preventDefault();
                return;
            }

            e.preventDefault();
            document.body.classList.add('fade-out');
            setTimeout(() => window.location.href = href, 200);
        });
    });

    if (!calendarEl) return;

    try {
        const response = await fetch('/api/randevular');
        const randevular = await response.json();

        const events = randevular.map(randevu => {
            let color = '#17a2b8'; // Tamamlandı
            if (randevu.durum === 'Bekliyor') color = '#f0ad4e'; // Bekliyor
            if (randevu.durum === 'Onaylandı') color = '#28a745'; // Onaylandı

            let start = randevu.tarih;
            let end = null;
            let allDay = false;

            // Eğer özel bir saat aralığı atanmışsa (Örn: "14:30 - 15:00")
            if (randevu.randevuSaati) {
                try {
                    // 1. Tarih kısmını al (YYYY-MM-DD)
                    // Veritabanından gelen format: "2023-10-27T00:00:00.000Z"
                    const datePart = randevu.tarih.split('T')[0];

                    // 2. Saat kısmını ayrıştır
                    const timeParts = randevu.randevuSaati.split('-');
                    const startTime = timeParts[0].trim(); // "14:30"
                    
                    // 3. FullCalendar için birleştir (YYYY-MM-DDTHH:mm:00)
                    start = `${datePart}T${startTime}:00`;

                    if (timeParts.length > 1) {
                        const endTime = timeParts[1].trim(); // "15:00"
                        end = `${datePart}T${endTime}:00`;
                    }
                } catch (e) { console.error("Saat formatlama hatası:", e); }
            } else {
                // Saat atanmamışsa (Bekliyor ise) Tüm Gün kısmında göster
                allDay = true;
            }

            return {
                id: randevu._id || randevu.id,
                title: randevu.adSoyad,
                start: start,
                end: end,
                allDay: allDay,
                backgroundColor: color,
                borderColor: color,
                extendedProps: {
                    hizmet: randevu.hizmetTuru,
                    telefon: randevu.telefon,
                    durum: randevu.durum,
                    mesaj: randevu.mesaj,
                    randevuSaati: randevu.randevuSaati,
                    email: randevu.email,
                    tcKimlik: randevu.tcKimlik,
                    cinsiyet: randevu.cinsiyet,
                    dogumTarihi: randevu.dogumTarihi
                }
            };
        });

        const calendar = new FullCalendar.Calendar(calendarEl, {
            locale: 'tr',
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listWeek'
            },
            initialView: 'dayGridMonth',
            events: events,
            eventMouseEnter: function(info) {
                const tooltip = document.getElementById('eventTooltip');
                const props = info.event.extendedProps;
                tooltip.innerHTML = `
                    <strong>${info.event.title}</strong><br>
                    Saat: ${props.randevuSaati || 'Atanmadı'}<br>
                    Hizmet: ${props.hizmet}
                `;
                tooltip.style.display = 'block';
                tooltip.style.left = info.jsEvent.pageX + 10 + 'px';
                tooltip.style.top = info.jsEvent.pageY + 10 + 'px';
            },
            eventMouseLeave: function(info) {
                const tooltip = document.getElementById('eventTooltip');
                tooltip.style.display = 'none';
            },
            eventClick: function(info) {
                const props = info.event.extendedProps;
                
                // TC Maskeleme
                const maskeliTC = props.tcKimlik ? props.tcKimlik.substring(0, 2) + '*******' + props.tcKimlik.substring(9) : '';

                const modalIcerik = document.getElementById('modalIcerik');
                modalIcerik.innerHTML = `
                    <div class="detail-row"><strong>Hasta:</strong> ${info.event.title}</div>
                    <div class="detail-row"><strong>Tarih:</strong> ${info.event.start.toLocaleDateString('tr-TR')}</div>
                    <div class="detail-row"><strong>Saat:</strong> ${props.randevuSaati || 'Atanmadı'}</div>
                    <div class="detail-row"><strong>Durum:</strong> ${props.durum}</div>
                    <div class="detail-row"><strong>Telefon:</strong> ${props.telefon}</div>
                    <div class="detail-row"><strong>E-posta:</strong> ${props.email || '-'}</div>
                    ${props.tcKimlik ? `<div class="detail-row"><strong>TC Kimlik:</strong> ${maskeliTC}</div>` : ''}
                    ${props.cinsiyet ? `<div class="detail-row"><strong>Cinsiyet:</strong> ${props.cinsiyet}</div>` : ''}
                    ${props.dogumTarihi ? `<div class="detail-row"><strong>Doğum Tarihi:</strong> ${new Date(props.dogumTarihi).toLocaleDateString('tr-TR')}</div>` : ''}
                    <div class="detail-row"><strong>Hizmet:</strong> ${props.hizmet}</div>
                    <div class="detail-row"><strong>Mesaj:</strong> ${props.mesaj || '-'}</div>
                `;
                document.getElementById('eventModal').style.display = 'block';
            }
        });

        calendar.render();

    } catch (error) {
        console.error('Randevular yüklenemedi:', error);
        calendarEl.innerHTML = '<p style="color: red; text-align: center;">Takvim verileri yüklenirken bir hata oluştu.</p>';
    }
});

// Modal Kapatma İşlemleri
const modal = document.getElementById('eventModal');
const span = document.getElementsByClassName("close-modal")[0];
if (span) span.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// --- PERİYODİK KONTROL FONKSİYONU ---
async function yeniRandevuKontrol() {
    try {
        const response = await fetch(`/api/randevular?_t=${Date.now()}`);
        if (!response.ok) return;
        
        const guncelVeri = await response.json();
        const guncelSayi = guncelVeri.length;

        if (sonRandevuSayisi !== -1 && guncelSayi > sonRandevuSayisi) {
            const fark = guncelSayi - sonRandevuSayisi;
            
            // Sesli Uyarı
            const sesAyari = localStorage.getItem('notificationSound') || 'default';
            if (sesAyari !== 'mute') {
                let soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';
                if (sesAyari === 'soft') soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3';
                if (sesAyari === 'alert') soundUrl = 'https://assets.mixkit.co/active_storage/sfx/2870/2870-preview.mp3';
                new Audio(soundUrl).play().catch(e => console.log('Ses çalınamadı.'));
            }

            // Görsel Bildirim
            showToast(`🔔 ${fark} yeni randevu talebi alındı!`, 'success');

            // Zil İkonunu Güncelle
            const btnNotif = document.querySelector('.btn-notification');
            if (btnNotif) {
                btnNotif.classList.add('active');
            }
            
            sonRandevuSayisi = guncelSayi;
        }
    } catch (e) { console.error("Bildirim kontrol hatası:", e); }
}