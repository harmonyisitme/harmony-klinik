// API Adresi (Otomatik Algılama)
// Eğer localhost'taysak 5501 portuna, değilsek (canlıdaysak) relative path'e (/api) gider.
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_URL = isLocal ? 'http://localhost:5501/api' : '/api';

// Güvenlik Kontrolü
export const checkAuth = () => {
    if (!localStorage.getItem('harmonyToken')) {
        window.location.href = 'login.html';
    }
};

// Toast Bildirim Fonksiyonu
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

// HTML onclick attribute'larından erişilebilmesi için window nesnesine ekliyoruz
window.showToast = showToast;