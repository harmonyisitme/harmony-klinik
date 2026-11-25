/* =====================================================
   "SİZİ ARAYALIM" FORMU
   WhatsApp'tan yazmak istemeyen ziyaretçi ad, telefon ve
   semtini bırakır; talep e-posta ile merkeze iletilir.
   Sayfada <div data-geri-arama></div> olan her yere eklenir.
===================================================== */
(function () {
    var STIL = '' +
        '.geri-arama{padding:60px max(6%,calc((100% - 1150px)/2));background:#fbf3f4}' +
        '.geri-arama__kutu{display:grid;grid-template-columns:1fr 1.1fr;gap:40px;align-items:center;max-width:1150px;margin:0 auto;background:#fff;border:1px solid #f0d6da;border-radius:16px;padding:36px;box-shadow:0 12px 35px rgba(0,0,0,.06)}' +
        '.geri-arama__ust{display:inline-block;margin-bottom:10px;color:#c92335;font-size:12px;font-weight:800;letter-spacing:.08em}' +
        '.geri-arama h2{margin-bottom:12px;color:#292929;font-size:clamp(24px,3vw,34px);font-weight:850;line-height:1.2}' +
        '.geri-arama h2 em{color:#c92335;font-style:normal}' +
        '.geri-arama__aciklama{color:#555;font-size:15px;line-height:1.6}' +
        '.geri-arama__maddeler{margin-top:16px;list-style:none;padding:0}' +
        '.geri-arama__maddeler li{margin:6px 0;color:#333;font-size:14px}' +
        '.geri-arama__maddeler li:before{content:"\\2713";margin-right:8px;color:#c92335;font-weight:800}' +
        '.geri-arama form{display:grid;gap:12px}' +
        '.geri-arama label{display:block;margin-bottom:4px;color:#333;font-size:14px;font-weight:700}' +
        '.geri-arama input[type=text],.geri-arama input[type=tel]{width:100%;min-height:50px;padding:12px 14px;border:1px solid #d9d9d9;border-radius:8px;font:inherit;font-size:16px;color:#222;background:#fff}' +
        '.geri-arama input:focus{outline:2px solid #c92335;outline-offset:1px;border-color:#c92335}' +
        '.geri-arama__onay{display:flex;gap:10px;align-items:flex-start;color:#555;font-size:13px;font-weight:400!important;line-height:1.5}' +
        '.geri-arama__onay input{width:20px;height:20px;margin-top:1px;flex-shrink:0;accent-color:#c92335}' +
        '.geri-arama__onay a{color:#c92335;text-decoration:underline}' +
        '.geri-arama button{min-height:54px;border:0;border-radius:8px;background:#c92335;color:#fff;font:inherit;font-size:17px;font-weight:800;cursor:pointer;transition:.2s}' +
        '.geri-arama button:hover{background:#a91d2c}' +
        '.geri-arama button[disabled]{opacity:.7;cursor:wait}' +
        '.geri-arama__tuzak{position:absolute!important;left:-9999px!important;width:1px;height:1px;overflow:hidden}' +
        '.geri-arama__durum{min-height:20px;font-size:14px;font-weight:700}' +
        '.geri-arama__durum.hata{color:#b3261e}' +
        '.geri-arama__basari{padding:28px;border-radius:12px;background:#eef8f0;color:#1d5e2c;text-align:center}' +
        '.geri-arama__basari strong{display:block;margin-bottom:6px;font-size:20px}' +
        '@media (max-width:820px){.geri-arama{padding:40px 16px}.geri-arama__kutu{grid-template-columns:1fr;gap:22px;padding:24px 18px}}';

    var HTML = '' +
        '<section class="geri-arama" id="sizi-arayalim" aria-labelledby="geriAramaBaslik">' +
        '<div class="geri-arama__kutu">' +
        '<div>' +
        '<span class="geri-arama__ust">ÜCRETSİZ İŞİTME TESTİ</span>' +
        '<h2 id="geriAramaBaslik">Yazmakla uğraşmayın, <em>sizi arayalım.</em></h2>' +
        '<p class="geri-arama__aciklama">Adınızı ve telefonunuzu bırakın; ekibimiz sizi arayıp size uygun gün ve saatte ücretsiz işitme testi randevunuzu oluştursun.</p>' +
        '<ul class="geri-arama__maddeler">' +
        '<li>Mesai saatlerinde genellikle aynı gün dönüş</li>' +
        '<li>Ankara Çankaya merkezimizde veya evde hizmet</li>' +
        '<li>Yakınınız için de talep bırakabilirsiniz</li>' +
        '</ul>' +
        '</div>' +
        '<div class="geri-arama__alan">' +
        '<form novalidate>' +
        '<div><label for="gaAd">Ad Soyad</label><input id="gaAd" name="adSoyad" type="text" autocomplete="name" required maxlength="80"></div>' +
        '<div><label for="gaTel">Telefon</label><input id="gaTel" name="telefon" type="tel" inputmode="tel" autocomplete="tel" placeholder="05XX XXX XX XX" required maxlength="20"></div>' +
        '<div><label for="gaSemt">Semt <span style="font-weight:400;color:#888">(isteğe bağlı)</span></label><input id="gaSemt" name="semt" type="text" autocomplete="address-level2" maxlength="60" placeholder="Örn. Çankaya, Keçiören"></div>' +
        '<div class="geri-arama__tuzak" aria-hidden="true"><label for="gaWeb">Web sitesi</label><input id="gaWeb" name="web_sitesi" type="text" tabindex="-1" autocomplete="off"></div>' +
        '<label class="geri-arama__onay"><input type="checkbox" name="kvkkOnay" required> <span>Bilgilerimin randevu için benimle iletişime geçilmesi amacıyla işlenmesine ilişkin <a href="/gizlilik.html" target="_blank" rel="noopener">aydınlatma metnini</a> okudum.</span></label>' +
        '<button type="submit">Beni Arayın</button>' +
        '<p class="geri-arama__durum" role="status" aria-live="polite"></p>' +
        '</form>' +
        '</div>' +
        '</div>' +
        '</section>';

    function olayGonder() {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', 'generate_lead', {
            send_to: 'G-RLVX9320T1',
            form_name: 'sizi_arayalim',
            page_location: window.location.href
        });
    }

    function kur(yer) {
        yer.outerHTML = HTML;
        var bolum = document.getElementById('sizi-arayalim');
        if (!bolum) return;
        var form = bolum.querySelector('form');
        var durum = bolum.querySelector('.geri-arama__durum');
        var buton = form.querySelector('button');

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            durum.className = 'geri-arama__durum';
            durum.textContent = '';

            var veri = {
                adSoyad: form.adSoyad.value.trim(),
                telefon: form.telefon.value.trim(),
                semt: form.semt.value.trim(),
                web_sitesi: form.web_sitesi.value,
                kvkkOnay: form.kvkkOnay.checked,
                sayfa: window.location.pathname + window.location.search
            };

            var rakam = veri.telefon.replace(/\D/g, '');
            if (veri.adSoyad.length < 2) return hata('Lütfen adınızı ve soyadınızı yazın.', form.adSoyad);
            if (rakam.length < 10) return hata('Lütfen telefon numaranızı yazın (ör. 0532 123 45 67).', form.telefon);
            if (!veri.kvkkOnay) return hata('Devam etmek için aydınlatma metnini onaylayın.', form.kvkkOnay);

            buton.disabled = true;
            buton.textContent = 'Gönderiliyor...';

            fetch('/api/geri-arama', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(veri)
            })
                .then(function (r) {
                    return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; });
                })
                .then(function (s) {
                    if (!s.ok) throw new Error(s.j.mesaj || 'Gönderilemedi');
                    olayGonder();
                    bolum.querySelector('.geri-arama__alan').innerHTML =
                        '<div class="geri-arama__basari" role="status"><strong>Teşekkürler, talebiniz bize ulaştı!</strong>' +
                        'Ekibimiz en kısa sürede sizi arayacak. Acil durumda bize <a href="tel:+905519849333">0551 984 93 33</a> numarasından ulaşabilirsiniz.</div>';
                })
                .catch(function (err) {
                    buton.disabled = false;
                    buton.textContent = 'Beni Arayın';
                    hata(err.message && err.message !== 'Failed to fetch'
                        ? err.message
                        : 'Bağlantı sorunu oluştu. Lütfen tekrar deneyin veya 0551 984 93 33 numarasını arayın.');
                });
        });

        function hata(mesaj, alan) {
            durum.className = 'geri-arama__durum hata';
            durum.textContent = mesaj;
            if (alan && alan.focus) alan.focus();
        }
    }

    function basla() {
        var yerler = document.querySelectorAll('[data-geri-arama]');
        if (!yerler.length) return;
        var stil = document.createElement('style');
        stil.textContent = STIL;
        document.head.appendChild(stil);
        // Sayfada yalnızca bir form olsun (aynı id'ler çakışmasın)
        kur(yerler[0]);
        for (var i = 1; i < yerler.length; i++) yerler[i].remove();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', basla);
    } else {
        basla();
    }
})();
