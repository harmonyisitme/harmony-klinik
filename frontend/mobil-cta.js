/* =====================================================
   MOBİL ALT ÇUBUK: "Hemen Ara" + "WhatsApp"
   Reklamdan gelen ziyaretçi sayfanın neresinde olursa olsun
   tek dokunuşla arayabilsin / yazabilsin.
   Tıklama ölçümü sayfalardaki mevcut tel:/wa.me dinleyicileri
   tarafından yapılır (Google Ads + GA4), burada ek kod gerekmez.
===================================================== */
(function () {
    var TELEFON = '+905519849333';
    var WHATSAPP = '905519849333';
    var MESAJ = 'Merhaba, Rana İşitme Merkezi üzerinden bilgi ve randevu almak istiyorum.';

    function ekle() {
        if (document.querySelector('.mobil-cta')) return;

        var bar = document.createElement('div');
        bar.className = 'mobil-cta';
        bar.setAttribute('role', 'navigation');
        bar.setAttribute('aria-label', 'Hızlı iletişim');

        var ara = document.createElement('a');
        ara.className = 'mobil-cta__btn mobil-cta__ara';
        ara.href = 'tel:' + TELEFON;
        ara.innerHTML = '<i class="fas fa-phone" aria-hidden="true"></i> Hemen Ara';

        var wa = document.createElement('a');
        wa.className = 'mobil-cta__btn mobil-cta__wa';
        wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(MESAJ);
        wa.target = '_blank';
        wa.rel = 'noopener noreferrer';
        wa.innerHTML = '<i class="fab fa-whatsapp" aria-hidden="true"></i> WhatsApp';

        bar.appendChild(ara);
        bar.appendChild(wa);
        document.body.appendChild(bar);
        document.body.classList.add('has-mobil-cta');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ekle);
    } else {
        ekle();
    }
})();
