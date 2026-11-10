
document.addEventListener('DOMContentLoaded', () => {
    // API URL
    const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    const API_URL = isLocal ? 'http://localhost:5501/api' : '/api';

    // WHATSAPP RANDEVU AYARLARI
    const WHATSAPP_NUMARA = '905519849333';

    function whatsappRandevu(mesaj = 'Merhaba, Rana İşitme Merkezi üzerinden randevu almak istiyorum. Randevu konusunda yardımcı olabilir misiniz?') {
        const url = `https://wa.me/${WHATSAPP_NUMARA}?text=${encodeURIComponent(mesaj)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Randevu bağlantılarını WhatsApp'a yönlendir
    document.addEventListener('click', function (e) {
        const hedef = e.target.closest('a, button, [role="button"]');
        if (!hedef) return;

        const href = hedef.getAttribute('href') || '';
        const metin = [
            hedef.innerText,
            hedef.textContent,
            hedef.getAttribute('aria-label'),
            hedef.id,
            hedef.className
        ].join(' ').toLocaleLowerCase('tr-TR');

        const randevuLinki =
            href.includes('#randevu') ||
            /randevu|randevu-al|appointment/.test(metin);

        if (randevuLinki) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            whatsappRandevu();
        }
    }, true);

    // Sayfa doğrudan #randevu bağlantısıyla açılırsa WhatsApp'a yönlendir
    if (window.location.hash === '#randevu') {
        history.replaceState(null, '', window.location.pathname + window.location.search);
        whatsappRandevu();
    }

    // Eski HTML'deki randevu adım butonları için güvenli yönlendirme
    window.randevuAdimGec = function () {
        whatsappRandevu();
    };

    // TOAST BİLDİRİMİ
    window.showToast = (mesaj, tip = 'info') => {
        let container = document.getElementById('toast-container');

        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.style.cssText = `
                position:fixed;
                top:20px;
                right:20px;
                z-index:10000;
                display:flex;
                flex-direction:column;
                gap:10px;
                pointer-events:none;
            `;
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${tip}`;
        toast.style.cssText = `
            background:#fff;
            color:#333;
            padding:14px 18px;
            border-radius:8px;
            box-shadow:0 4px 15px rgba(0,0,0,.15);
            pointer-events:auto;
        `;

        toast.textContent = mesaj;
        container.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    };

    // TELEFON VE TC FORMATLAMA
    function formatla(deger, tur) {
        if (!deger) return '';

        deger = deger.toString().replace(/\D/g, '');

        if (tur === 'telefon') {
            if (deger.startsWith('0')) deger = deger.substring(1);
            deger = deger.substring(0, 10);

            let formatli = '';

            if (deger.length > 0) formatli = '(' + deger.substring(0, 3);
            if (deger.length >= 4) formatli += ') ' + deger.substring(3, 6);
            if (deger.length >= 7) formatli += ' ' + deger.substring(6, 8);
            if (deger.length >= 9) formatli += ' ' + deger.substring(8, 10);

            return formatli;
        }

        return deger.substring(0, 11);
    }

    function inputFormatla(inputId, tur) {
        const input = document.getElementById(inputId);
        if (!input) return;

        input.addEventListener('input', e => {
            e.target.value = formatla(e.target.value, tur);
        });
    }

    inputFormatla('telefon', 'telefon');
    inputFormatla('sorguTc', 'tc');
    inputFormatla('tcKimlik', 'tc');

    // ESKİ RANDEVU FORMUNUN VERİTABANINA GÖNDERİLMESİNİ ENGELLE
    const eskiRandevuFormu = document.getElementById('randevuFormu');

    if (eskiRandevuFormu) {
        eskiRandevuFormu.addEventListener('submit', e => {
            e.preventDefault();
            e.stopImmediatePropagation();
            whatsappRandevu();
        }, true);
    }
// Eski randevu formunu ziyaretçilerden gizle
document.addEventListener('DOMContentLoaded', function () {
    const eskiForm = document.getElementById('randevuFormu');

    if (eskiForm) {
        const modal = eskiForm.closest('.modal, .randevu-modal, #randevuModal');

        if (modal) {
            modal.style.display = 'none';
            modal.remove();
        } else {
            eskiForm.style.display = 'none';
        }
    }
});
    // DİNAMİK SİTE AYARLARI
    let dynamicServiceDetails = {};
    let yasalMetinlerData = {};

    async function siteAyarlariniGetir() {
        try {
            const response = await fetch(
                `${API_URL}/site-ayarlari?_t=${Date.now()}`
            );

            if (!response.ok) return;

            const ayarlar = await response.json();

            yasalMetinlerData = ayarlar.yasalMetinler || {};

            // Logo
            if (ayarlar.logo) {
                document.querySelectorAll('.logo, .footer-logo').forEach(el => {
                    const img = document.createElement('img');
                    img.src = ayarlar.logo;
                    img.alt = 'Rana İşitme Merkezi';
                    img.style.height = '40px';
                    img.style.verticalAlign = 'middle';
                    el.replaceChildren(img);
                });
            }

            // Favicon
            if (ayarlar.favicon) {
                let link = document.querySelector("link[rel~='icon']");

                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.head.appendChild(link);
                }

                link.href = ayarlar.favicon;
            }

            // Ana görsel
            if (ayarlar.heroGorsel) {
                const hero = document.querySelector('.hero');

                if (hero) {
                    hero.style.background =
                        `linear-gradient(rgba(255,255,255,.8), rgba(255,255,255,.8)), url('${ayarlar.heroGorsel}') center/cover`;
                }
            }

            // Renkler
            if (ayarlar.anaRenk) {
                document.documentElement.style.setProperty(
                    '--primary-color',
                    ayarlar.anaRenk
                );
            }

            if (ayarlar.ikincilRenk) {
                document.documentElement.style.setProperty(
                    '--accent-color',
                    ayarlar.ikincilRenk
                );
            }

            // Hakkımızda
            const aboutTitle = document.getElementById('aboutTitle');
            const aboutContent = document.getElementById('aboutContent');
            const aboutImage = document.getElementById('aboutImage');

            if (aboutTitle && ayarlar.hakkimizda) {
                aboutTitle.textContent = ayarlar.hakkimizda.baslik || '';
                aboutContent.innerHTML =
                    (ayarlar.hakkimizda.icerik || '').replace(/\n/g, '<br>');

                if (aboutImage && ayarlar.hakkimizda.gorsel) {
                    aboutImage.src = ayarlar.hakkimizda.gorsel;
                }
            }

            // İletişim bilgileri
            const iletisim = ayarlar.iletisim || {};

            const headerTelefon = document.getElementById('headerTelefon');
            const headerEmail = document.getElementById('headerEmail');
            const headerAdres = document.getElementById('headerAdres');

            if (headerTelefon && iletisim.telefon) {
                headerTelefon.innerHTML =
                    `<a href="tel:${iletisim.telefon}">${iletisim.telefon}</a>`;
            }

            if (headerEmail && iletisim.email) {
                headerEmail.innerHTML =
                    `<a href="mailto:${iletisim.email}">${iletisim.email}</a>`;
            }

            if (headerAdres && iletisim.adres) {
                headerAdres.textContent = iletisim.adres;
            }

            const pageAdres = document.getElementById('pageAdres');
            const pageTelefon = document.getElementById('pageTelefon');
            const pageEmail = document.getElementById('pageEmail');
            const pageSaatler = document.getElementById('pageSaatler');
            const googleMapFrame = document.getElementById('googleMapFrame');

            if (pageAdres) pageAdres.textContent = iletisim.adres || '';

            if (pageTelefon && iletisim.telefon) {
                pageTelefon.innerHTML =
                    `<a href="tel:${iletisim.telefon}">${iletisim.telefon}</a>`;
            }

            if (pageEmail && iletisim.email) {
                pageEmail.innerHTML =
                    `<a href="mailto:${iletisim.email}">${iletisim.email}</a>`;
            }

            if (pageSaatler && ayarlar.calismaSaatleri) {
                pageSaatler.innerHTML = `
                    Hafta İçi: ${ayarlar.calismaSaatleri.haftaici || ''}
                    <br>
                    Cumartesi: ${ayarlar.calismaSaatleri.cumartesi || ''}
                    <br>
                    Pazar: ${ayarlar.calismaSaatleri.pazar || ''}
                `;
            }

            if (googleMapFrame && ayarlar.haritaEmbed) {
                let embedUrl = ayarlar.haritaEmbed;
                const match = embedUrl.match(/src=["']([^"']+)["']/);

                if (match) embedUrl = match[1];

                googleMapFrame.src = embedUrl;
            }

            // Footer iletişim
            const footerIletisim = document.getElementById('footerIletisim');

            if (footerIletisim) {
                footerIletisim.innerHTML = `
                    ${iletisim.adres ? `<li>📍 ${iletisim.adres}</li>` : ''}
                    ${iletisim.telefon ? `<li><a href="tel:${iletisim.telefon}">📞 ${iletisim.telefon}</a></li>` : ''}
                    ${iletisim.email ? `<li><a href="mailto:${iletisim.email}">✉️ ${iletisim.email}</a></li>` : ''}
                `;
            }

            // Footer çalışma saatleri
            const footerSaatler = document.getElementById('footerSaatler');

            if (footerSaatler && ayarlar.calismaSaatleri) {
                footerSaatler.innerHTML = `
                    <h4>Çalışma Saatleri</h4>
                    <p>Pzt - Cuma: ${ayarlar.calismaSaatleri.haftaici || ''}</p>
                    <p>Cumartesi: ${ayarlar.calismaSaatleri.cumartesi || ''}</p>
                    <p>Pazar: ${ayarlar.calismaSaatleri.pazar || ''}</p>
                `;
            }

            // Sosyal medya
            function sosyalMedyaYukle(element, sm) {
                if (!element || !sm) return;

                const platformlar = [
                    ['facebook', 'facebook-f'],
                    ['twitter', 'twitter'],
                    ['instagram', 'instagram'],
                    ['linkedin', 'linkedin-in']
                ];

                element.innerHTML = platformlar
                    .filter(([key]) => sm[key] && sm[key] !== '#')
                    .map(([key, ikon]) =>
                        `<a href="${sm[key]}" target="_blank" rel="noopener noreferrer"><i class="fab fa-${ikon}"></i></a>`
                    )
                    .join('');
            }

            sosyalMedyaYukle(
                document.querySelector('.social-links'),
                ayarlar.sosyalMedya
            );

            sosyalMedyaYukle(
                document.getElementById('headerSocials'),
                ayarlar.sosyalMedya
            );

            // Hizmet kartları
            const servicesContainer =
                document.getElementById('servicesContainer');

            if (
                servicesContainer &&
                Array.isArray(ayarlar.hizmetler) &&
                ayarlar.hizmetler.length
            ) {
                servicesContainer.querySelectorAll('.service-card')
                    .forEach(card => card.remove());

                ayarlar.hizmetler.forEach((hizmet, index) => {
                    dynamicServiceDetails[hizmet.key] = {
                        title: hizmet.baslik,
                        content: `<p>${hizmet.ozet || 'Detaylar yakında...'}</p>`
                    };

                    const card = document.createElement('div');
                    card.className = 'service-card';
                    card.dataset.key = hizmet.key;
                    card.style.setProperty('--delay', `${index * 0.1}s`);

                    card.innerHTML = `
                        <div class="card-content">
                            <div class="icon">
                                <i class="${hizmet.ikon || ''}"></i>
                            </div>
                            <h3>${hizmet.baslik || ''}</h3>
                            <p>${hizmet.ozet || ''}</p>
                        </div>
                    `;

                    servicesContainer.appendChild(card);
                });

                servicesContainer.classList.add('loaded');
                attachServiceClickEvents();
            }

        } catch (error) {
            console.error('Site ayarları yüklenemedi:', error);
        }
    }

    siteAyarlariniGetir();

    // BLOG YAZILARI
    const blogKapsayici = document.getElementById('blogKapsayici');
    let allBlogs = [];

    async function bloglariGetir() {
        if (!blogKapsayici) return;

        try {
            const response = await fetch(
                `${API_URL}/blog?_t=${Date.now()}`
            );

            if (!response.ok) {
                throw new Error('Bloglar alınamadı.');
            }

            const sonuc = await response.json();
            allBlogs = sonuc.veri || [];

            blogKapsayici.innerHTML = '';

            if (!allBlogs.length) {
                blogKapsayici.textContent =
                    'Henüz paylaşılmış bir blog yazısı bulunamadı.';
                return;
            }

            allBlogs.forEach(yazi => {
                const kart = document.createElement('div');
                kart.className = 'blog-card';

                const img = document.createElement('img');
                img.src = yazi.gorselUrl || '';
                img.alt = yazi.baslik || 'Blog görseli';
                img.className = 'blog-img';

                const body = document.createElement('div');
                body.className = 'blog-body';

                const title = document.createElement('h3');
                title.textContent = yazi.baslik || '';

                const content = document.createElement('p');
                content.textContent =
                    (yazi.icerik || '').substring(0, 120) + '...';

                const footer = document.createElement('div');
                footer.className = 'blog-footer';
                footer.textContent =
                    `${yazi.yazar || ''} · ${new Date(yazi.createdAt).toLocaleDateString('tr-TR')}`;

                body.append(title, content, footer);
                kart.append(img, body);

                kart.addEventListener('click', () => {
                    openBlogModal(yazi._id || yazi.id);
                });

                blogKapsayici.appendChild(kart);
            });

        } catch (error) {
            console.error('Blog getirme hatası:', error);
            blogKapsayici.textContent =
                'Bloglar şu anda yüklenemiyor.';
        }
    }

    bloglariGetir();

    // BLOG SLIDER
    const prevBlogBtn = document.getElementById('prevBlogBtn');
    const nextBlogBtn = document.getElementById('nextBlogBtn');

    if (prevBlogBtn && blogKapsayici) {
        prevBlogBtn.addEventListener('click', () => {
            blogKapsayici.scrollBy({
                left: -320,
                behavior: 'smooth'
            });
        });
    }

    if (nextBlogBtn && blogKapsayici) {
        nextBlogBtn.addEventListener('click', () => {
            blogKapsayici.scrollBy({
                left: 320,
                behavior: 'smooth'
            });
        });
    }

    // MOBİL MENÜ
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });
    }

    // NAVBAR SCROLL
    const scrollTopBtn = document.getElementById('scrollTopBtn');

    window.addEventListener('scroll', () => {
        document.body.classList.toggle('scrolled', window.scrollY > 50);

        if (scrollTopBtn) {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 50);
        }
    });

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // HİZMET MODALI
    const serviceModal = document.getElementById('serviceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const closeServiceModal =
        document.querySelector('.close-service-modal');

    function attachServiceClickEvents() {
        document.querySelectorAll('.service-card').forEach(card => {
            if (card.dataset.listenerAdded) return;
            card.dataset.listenerAdded = 'true';

            card.addEventListener('click', () => {
                const data = dynamicServiceDetails[card.dataset.key];

                if (!data || !serviceModal) return;

                if (modalTitle) modalTitle.textContent = data.title;
                if (modalBody) modalBody.innerHTML = data.content;

                serviceModal.style.display = 'flex';
            });
        });
    }

    attachServiceClickEvents();

    if (closeServiceModal && serviceModal) {
        closeServiceModal.addEventListener('click', () => {
            serviceModal.style.display = 'none';
        });
    }

    // BLOG MODALI
    const blogModal = document.getElementById('blogModal');
    const closeBlogModal = document.getElementById('closeBlogModal');

    function openBlogModal(id) {
        const blog = allBlogs.find(
            b => String(b._id || b.id) === String(id)
        );

        if (!blog || !blogModal) return;

        const image = document.getElementById('blogModalImage');
        const title = document.getElementById('blogModalTitle');
        const meta = document.getElementById('blogModalMeta');
        const body = document.getElementById('blogModalBody');

        if (image) {
            image.src = blog.gorselUrl || '';
            image.alt = blog.baslik || '';
        }

        if (title) title.textContent = blog.baslik || '';

        if (meta) {
            meta.textContent =
                `${blog.yazar || ''} · ${new Date(blog.createdAt).toLocaleDateString('tr-TR')}`;
        }

        if (body) {
            body.textContent = blog.icerik || '';
        }

        blogModal.style.display = 'flex';
    }

    if (closeBlogModal && blogModal) {
        closeBlogModal.addEventListener('click', () => {
            blogModal.style.display = 'none';
        });
    }

    // MODAL DIŞINA TIKLAYINCA KAPAT
    window.addEventListener('click', e => {
        if (serviceModal && e.target === serviceModal) {
            serviceModal.style.display = 'none';
        }

        if (blogModal && e.target === blogModal) {
            blogModal.style.display = 'none';
        }

        const yasalModal = document.getElementById('yasalModal');

        if (yasalModal && e.target === yasalModal) {
            yasalModal.style.display = 'none';
        }
    });

    // YASAL METİN MODALI
    window.yasalMetinGoster = function (tip) {
        const modal = document.getElementById('yasalModal');
        const title = document.getElementById('yasalModalTitle');
        const body = document.getElementById('yasalModalBody');

        if (!modal || !title || !body) return;

        const metinler = {
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

        if (metinler[tip]) {
            title.textContent = metinler[tip][0];
            body.textContent = metinler[tip][1] || 'İçerik bulunamadı.';
            modal.style.display = 'flex';
        }
    };

    const closeYasalModal = document.getElementById('closeYasalModal');

    if (closeYasalModal) {
        closeYasalModal.addEventListener('click', () => {
            const modal = document.getElementById('yasalModal');
            if (modal) modal.style.display = 'none';
        });
    }

    // PRELOADER
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');

        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    });

    // SAYFA İÇİ KAYDIRMA
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');

            if (!targetId || targetId === '#randevu') return;

            const target = document.querySelector(targetId);

            if (target) {
                e.preventDefault();

                const offset = 85;
                const position =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    offset;

                window.scrollTo({
                    top: position,
                    behavior: 'smooth'
                });

                if (
                    navLinks &&
                    navLinks.classList.contains('nav-active') &&
                    hamburger
                ) {
                    hamburger.click();
                }
            }
        });
    });

    // KVKK VE ÇEREZ
    initKVKK();

    // İÇ SAYFA GEÇİŞ EFEKTİ
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            const target = this.getAttribute('target');

            if (
                !href ||
                href.startsWith('#') ||
                target === '_blank' ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('https://wa.me/')
            ) {
                return;
            }

            e.preventDefault();
            document.body.classList.add('fade-out');

            setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });
});

function initKVKK() {
    // CSS
    if (!document.querySelector('link[data-kvkk-css]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'kvkk.css';
        link.dataset.kvkkCss = 'true';
        document.head.appendChild(link);
    }

    // Daha önce kabul edildiyse banner gösterme
    if (localStorage.getItem('cookieConsent') === 'true') {
        return;
    }

    if (document.querySelector('.cookie-banner')) return;

    const bannerDiv = document.createElement('div');
    bannerDiv.className = 'cookie-banner';

    bannerDiv.innerHTML = `
        <p>
            Sizlere daha iyi hizmet sunabilmek ve site deneyiminizi
            geliştirmek amacıyla çerezler kullanılmaktadır.
        </p>
        <div class="cookie-btn-group">
            <button id="openKvkk" class="btn-kvkk-link">
                KVKK Metni
            </button>
            <button id="acceptCookie" class="btn-cookie-accept">
                Kabul Et
            </button>
        </div>
    `;

    const modalDiv = document.createElement('div');
    modalDiv.id = 'kvkkModal';
    modalDiv.className = 'kvkk-modal';

    modalDiv.innerHTML = `
        <div class="kvkk-content">
            <span id="closeKvkk" class="close-kvkk">&times;</span>
            <h2>Kişisel Verilerin Korunması (KVKK)</h2>
            <p><strong>Rana İşitme Merkezi</strong> olarak kişisel
            verilerinizin güvenliğine önem veriyoruz.</p>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu
            kapsamında kişisel verileriniz, iletişim ve hizmet
            süreçlerinin yürütülmesi amacıyla işlenebilir.</p>
            <p>Detaylı bilgi için kliniğimizle iletişime geçebilirsiniz.</p>
        </div>
    `;

    document.body.append(bannerDiv, modalDiv);

    document.getElementById('acceptCookie').addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'true');
        bannerDiv.style.display = 'none';
    });

    document.getElementById('openKvkk').addEventListener('click', () => {
        modalDiv.style.display = 'flex';
    });

    document.getElementById('closeKvkk').addEventListener('click', () => {
        modalDiv.style.display = 'none';
    });

    modalDiv.addEventListener('click', e => {
        if (e.target === modalDiv) {
            modalDiv.style.display = 'none';
        }
    });
}
