/* Rana İşitme Merkezi - frontend/app.js
   WhatsApp randevu yönlendirmesi ve mevcut ana sayfa özellikleri.
*/
document.addEventListener('DOMContentLoaded', () => {
    const isLocal =
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';

    const API_URL = isLocal ? 'http://localhost:5501/api' : '/api';
    const WHATSAPP_NUMARA = '905519849333';
    const WHATSAPP_MESAJ =
        'Merhaba, Rana İşitme Merkezi üzerinden randevu almak istiyorum. Randevu konusunda yardımcı olabilir misiniz?';

    function whatsappRandevu(mesaj = WHATSAPP_MESAJ) {
        const url =
            `https://wa.me/${WHATSAPP_NUMARA}?text=${encodeURIComponent(mesaj)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }

    // Eski sayfalarda kalmış #randevu bağlantıları da WhatsApp'a gider.
    document.addEventListener('click', (event) => {
        const link = event.target.closest('a[href="#randevu"]');
        if (!link) return;

        event.preventDefault();
        whatsappRandevu();
    }, true);

    // Eski HTML onclick kodları tarafından çağrılırsa da WhatsApp açılır.
    window.randevuAdimGec = () => whatsappRandevu();

    // Bildirim
    window.showToast = (message, type = 'info') => {
        let container = document.getElementById('toast-container');

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

    // Telefon ve T.C. kimlik numarası biçimlendirme (ilgili alan varsa)
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
        const input = document.getElementById(inputId);
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

    // Dinamik site ayarları
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

            if (ayarlar.favicon) {
                let favicon = document.querySelector("link[rel~='icon']");
                if (!favicon) {
                    favicon = document.createElement('link');
                    favicon.rel = 'icon';
                    document.head.appendChild(favicon);
                }
                favicon.href = ayarlar.favicon;
            }

            if (ayarlar.heroGorsel) {
                const hero = document.querySelector('.hero');
                if (hero) {
                    hero.style.background =
                        `linear-gradient(rgba(255,255,255,.8), rgba(255,255,255,.8)), url("${ayarlar.heroGorsel}") center/cover`;
                }
            }

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

            const aboutTitle = document.getElementById('aboutTitle');
            const aboutContent = document.getElementById('aboutContent');
            const aboutImage = document.getElementById('aboutImage');

            if (aboutTitle && ayarlar.hakkimizda) {
                aboutTitle.textContent = ayarlar.hakkimizda.baslik || '';
            }
            if (aboutContent && ayarlar.hakkimizda) {
                aboutContent.textContent = ayarlar.hakkimizda.icerik || '';
            }
            if (aboutImage && ayarlar.hakkimizda?.gorsel) {
                aboutImage.src = ayarlar.hakkimizda.gorsel;
            }

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
                pageSaatler.textContent =
                    `Hafta İçi: ${ayarlar.calismaSaatleri.haftaici || ''} | ` +
                    `Cumartesi: ${ayarlar.calismaSaatleri.cumartesi || ''} | ` +
                    `Pazar: ${ayarlar.calismaSaatleri.pazar || ''}`;
            }

            if (googleMapFrame && ayarlar.haritaEmbed) {
                let embedUrl = ayarlar.haritaEmbed;
                const match = embedUrl.match(/src=["']([^"']+)["']/);
                if (match) embedUrl = match[1];
                googleMapFrame.src = embedUrl;
            }

            const footerIletisim = document.getElementById('footerIletisim');
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

            const footerSaatler = document.getElementById('footerSaatler');
            if (footerSaatler && ayarlar.calismaSaatleri) {
                footerSaatler.innerHTML = `
                    <h4>Çalışma Saatleri</h4>
                    <p>Pzt - Cuma: ${ayarlar.calismaSaatleri.haftaici || ''}</p>
                    <p>Cumartesi: ${ayarlar.calismaSaatleri.cumartesi || ''}</p>
                    <p>Pazar: ${ayarlar.calismaSaatleri.pazar || ''}</p>
                `;
                            }

            function sosyalMedyaYukle(element, social) {
                if (!element || !social) return;
                const platforms = [
                    ['facebook', 'facebook-f'],
                    ['twitter', 'twitter'],
                    ['instagram', 'instagram'],
                    ['linkedin', 'linkedin-in']
                ];

                element.innerHTML = platforms
                    .filter(([key]) => social[key] && social[key] !== '#')
                    .map(([key, icon]) =>
                        `<a href="${social[key]}" target="_blank" rel="noopener noreferrer" aria-label="${key}"><i class="fab fa-${icon}"></i></a>`
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

            const servicesContainer =
                document.getElementById('servicesContainer');

            if (
                servicesContainer &&
                Array.isArray(ayarlar.hizmetler) &&
                ayarlar.hizmetler.length
            ) {
                servicesContainer.querySelectorAll('.service-card')
                    .forEach(card => card.remove());

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

    // Hizmet detay penceresi
    const serviceModal = document.getElementById('serviceModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

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

    const closeServiceModal =
        document.querySelector('.close-service-modal');
    if (closeServiceModal && serviceModal) {
        closeServiceModal.addEventListener('click', () => {
            serviceModal.style.display = 'none';
        });
    }

    // Blog yazıları ve blog detay penceresi
    const blogContainer = document.getElementById('blogKapsayici');
    let allBlogs = [];

    function openBlogModal(id) {
        const blog = allBlogs.find(
            item => String(item._id || item.id) === String(id)
        );
        const blogModal = document.getElementById('blogModal');
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
        if (body) body.textContent = blog.icerik || '';

        blogModal.style.display = 'flex';
    }

    async function bloglariGetir() {
        if (!blogContainer) return;

        try {
            const response = await fetch(`${API_URL}/blog?_t=${Date.now()}`);
            if (!response.ok) throw new Error('Bloglar alınamadı.');

            const result = await response.json();
            allBlogs = result.veri || [];
            blogContainer.innerHTML = '';

            if (!allBlogs.length) {
                blogContainer.textContent =
                    'Henüz paylaşılmış bir blog yazısı bulunamadı.';
                return;
            }

            allBlogs.forEach(blog => {
                const card = document.createElement('div');
                card.className = 'blog-card';

                const image = document.createElement('img');
                image.src = blog.gorselUrl || '';
                image.alt = blog.baslik || 'Blog görseli';
                image.className = 'blog-img';

                const body = document.createElement('div');
                body.className = 'blog-body';

                const title = document.createElement('h3');
                title.textContent = blog.baslik || '';

                const excerpt = document.createElement('p');
                excerpt.textContent =
                    `${String(blog.icerik || '').substring(0, 120)}...`;

                const footer = document.createElement('div');
                footer.className = 'blog-footer';
                const date = blog.createdAt
                    ? new Date(blog.createdAt).toLocaleDateString('tr-TR')
                    : '';
                footer.textContent = `${blog.yazar || ''} · ${date}`;

                body.append(title, excerpt, footer);
                card.append(image, body);
                card.addEventListener('click', () =>
                    openBlogModal(blog._id || blog.id)
                );
                blogContainer.appendChild(card);
            });
        } catch (error) {
            console.error('Blog getirme hatası:', error);
            blogContainer.textContent = 'Bloglar şu anda yüklenemiyor.';
        }
    }

    const closeBlogModal = document.getElementById('closeBlogModal');
    const blogModal = document.getElementById('blogModal');
    if (closeBlogModal && blogModal) {
        closeBlogModal.addEventListener('click', () => {
            blogModal.style.display = 'none';
        });
    }

    const previousBlogButton = document.getElementById('prevBlogBtn');
    const nextBlogButton = document.getElementById('nextBlogBtn');

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

    // Mobil menü
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
        if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('toggle');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('nav-active')) {
                    navLinks.classList.remove('nav-active');
                    hamburger.classList.remove('toggle');
                }
            });
        });
    }

    // Sayfa başına dön ve navbar kaydırma efekti
    const scrollTopButton = document.getElementById('scrollTopBtn');

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

    // Modal dışına tıklanınca kapat
    window.addEventListener('click', event => {
        if (serviceModal && event.target === serviceModal) {
            serviceModal.style.display = 'none';
        }
        if (blogModal && event.target === blogModal) {
            blogModal.style.display = 'none';
        }
        const legalModal = document.getElementById('yasalModal');
        if (legalModal && event.target === legalModal) {
            legalModal.style.display = 'none';
        }
    });

    // Yasal metin penceresi
    window.yasalMetinGoster = function (type) {
        const modal = document.getElementById('yasalModal');
        const title = document.getElementById('yasalModalTitle');
        const body = document.getElementById('yasalModalBody');
        if (!modal || !title || !body) return;

        const texts = {
            gizlilik: ['Gizlilik Politikası', yasalMetinlerData.gizlilikPolitikasi],
            sartlar: ['Kullanım Şartları', yasalMetinlerData.kullanimSartlari],
            kvkk: ['KVKK Aydınlatma Metni', yasalMetinlerData.kvkkMetni]
        };

        if (!texts[type]) return;
        title.textContent = texts[type][0];
        body.textContent = texts[type][1] || 'İçerik bulunamadı.';
        modal.style.display = 'flex';
    };

    const closeLegalModal = document.getElementById('closeYasalModal');
    if (closeLegalModal) {
        closeLegalModal.addEventListener('click', () => {
            const modal = document.getElementById('yasalModal');
            if (modal) modal.style.display = 'none';
        });
    }

    // Preloader
    window.addEventListener('load', () => {
        const preloader = document.getElementById('preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            preloader.style.visibility = 'hidden';
        }
    });

    // Sayfa içi yumuşak kaydırma
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#' || href === '#randevu') return;

            const target = document.querySelector(href);
            if (!target) return;

            event.preventDefault();
            const offset = 85;
            const position =
                target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top: position, behavior: 'smooth' });
        });
    });

    // İç sayfa geçiş efekti; harici bağlantılar ve WhatsApp etkilenmez.
    document.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            const target = link.getAttribute('target');

            if (
                !href ||
                href.startsWith('#') ||
                target === '_blank' ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('https://wa.me/')
            ) return;

            event.preventDefault();
            document.body.classList.add('fade-out');
            window.setTimeout(() => {
                window.location.href = href;
            }, 300);
        });
    });

    // Çerez ve KVKK bilgilendirmesi
    initKVKK();

    // Verileri yükle
    siteAyarlariniGetir();
    bloglariGetir();
});

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

    document.getElementById('acceptCookie').addEventListener('click', () => {
        try {
            localStorage.setItem('cookieConsent', 'true');
        } catch (error) {
            console.warn('Çerez tercihi kaydedilemedi:', error);
        }
        banner.remove();
    });

    document.getElementById('openKvkk').addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    document.getElementById('closeKvkk').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', event => {
        if (event.target === modal) modal.style.display = 'none';
    });
}
