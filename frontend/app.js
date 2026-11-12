
/* =====================================================
   RANA İŞİTME MERKEZİ
   Ana Sayfa - WhatsApp, site ayarları, ürünler,
   blog, mobil menü ve KVKK
===================================================== */
/* =====================================================
   GOOGLE TAG MANAGER - TÜM SİTE
===================================================== */
(function (w, d, s, l, i) {
    w[l] = w[l] || [];

    // GTM zaten yüklüyse ikinci kez yükleme
    if (d.querySelector('script[src*="' + i + '"]')) return;

    w[l].push({
        'gtm.start': new Date().getTime(),
        event: 'gtm.js'
    });

    var f = d.getElementsByTagName(s)[0];
    var j = d.createElement(s);
    var dl = l !== 'dataLayer' ? '&l=' + l : '';

    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;

    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-NG5WXPCD');
document.addEventListener('DOMContentLoaded', () => {
    const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    const API_URL = isLocal ? 'http://localhost:5501/api' : '/api';

    const WHATSAPP_NUMARA = '905519849333';
    const WHATSAPP_MESAJ =
        'Merhaba, Rana İşitme Merkezi üzerinden randevu almak istiyorum. Randevu konusunda yardımcı olabilir misiniz?';

    let dynamicServiceDetails = {};
    let yasalMetinlerData = {};
    let allBlogs = [];
    let allProducts = [];

    const get = id => document.getElementById(id);

    // --------------------------------------------------
    // GENEL YARDIMCILAR
    // --------------------------------------------------

    function whatsappRandevu(mesaj = WHATSAPP_MESAJ) {
        const url =
            `https://wa.me/${WHATSAPP_NUMARA}?text=${encodeURIComponent(mesaj)}`;

        window.open(url, '_blank', 'noopener,noreferrer');
    }

    window.randevuAdimGec = () => whatsappRandevu();

    // TÜM WHATSAPP VE RANDEVU BAĞLANTILARI
    // Hazır mesajı tıklama anında oluşturur.
    document.addEventListener('click', event => {
        const link = event.target.closest(
            'a[href*="wa.me"], a[href*="api.whatsapp.com"], a[href="#randevu"]'
        );

        if (!link) return;

        event.preventDefault();

        let mesaj = WHATSAPP_MESAJ;

        try {
            const mevcutUrl = new URL(link.href, window.location.href);
            const mevcutMesaj = mevcutUrl.searchParams.get('text');

            if (mevcutMesaj) {
                mesaj = mevcutMesaj;
            }
        } catch (error) {
            console.warn('WhatsApp mesajı okunamadı:', error);
        }

        whatsappRandevu(mesaj);
    }, true);

    window.showToast = (message, type = 'info') => {
        let container = get('toast-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        window.setTimeout(() => toast.remove(), 3000);
    };

    function formatTelefon(value) {
        let digits = String(value || '').replace(/\D/g, '');

        if (digits.startsWith('0')) digits = digits.slice(1);
        digits = digits.slice(0, 10);

        let result = '';
        if (digits.length > 0) result = `(${digits.slice(0, 3)}`;
        if (digits.length >= 4) result += `) ${digits.slice(3, 6)}`;
        if (digits.length >= 7) result += ` ${digits.slice(6, 8)}`;
        if (digits.length >= 9) result += ` ${digits.slice(8, 10)}`;

        return result;
    }

    function bindInputFormat(inputId, formatter) {
        const input = get(inputId);
        if (!input) return;

        input.addEventListener('input', () => {
            input.value = formatter(input.value);
        });
    }

    bindInputFormat('telefon', formatTelefon);
    bindInputFormat('sorguTc', value =>
        String(value || '').replace(/\D/g, '').slice(0, 11)
    );
    bindInputFormat('tcKimlik', value =>
        String(value || '').replace(/\D/g, '').slice(0, 11)
    );

    function fotografAdresiniDuzenle(url) {
        if (!url) return '';

        const value = String(url).trim();

        if (/^(https?:\/\/|data:|blob:)/i.test(value)) return value;
        if (value.startsWith('/')) return value;

        return `/${value}`;
    }

    async function apiGet(endpoint) {
        const response = await fetch(`${API_URL}/${endpoint}?_t=${Date.now()}`);

        if (!response.ok) {
            throw new Error(`İstek başarısız: ${response.status}`);
        }

        return response.json();
    }

    // --------------------------------------------------
    // ÜRÜNLER
    // --------------------------------------------------

    function urunlerStiliniEkle() {
        if (get('rana-products-style')) return;

        const style = document.createElement('style');
        style.id = 'rana-products-style';

        style.textContent = `
            #ranaProducts {
                padding: 85px 5%;
                background: #fff;
                overflow: hidden;
            }

            #ranaProducts .products-inner {
                max-width: 1240px;
                margin: auto;
            }

            #ranaProducts .products-heading {
                text-align: center;
                max-width: 720px;
                margin: 0 auto 42px;
            }

            #ranaProducts .products-eyebrow {
                display: inline-block;
                color: #c92335;
                font-size: 13px;
                font-weight: 800;
                letter-spacing: 2px;
                text-transform: uppercase;
                margin-bottom: 12px;
            }

            #ranaProducts .products-heading h2 {
                color: #252525;
                font-size: clamp(27px, 4vw, 40px);
                font-weight: 800;
                line-height: 1.2;
                margin: 0 0 14px;
            }

            #ranaProducts .products-heading h2 span {
                color: #c92335;
            }

            #ranaProducts .products-heading p {
                color: #707070;
                font-size: 16px;
                line-height: 1.7;
                margin: 0;
            }

            #ranaProducts .products-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 25px;
            }

            #ranaProducts .product-card {
                background: #fff;
                border: 1px solid #ececec;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 8px 28px rgba(0,0,0,.055);
                transition: transform .25s ease, box-shadow .25s ease;
                display: flex;
                flex-direction: column;
                min-width: 0;
            }

            #ranaProducts .product-card:hover {
                transform: translateY(-6px);
                box-shadow: 0 16px 36px rgba(0,0,0,.11);
            }

            #ranaProducts .product-image-wrap {
                height: 245px;
                background: #f8f8f8;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                padding: 18px;
            }

            #ranaProducts .product-image {
                width: 100%;
                height: 100%;
                object-fit: contain;
                transition: transform .3s ease;
            }

            #ranaProducts .product-card:hover .product-image {
                transform: scale(1.045);
            }

            #ranaProducts .product-no-image {
                color: #c92335;
                font-size: 48px;
                opacity: .65;
            }

            #ranaProducts .product-info {
                padding: 22px;
                display: flex;
                flex-direction: column;
                flex: 1;
            }

            #ranaProducts .product-brand {
                color: #c92335;
                font-size: 12px;
                font-weight: 800;
                letter-spacing: 1.2px;
                text-transform: uppercase;
                margin-bottom: 9px;
            }

            #ranaProducts .product-info h3 {
                color: #252525;
                font-size: 20px;
                line-height: 1.4;
                margin: 0 0 10px;
                font-weight: 750;
            }

            #ranaProducts .product-description {
                color: #747474;
                font-size: 14px;
                line-height: 1.65;
                margin: 0 0 18px;
                display: -webkit-box;
                -webkit-line-clamp: 3;
                -webkit-box-orient: vertical;
                overflow: hidden;
            }

            #ranaProducts .product-category {
                display: inline-block;
                color: #555;
                background: #f5f5f5;
                border-radius: 30px;
                padding: 7px 12px;
                font-size: 12px;
                margin: auto 0 16px;
                align-self: flex-start;
            }

            #ranaProducts .product-detail-link {
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 45px;
                border: 1px solid #c92335;
                border-radius: 7px;
                color: #c92335;
                text-decoration: none;
                font-size: 14px;
                font-weight: 700;
                transition: .2s ease;
            }

            #ranaProducts .product-detail-link:hover {
                background: #c92335;
                color: #fff;
            }

            #ranaProducts .products-bottom {
                text-align: center;
                margin-top: 38px;
            }

            #ranaProducts .all-products-link {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background: #c92335;
                color: #fff;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 7px;
                font-weight: 700;
                transition: .2s ease;
            }

            #ranaProducts .all-products-link:hover {
                background: #a91d2c;
                transform: translateY(-2px);
            }

            #ranaProducts .products-message {
                text-align: center;
                padding: 35px 15px;
                color: #777;
                grid-column: 1 / -1;
            }

            @media (max-width: 900px) {
                #ranaProducts .products-grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                    gap: 18px;
                }

                #ranaProducts .product-image-wrap {
                    height: 210px;
                }
            }

            @media (max-width: 560px) {
                #ranaProducts {
                    padding: 58px 16px;
                }

                #ranaProducts .products-heading {
                    margin-bottom: 28px;
                }

                #ranaProducts .products-heading p {
                    font-size: 14px;
                }

                #ranaProducts .products-grid {
                    grid-template-columns: 1fr;
                    gap: 18px;
                }

                #ranaProducts .product-image-wrap {
                    height: 230px;
                }

                #ranaProducts .product-info {
                    padding: 18px;
                }

                #ranaProducts .product-info h3 {
                    font-size: 18px;
                }

                #ranaProducts .all-products-link {
                    width: 100%;
                    box-sizing: border-box;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function urunlerMenuLinkiEkle() {
        const nav = document.querySelector('.nav-links');
        if (!nav) return;

        if (nav.querySelector('a[href="urunler.html"], a[href="#ranaProducts"]')) return;

        const link = document.createElement('a');
        link.href = 'urunler.html';
        link.textContent = 'Ürünler';

        const servicesLink = nav.querySelector('a[href="#services"]');

        if (servicesLink) {
            const listItem = servicesLink.closest('li');

            if (listItem) {
                const newItem = document.createElement('li');
                newItem.appendChild(link);
                nav.insertBefore(newItem, listItem);
            } else {
                nav.insertBefore(link, servicesLink);
            }
        } else {
            nav.appendChild(link);
        }
    }

    function urunlerBolumunuOlustur() {
        let section = get('ranaProducts');

        if (!section) {
            section = document.createElement('section');
            section.id = 'ranaProducts';

            section.innerHTML = `
                <div class="products-inner">
                    <div class="products-heading">
                        <span class="products-eyebrow">Rana İşitme Merkezi</span>
                        <h2>Size Uygun İşitme <span>Çözümleri</span></h2>
                        <p>İhtiyaçlarınıza ve yaşam tarzınıza uygun işitme cihazı seçeneklerini keşfedin.</p>
                    </div>

                    <div class="products-grid" id="ranaProductsGrid">
                        <div class="products-message">Ürünler yükleniyor...</div>
                    </div>

                    <div class="products-bottom">
                        <a href="urunler.html" class="all-products-link">Tüm Ürünleri Gör</a>
                    </div>
                </div>
            `;

            const services = get('services');
            const blog = get('blog');

            if (services?.parentNode) {
                services.parentNode.insertBefore(section, services);
            } else if (blog?.parentNode) {
                blog.parentNode.insertBefore(section, blog);
            } else {
                document.body.appendChild(section);
            }
        }

        urunlerStiliniEkle();
        urunlerMenuLinkiEkle();
    }

    function urunVerileriniDuzenle(result) {
        if (Array.isArray(result)) return result;
        if (Array.isArray(result?.veri)) return result.veri;
        if (Array.isArray(result?.urunler)) return result.urunler;
        if (Array.isArray(result?.data)) return result.data;
        return [];
    }

    function urunKartiniOlustur(urun) {
        const card = document.createElement('article');
        card.className = 'product-card';

        const imageWrap = document.createElement('div');
        imageWrap.className = 'product-image-wrap';

        const imageUrl = fotografAdresiniDuzenle(urun.gorselUrl);

        if (imageUrl) {
            const image = document.createElement('img');
            image.className = 'product-image';
            image.src = imageUrl;
            image.alt = urun.ad || 'İşitme cihazı';
            image.loading = 'lazy';

            image.onerror = () => {
                image.remove();

                const fallback = document.createElement('div');
                fallback.className = 'product-no-image';
                fallback.textContent = '♫';
                imageWrap.appendChild(fallback);
            };

            imageWrap.appendChild(image);
        } else {
            const fallback = document.createElement('div');
            fallback.className = 'product-no-image';
            fallback.textContent = '♫';
            imageWrap.appendChild(fallback);
        }

        const info = document.createElement('div');
        info.className = 'product-info';

        const brand = document.createElement('div');
        brand.className = 'product-brand';
        brand.textContent = urun.marka || 'Rana İşitme Merkezi';

        const title = document.createElement('h3');
        title.textContent = urun.ad || 'İşitme Cihazı';

        const description = document.createElement('p');
        description.className = 'product-description';
        description.textContent =
            urun.aciklama ||
            'Ürün hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.';

        info.append(brand, title, description);

        if (urun.kategori) {
            const category = document.createElement('span');
            category.className = 'product-category';
            category.textContent = urun.kategori;
            info.appendChild(category);
        }

        const detail = document.createElement('a');
        detail.className = 'product-detail-link';
        detail.href = 'urunler.html';
        detail.textContent = 'Ürün Detaylarını Gör';

        info.appendChild(detail);
        card.append(imageWrap, info);

        return card;
    }

    async function urunleriGetir() {
        urunlerBolumunuOlustur();

        const grid = get('ranaProductsGrid');
        if (!grid) return;

        try {
            const result = await apiGet('urunler');
            allProducts = urunVerileriniDuzenle(result);

            grid.replaceChildren();

            if (!allProducts.length) {
                const message = document.createElement('div');
                message.className = 'products-message';
                message.textContent = 'Şu anda gösterilecek ürün bulunamadı.';
                grid.appendChild(message);
                return;
            }

            allProducts.slice(0, 6).forEach(urun => {
                grid.appendChild(urunKartiniOlustur(urun));
            });
        } catch (error) {
            console.error('Ürünler yüklenemedi:', error);
            grid.replaceChildren();

            const message = document.createElement('div');
            message.className = 'products-message';
            message.textContent =
                'Ürünler şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.';

            grid.appendChild(message);
        }
    }

    // --------------------------------------------------
    // SİTE AYARLARI
    // --------------------------------------------------

    async function siteAyarlariniGetir() {
        try {
            const ayarlar = await apiGet('site-ayarlari');
            yasalMetinlerData = ayarlar.yasalMetinler || {};

            if (ayarlar.logo) {
                document.querySelectorAll('.logo, .footer-logo').forEach(el => {
                    const img = document.createElement('img');
                    img.src = fotografAdresiniDuzenle(ayarlar.logo);
                    img.alt = 'Rana İşitme Merkezi';
                    img.style.height = el.classList.contains('logo') ? '55px' : '40px';
                    img.style.width = 'auto';
                    img.style.maxWidth = '180px';
                    img.style.objectFit = 'contain';
                    img.onerror = () => img.remove();

                    el.replaceChildren(img);
                });
            }

            if (ayarlar.favicon) {
                let favicon = document.querySelector("link[rel~='icon']");

                if (!favicon) {
                    favicon = document.createElement('link');
                    favicon.rel = 'icon';
                    document.head.appendChild(favicon);
                }

                favicon.href = fotografAdresiniDuzenle(ayarlar.favicon);
            }

            if (ayarlar.heroGorsel) {
                const hero = document.querySelector('.hero, .home-hero');

                if (hero) {
                    const heroImage = fotografAdresiniDuzenle(ayarlar.heroGorsel);

                    hero.style.backgroundImage =
                        `linear-gradient(rgba(255,255,255,.80), rgba(255,255,255,.80)), url("${heroImage}")`;
                    hero.style.backgroundPosition = 'center';
                    hero.style.backgroundSize = 'cover';
                }
            }

            if (ayarlar.anaRenk) {
                document.documentElement.style.setProperty('--primary-color', ayarlar.anaRenk);
                document.documentElement.style.setProperty('--rana-red', ayarlar.anaRenk);
            }

            if (ayarlar.ikincilRenk) {
                document.documentElement.style.setProperty('--accent-color', ayarlar.ikincilRenk);
            }

            const aboutTitle = get('aboutTitle');
            const aboutContent = get('aboutContent');
            const aboutImage = get('aboutImage');

            if (aboutTitle && ayarlar.hakkimizda) {
                aboutTitle.textContent = ayarlar.hakkimizda.baslik || '';
            }

            if (aboutContent && ayarlar.hakkimizda) {
                aboutContent.textContent = ayarlar.hakkimizda.icerik || '';
            }

            if (aboutImage && ayarlar.hakkimizda?.gorsel) {
                aboutImage.src = fotografAdresiniDuzenle(ayarlar.hakkimizda.gorsel);
            }

            const iletisim = ayarlar.iletisim || {};

            const headerTelefon = get('headerTelefon');
            const headerEmail = get('headerEmail');
            const headerAdres = get('headerAdres');

            if (headerTelefon && iletisim.telefon) {
                const a = document.createElement('a');
                a.href = `tel:${iletisim.telefon}`;
                a.textContent = iletisim.telefon;
                headerTelefon.replaceChildren(a);
            }

            if (headerEmail && iletisim.email) {
                const a = document.createElement('a');
                a.href = `mailto:${iletisim.email}`;
                a.textContent = iletisim.email;
                headerEmail.replaceChildren(a);
            }

            if (headerAdres && iletisim.adres) {
                headerAdres.textContent = iletisim.adres;
            }

            const pageAdres = get('pageAdres');
            const pageTelefon = get('pageTelefon');
            const pageEmail = get('pageEmail');
            const pageSaatler = get('pageSaatler');
            const googleMapFrame = get('googleMapFrame');

            if (pageAdres) pageAdres.textContent = iletisim.adres || '';

            if (pageTelefon && iletisim.telefon) {
                const a = document.createElement('a');
                a.href = `tel:${iletisim.telefon}`;
                a.textContent = iletisim.telefon;
                pageTelefon.replaceChildren(a);
            }

            if (pageEmail && iletisim.email) {
                const a = document.createElement('a');
                a.href = `mailto:${iletisim.email}`;
                a.textContent = iletisim.email;
                pageEmail.replaceChildren(a);
            }

            if (pageSaatler && ayarlar.calismaSaatleri) {
                pageSaatler.textContent =
                    `Hafta İçi: ${ayarlar.calismaSaatleri.haftaici || ''} | ` +
                    `Cumartesi: ${ayarlar.calismaSaatleri.cumartesi || ''} | ` +
                    `Pazar: ${ayarlar.calismaSaatleri.pazar || ''}`;
            }

            if (googleMapFrame && ayarlar.haritaEmbed) {
                let embedUrl = String(ayarlar.haritaEmbed).trim();
                const match = embedUrl.match(/src=["']([^"']+)["']/i);

                if (match) embedUrl = match[1];

                googleMapFrame.src = embedUrl;
            }

            const footerIletisim = get('footerIletisim');

            if (footerIletisim) {
                footerIletisim.replaceChildren();

                [
                    iletisim.adres ? `📍 ${iletisim.adres}` : '',
                    iletisim.telefon ? `📞 ${iletisim.telefon}` : '',
                    iletisim.email ? `✉️ ${iletisim.email}` : ''
                ].filter(Boolean).forEach(value => {
                    const li = document.createElement('li');
                    li.textContent = value;
                    footerIletisim.appendChild(li);
                });
            }

            const footerSaatler = get('footerSaatler');

            if (footerSaatler && ayarlar.calismaSaatleri) {
                footerSaatler.replaceChildren();

                const heading = document.createElement('h4');
                heading.textContent = 'Çalışma Saatleri';
                footerSaatler.appendChild(heading);

                [
                    `Pzt - Cuma: ${ayarlar.calismaSaatleri.haftaici || ''}`,
                    `Cumartesi: ${ayarlar.calismaSaatleri.cumartesi || ''}`,
                    `Pazar: ${ayarlar.calismaSaatleri.pazar || ''}`
                ].forEach(value => {
                    const p = document.createElement('p');
                    p.textContent = value;
                    footerSaatler.appendChild(p);
                });
            }

            function sosyalMedyaYukle(element, social) {
                if (!element || !social) return;

                const platforms = [
                    ['facebook', 'facebook-f'],
                    ['twitter', 'twitter'],
                    ['instagram', 'instagram'],
                    ['linkedin', 'linkedin-in']
                ];

                element.replaceChildren();

                platforms.forEach(([key, icon]) => {
                    if (!social[key] || social[key] === '#') return;

                    const a = document.createElement('a');
                    a.href = social[key];
                    a.target = '_blank';
                    a.rel = 'noopener noreferrer';
                    a.setAttribute('aria-label', key);

                    const i = document.createElement('i');
                    i.className = `fab fa-${icon}`;

                    a.appendChild(i);
                    element.appendChild(a);
                });
            }

            sosyalMedyaYukle(
                document.querySelector('.social-links'),
                ayarlar.sosyalMedya
            );

            sosyalMedyaYukle(get('headerSocials'), ayarlar.sosyalMedya);

            const servicesContainer = get('servicesContainer');

            if (
                servicesContainer &&
                Array.isArray(ayarlar.hizmetler) &&
                ayarlar.hizmetler.length
            ) {
                servicesContainer.querySelectorAll('.service-card').forEach(card => card.remove());

                ayarlar.hizmetler.forEach((service, index) => {
                    dynamicServiceDetails[service.key] = {
                        title: service.baslik || '',
                        content: service.ozet || 'Detaylar yakında...'
                    };

                    const card = document.createElement('div');
                    card.className = 'service-card';
                    card.dataset.key = service.key;
                    card.style.setProperty('--delay', `${index * 0.1}s`);

                    const content = document.createElement('div');
                    content.className = 'card-content';

                    const iconWrap = document.createElement('div');
                    iconWrap.className = 'icon';

                    const icon = document.createElement('i');
                    icon.className = service.ikon || '';
                    iconWrap.appendChild(icon);

                    const heading = document.createElement('h3');
                    heading.textContent = service.baslik || '';

                    const paragraph = document.createElement('p');
                    paragraph.textContent = service.ozet || '';

                    content.append(iconWrap, heading, paragraph);
                    card.appendChild(content);
                    servicesContainer.appendChild(card);
                });

                servicesContainer.classList.add('loaded');
                attachServiceClickEvents();
            }
        } catch (error) {
            console.error('Site ayarları yüklenemedi:', error);
        }
    }

    // --------------------------------------------------
    // HİZMET DETAY PENCERESİ
    // --------------------------------------------------

    const serviceModal = get('serviceModal');
    const modalTitle = get('modalTitle');
    const modalBody = get('modalBody');

    function attachServiceClickEvents() {
        document.querySelectorAll('.service-card').forEach(card => {
            if (card.dataset.listenerAdded === 'true') return;

            card.dataset.listenerAdded = 'true';

            card.addEventListener('click', () => {
                const data = dynamicServiceDetails[card.dataset.key];

                if (!serviceModal || !data) return;

                if (modalTitle) modalTitle.textContent = data.title;
                if (modalBody) modalBody.textContent = data.content;

                serviceModal.style.display = 'flex';
            });
        });
    }

    attachServiceClickEvents();

    const closeServiceModal = document.querySelector('.close-service-modal');

    if (closeServiceModal && serviceModal) {
        closeServiceModal.addEventListener('click', () => {
            serviceModal.style.display = 'none';
        });
    }

    // --------------------------------------------------
    // BLOG
    // --------------------------------------------------

    const blogContainer = get('blogKapsayici');
    const blogModal = get('blogModal');

    function openBlogModal(id) {
        const blog = allBlogs.find(
            item => String(item._id || item.id) === String(id)
        );

        if (!blog || !blogModal) return;

        const image = get('blogModalImage');
        const title = get('blogModalTitle');
        const meta = get('blogModalMeta');
        const body = get('blogModalBody');

        if (image) {
            image.src = fotografAdresiniDuzenle(blog.gorselUrl);
            image.alt = blog.baslik || '';
        }

        if (title) title.textContent = blog.baslik || '';

        if (meta) {
            meta.textContent = `${blog.yazar || ''} · ${
                blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString('tr-TR')
                    : ''
            }`;
        }

        if (body) body.textContent = blog.icerik || '';

        blogModal.style.display = 'flex';
    }

    async function bloglariGetir() {
        if (!blogContainer) return;

        try {
            const result = await apiGet('blog');
            allBlogs = Array.isArray(result) ? result : (result.veri || []);

            blogContainer.replaceChildren();

            if (!allBlogs.length) {
                blogContainer.textContent = 'Henüz paylaşılmış bir blog yazısı bulunamadı.';
                return;
            }

            allBlogs.forEach(blog => {
                const card = document.createElement('div');
                card.className = 'blog-card';

                const image = document.createElement('img');
                image.src = fotografAdresiniDuzenle(blog.gorselUrl);
                image.alt = blog.baslik || 'Blog görseli';
                image.className = 'blog-img';
                image.loading = 'lazy';

                const body = document.createElement('div');
                body.className = 'blog-body';

                const title = document.createElement('h3');
                title.textContent = blog.baslik || '';

                const excerpt = document.createElement('p');
                excerpt.textContent = `${String(blog.icerik || '').substring(0, 120)}...`;

                const footer = document.createElement('div');
                footer.className = 'blog-footer';

                const date = blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString('tr-TR')
                    : '';

                footer.textContent = `${blog.yazar || ''} · ${date}`;

                body.append(title, excerpt, footer);
                card.append(image, body);

                card.addEventListener('click', () => {
                    openBlogModal(blog._id || blog.id);
                });

                blogContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Blog getirme hatası:', error);
            blogContainer.textContent = 'Bloglar şu anda yüklenemiyor.';
        }
    }

    const closeBlogModal = get('closeBlogModal');

    if (closeBlogModal && blogModal) {
        closeBlogModal.addEventListener('click', () => {
            blogModal.style.display = 'none';
        });
    }

    const previousBlogButton = get('prevBlogBtn');
    const nextBlogButton = get('nextBlogBtn');

    if (previousBlogButton && blogContainer) {
        previousBlogButton.addEventListener('click', () => {
            blogContainer.scrollBy({ left: -320, behavior: 'smooth' });
        });
    }

    if (nextBlogButton && blogContainer) {
        nextBlogButton.addEventListener('click', () => {
            blogContainer.scrollBy({ left: 320, behavior: 'smooth' });
        });
    }

    // --------------------------------------------------
    // MOBİL MENÜ
    // --------------------------------------------------

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    function mobilMenuAcikMi() {
        return !!(
            navLinks &&
            (
                navLinks.classList.contains('active') ||
                navLinks.classList.contains('nav-active')
            )
        );
    }

    function mobilMenuKapat() {
        if (!navLinks || !hamburger) return;

        navLinks.classList.remove('active', 'nav-active');
        hamburger.classList.remove('toggle');
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Menüyü aç');
    }

    function mobilMenuAc() {
        if (!navLinks || !hamburger) return;

        navLinks.classList.add('active', 'nav-active');
        hamburger.classList.add('toggle');
        hamburger.setAttribute('aria-expanded', 'true');
        hamburger.setAttribute('aria-label', 'Menüyü kapat');
    }

    if (hamburger && navLinks) {
        hamburger.setAttribute('aria-expanded', 'false');

        hamburger.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();

            if (mobilMenuAcikMi()) {
                mobilMenuKapat();
            } else {
                mobilMenuAc();
            }
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobilMenuKapat();
            });
        });

        document.addEventListener('click', event => {
            if (
                mobilMenuAcikMi() &&
                !navLinks.contains(event.target) &&
                !hamburger.contains(event.target)
            ) {
                mobilMenuKapat();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                mobilMenuKapat();
            }
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 760) {
                mobilMenuKapat();
            }
        });
    }

    // --------------------------------------------------
    // SAYFA BAŞINA DÖN
    // --------------------------------------------------

    const scrollTopButton = get('scrollTopBtn');

    window.addEventListener('scroll', () => {
        document.body.classList.toggle('scrolled', window.scrollY > 50);

        if (scrollTopButton) {
            scrollTopButton.classList.toggle('visible', window.scrollY > 50);
        }
    });

    if (scrollTopButton) {
        scrollTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --------------------------------------------------
    // MODALLAR
    // --------------------------------------------------

    window.addEventListener('click', event => {
        if (serviceModal && event.target === serviceModal) {
            serviceModal.style.display = 'none';
        }

        if (blogModal && event.target === blogModal) {
            blogModal.style.display = 'none';
        }

        const legalModal = get('yasalModal');

        if (legalModal && event.target === legalModal) {
            legalModal.style.display = 'none';
        }
    });

    // --------------------------------------------------
    // YASAL METİNLER
    // --------------------------------------------------

    window.yasalMetinGoster = function (type) {
        const modal = get('yasalModal');
        const title = get('yasalModalTitle');
        const body = get('yasalModalBody');

        if (!modal || !title || !body) return;

        const texts = {
            gizlilik: [
                'Gizlilik Politikası',
                yasalMetinlerData.gizlilikPolitikasi
            ],
            sartlar: [
                'Kullanım Şartları',
                yasalMetinlerData.kullanimSartlari
            ],
            kvkk: [
                'KVKK Aydınlatma Metni',
                yasalMetinlerData.kvkkMetni
            ]
        };

        if (!texts[type]) return;

        title.textContent = texts[type][0];
        body.textContent = texts[type][1] || 'İçerik bulunamadı.';
        modal.style.display = 'flex';
    };

    const closeLegalModal = get('closeYasalModal');

    if (closeLegalModal) {
        closeLegalModal.addEventListener('click', () => {
            const modal = get('yasalModal');
            if (modal) modal.style.display = 'none';
        });
    }

    // --------------------------------------------------
    // PRELOADER
    // --------------------------------------------------

    function preloaderKapat() {
        const preloader = get('preloader');
        if (!preloader) return;

        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        preloader.style.pointerEvents = 'none';
    }

    window.addEventListener('load', preloaderKapat);
    window.setTimeout(preloaderKapat, 2500);

    // --------------------------------------------------
    // SAYFA İÇİ KAYDIRMA
    // --------------------------------------------------

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const href = anchor.getAttribute('href');

            if (!href || href === '#' || href === '#randevu') return;

            let target;

            try {
                target = document.querySelector(href);
            } catch {
                return;
            }

            if (!target) return;

            event.preventDefault();

            const position =
                target.getBoundingClientRect().top + window.scrollY - 85;

            window.scrollTo({
                top: position,
                behavior: 'smooth'
            });
        });
    });

    // --------------------------------------------------
    // BAŞLANGIÇ
    // --------------------------------------------------

    initKVKK();
    siteAyarlariniGetir();
    bloglariGetir();
    urunleriGetir();
});

// --------------------------------------------------
// ÇEREZ VE KVKK BİLGİLENDİRMESİ
// --------------------------------------------------

function initKVKK() {
    if (!document.querySelector('link[data-kvkk-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'kvkk.css';
        link.dataset.kvkkCss = 'true';
        document.head.appendChild(link);
    }

    try {
        if (localStorage.getItem('cookieConsent') === 'true') return;
    } catch (error) {
        console.warn('Çerez tercihi okunamadı:', error);
    }

    if (document.querySelector('.cookie-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';

    banner.innerHTML = `
        <p>
            Sizlere daha iyi hizmet sunabilmek ve site deneyiminizi
            geliştirmek amacıyla çerezler kullanılmaktadır.
        </p>
        <div class="cookie-btn-group">
            <button id="openKvkk" class="btn-kvkk-link" type="button">
                KVKK Metni
            </button>
            <button id="acceptCookie" class="btn-cookie-accept" type="button">
                Kabul Et
            </button>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = 'kvkkModal';
    modal.className = 'kvkk-modal';

    modal.innerHTML = `
        <div class="kvkk-content">
            <button id="closeKvkk" class="close-kvkk" type="button"
                    aria-label="Kapat">&times;</button>
            <h2>Kişisel Verilerin Korunması (KVKK)</h2>
            <p><strong>Rana İşitme Merkezi</strong> olarak kişisel
            verilerinizin güvenliğine önem veriyoruz.</p>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında
            kişisel verileriniz, iletişim ve hizmet süreçlerinin yürütülmesi
            amacıyla işlenebilir.</p>
            <p>Detaylı bilgi için kliniğimizle iletişime geçebilirsiniz.</p>
        </div>
    `;

    document.body.append(banner, modal);

    const acceptButton = document.getElementById('acceptCookie');
    const openButton = document.getElementById('openKvkk');
    const closeButton = document.getElementById('closeKvkk');

    acceptButton?.addEventListener('click', () => {
        try {
            localStorage.setItem('cookieConsent', 'true');
        } catch (error) {
            console.warn('Çerez tercihi kaydedilemedi:', error);
        }

        banner.remove();
    });

    openButton?.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeButton?.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}
