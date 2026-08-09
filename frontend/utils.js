// API Adresi (Otomatik Algılama)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isLocal ? 'http://localhost:5501/api' : '/api';

// --- 1. GÜVENLİK KONTROLÜ ---
export const checkAuth = () => {
    if (!localStorage.getItem('ranaToken')) {
        window.location.href = 'login.html';
    }
};

// --- 2. TOAST BİLDİRİM FONKSİYONU ---
export const showToast = (mesaj, tip = 'info') => {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${tip}`;
    
    let icon = '';
    if (tip === 'success') icon = '<i class="fas fa-check-circle"></i>';
    if (tip === 'error') icon = '<i class="fas fa-exclamation-circle"></i>';
    if (tip === 'info') icon = '<i class="fas fa-info-circle"></i>';
    
    toast.innerHTML = `${icon} <span>${mesaj}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
};

// --- 3. ÇIKIŞ YAPMA MODALI YÖNETİMİ ---
export const initLogout = () => {
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
};

// --- 4. KARANLIK MOD YÖNETİMİ ---
export const initDarkMode = () => {
    const darkModeBtn = document.getElementById('darkModeBtn');
    const body = document.body;

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
};

export const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('ranaToken');
    if (!options.headers) {
        options.headers = {};
    }
    if (token) {
        options.headers['x-auth-token'] = token;
    }

    const response = await fetch(url, options);
    if (response.status === 401) {
        localStorage.removeItem('ranaToken');
        window.location.href = 'login.html';
        throw new Error('Yetkisiz erişim. Lütfen tekrar giriş yapın.');
    }
    return response;
};

// --- 5. SAYFA GEÇİŞ EFEKTİ YÖNETİMİ ---
export const initPageTransitions = () => {
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
};

// Fonksiyonları global window nesnesine ekleyerek HTML'den erişimi kolaylaştır
window.showToast = showToast;