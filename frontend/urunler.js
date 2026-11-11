
document.addEventListener('DOMContentLoaded', () => {

    const urunlerListesi = document.getElementById('urunler-listesi');
    const categoryList = document.getElementById('categoryList');
    const brandList = document.getElementById('brandList');
    const tagList = document.getElementById('tagList');

    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    const clearFilters = document.getElementById('clearFilters');
    const productCount = document.getElementById('productCount');

    if (
        !urunlerListesi ||
        !categoryList ||
        !brandList ||
        !tagList ||
        !productModal ||
        !closeProductModal
    ) {
        console.error('Ürünler sayfasında gerekli HTML elemanları bulunamadı.');
        return;
    }

    let allProducts = [];

    let filters = {
        kategori: null,
        marka: null,
        etiket: null
    };

    const normalizeText = (value) => {
        return String(value || '')
            .trim()
            .toLocaleLowerCase('tr-TR');
    };

    const uniqueList = (items) => {
        return [...new Set(items.filter(Boolean))];
    };

    const createElement = (tag, className, text) => {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined && text !== null) {
            element.textContent = String(text);
        }

        return element;
    };

    const getImageUrl = (url) => {
        if (!url || typeof url !== 'string') {
            return 'logo.png';
        }

        return url.trim() || 'logo.png';
    };

    /* ETİKETLERİ OLUŞTUR */

    const buildTagList = () => {

        const tags = new Set();

        allProducts.forEach(product => {

            if (!product.ad) return;

            String(product.ad)
                .split(/[^\p{L}0-9]+/u)
                .forEach(word => {

                    const normalized = normalizeText(word);

                    if (normalized.length > 2) {
                        tags.add(normalized);
                    }

                });

        });

        return [...tags].sort((a, b) => a.localeCompare(b, 'tr'));

    };

    /* FİLTRELERİ OLUŞTUR */

    const renderFilterGroup = (container, type, title, values) => {

        container.innerHTML = '';

        const allItem = document.createElement('li');
        const allLink = document.createElement('a');

        allLink.href = '#';
        allLink.className = `filter-link ${filters[type] ? '' : 'active'}`;
        allLink.dataset.type = type;
        allLink.dataset.value = '';

        allLink.textContent = title;

        allItem.appendChild(allLink);
        container.appendChild(allItem);

        values.forEach(value => {

            const item = document.createElement('li');
            const link = document.createElement('a');

            link.href = '#';

            link.className =
                `filter-link ${filters[type] === value ? 'active' : ''}`;

            link.dataset.type = type;
            link.dataset.value = value;
            link.textContent = value;

            item.appendChild(link);
            container.appendChild(item);

        });

    };

    const renderFilters = () => {

        const categories = uniqueList(
            allProducts.map(product => product.kategori || 'Diğer')
        ).sort((a, b) => a.localeCompare(b, 'tr'));

        const brands = uniqueList(
            allProducts.map(product => product.marka || 'Diğer')
        ).sort((a, b) => a.localeCompare(b, 'tr'));

        const tags = buildTagList();

        renderFilterGroup(
            categoryList,
            'kategori',
            'Tüm Kategoriler',
            categories
        );

        renderFilterGroup(
            brandList,
            'marka',
            'Tüm Markalar',
            brands
        );

        tagList.innerHTML = '';

        tags.forEach(tag => {

            const link = document.createElement('a');

            link.href = '#';
            link.className =
                `tag-item ${filters.etiket === tag ? 'active' : ''}`;

            link.dataset.type = 'etiket';
            link.dataset.value = tag;
            link.textContent = tag;

            tagList.appendChild(link);

        });

    };

    /* ÜRÜNLERİ FİLTRELE */

    const filterProducts = () => {

        return allProducts.filter(product => {

            if (
                filters.kategori &&
                (product.kategori || 'Diğer') !== filters.kategori
            ) {
                return false;
            }

            if (
                filters.marka &&
                (product.marka || 'Diğer') !== filters.marka
            ) {
                return false;
            }

            if (
                filters.etiket &&
                !normalizeText(product.ad).includes(filters.etiket)
            ) {
                return false;
            }

            return true;

        });

    };

    /* STOK BİLGİSİ */

    const createStockElement = (product) => {

        const inStock = Boolean(product.stokDurumu);

        return createElement(
            'span',
            `product-stock ${inStock ? 'in-stock' : 'out-of-stock'}`,
            inStock ? 'Stokta Var' : 'Stokta Yok'
        );

    };

    /* ÜRÜN KARTI */

    const createProductCard = (product) => {

        const card = createElement('article', 'product-card');

        card.dataset.id = product.id;

        const imageWrap = createElement('div', 'product-image-wrap');

        const image = document.createElement('img');

        image.src = getImageUrl(product.gorselUrl);
        image.alt = product.ad || 'İşitme cihazı';
        image.loading = 'lazy';

        image.onerror = () => {
            image.onerror = null;
            image.src = 'logo.png';
        };

        imageWrap.appendChild(image);

        const content = createElement('div', 'product-card-content');

        const brand = createElement(
            'div',
            'product-card-brand',
            product.marka || 'Rana İşitme Merkezi'
        );

        const name = createElement(
            'h3',
            '',
            product.ad || 'İsimsiz Ürün'
        );

        const category = createElement(
            'span',
            'product-card-category',
            product.kategori || 'Diğer'
        );

        const descriptionText = String(product.aciklama || '').trim();

        const shortDescription = descriptionText.length > 85
            ? descriptionText.substring(0, 85) + '...'
            : descriptionText;

        const description = createElement(
            'p',
            'product-card-description',
            shortDescription || 'Ürün hakkında detaylı bilgi için inceleyin.'
        );

        const bottom = createElement('div', 'product-card-bottom');

        bottom.appendChild(createStockElement(product));

        const detailsButton = createElement(
            'a',
            'product-card-link',
            'Ürünü İncele'
        );

        detailsButton.href = '#';
        detailsButton.dataset.id = product.id;

        const arrow = document.createElement('i');
        arrow.className = 'fas fa-arrow-right';

        detailsButton.appendChild(arrow);

        content.appendChild(brand);
        content.appendChild(name);
        content.appendChild(category);
        content.appendChild(description);

        bottom.appendChild(detailsButton);
        content.appendChild(bottom);

        card.appendChild(imageWrap);
        card.appendChild(content);

        return card;

    };

    /* ÜRÜNLERİ EKRANA BAS */

    const renderProducts = (products) => {

        urunlerListesi.innerHTML = '';

        if (productCount) {
            productCount.textContent = `${products.length} ürün gösteriliyor`;
        }

        if (!products.length) {

            const empty = createElement('div', 'product-empty');

            const icon = createElement('i', 'fas fa-search');

            const title = createElement(
                'h3',
                '',
                'Aradığınız ürün bulunamadı'
            );

            const message = createElement(
                'p',
                '',
                'Farklı bir kategori veya marka seçerek tekrar deneyebilirsiniz.'
            );

            empty.appendChild(icon);
            empty.appendChild(title);
            empty.appendChild(message);

            urunlerListesi.appendChild(empty);

            return;

        }

        const fragment = document.createDocumentFragment();

        products.forEach(product => {

            fragment.appendChild(createProductCard(product));

        });

        urunlerListesi.appendChild(fragment);

    };

    /* FİLTRE UYGULA */

    const applyFilters = () => {

        renderFilters();
        renderProducts(filterProducts());

    };

    const setFilter = (type, value) => {

        if (!Object.prototype.hasOwnProperty.call(filters, type)) {
            return;
        }

        filters[type] = value || null;

        if (type !== 'etiket') {
            filters.etiket = null;
        }

        applyFilters();

    };

    const resetFilters = () => {

        filters = {
            kategori: null,
            marka: null,
            etiket: null
        };

        applyFilters();

    };

    /* ÜRÜN DETAYI */

    const openProductModal = (id) => {

        const product = allProducts.find(
            item => String(item.id) === String(id)
        );

        if (!product) return;

        const image = document.getElementById('productModalImage');
        const name = document.getElementById('productModalName');
        const category = document.getElementById('productModalCategory');
        const stock = document.getElementById('productModalStock');
        const description = document.getElementById('productModalDescription');

        image.onerror = () => {
            image.onerror = null;
            image.src = 'logo.png';
        };

        image.src = getImageUrl(product.gorselUrl);
        image.alt = product.ad || 'İşitme cihazı';

        name.textContent = product.ad || 'Ürün Detayı';

        category.textContent = [
            product.marka,
            product.kategori
        ].filter(Boolean).join(' • ');

        stock.textContent = product.stokDurumu
            ? 'Stokta Var'
            : 'Stokta Yok';

        stock.className = product.stokDurumu
            ? 'product-stock in-stock'
            : 'product-stock out-of-stock';

        description.textContent =
            product.aciklama || 'Bu ürün hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.';

        productModal.classList.add('is-open');
        productModal.setAttribute('aria-hidden', 'false');

        document.body.style.overflow = 'hidden';

        closeProductModal.focus();

    };

    const closeModal = () => {

        productModal.classList.remove('is-open');
        productModal.setAttribute('aria-hidden', 'true');

        document.body.style.overflow = '';

    };

    /* ÜRÜNLERİ API'DEN GETİR */

    const urunleriGoster = async () => {

        try {

            const response = await fetch('/api/urunler');

            if (!response.ok) {
                throw new Error('Ürün listesi sunucudan alınamadı.');
            }

            const result = await response.json();

            if (!Array.isArray(result.veri)) {
                throw new Error('Ürün verileri beklenen formatta değil.');
            }

            allProducts = result.veri;

            renderFilters();
            renderProducts(filterProducts());

        } catch (error) {

            console.error('Ürün yükleme hatası:', error);

            urunlerListesi.innerHTML = '';

            const errorBox = createElement(
                'div',
                'product-empty'
            );

            const icon = createElement(
                'i',
                'fas fa-exclamation-circle'
            );

            const title = createElement(
                'h3',
                '',
                'Ürünler şu anda yüklenemiyor'
            );

            const message = createElement(
                'p',
                '',
                'Lütfen internet bağlantınızı kontrol edip sayfayı yeniden deneyin.'
            );

            errorBox.appendChild(icon);
            errorBox.appendChild(title);
            errorBox.appendChild(message);

            urunlerListesi.appendChild(errorBox);

            if (productCount) {
                productCount.textContent = 'Ürünler yüklenemedi';
            }

        }

    };

    /* OLAYLAR */

    urunlerListesi.addEventListener('click', (event) => {

        const button = event.target.closest('.product-card-link');

        if (!button) return;

        event.preventDefault();

        openProductModal(button.dataset.id);

    });

    [categoryList, brandList, tagList].forEach(container => {

        container.addEventListener('click', (event) => {

            const target = event.target.closest('[data-type]');

            if (!target) return;

            event.preventDefault();

            setFilter(
                target.dataset.type,
                target.dataset.value || ''
            );

        });

    });

    closeProductModal.addEventListener('click', closeModal);

    productModal.addEventListener('click', (event) => {

        if (event.target === productModal) {
            closeModal();
        }

    });

    document.addEventListener('keydown', (event) => {

        if (event.key === 'Escape') {
            closeModal();
        }

    });

    if (clearFilters) {
        clearFilters.addEventListener('click', resetFilters);
    }

    /* SAYFAYI BAŞLAT */

    urunleriGoster();

});
