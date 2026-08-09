document.addEventListener('DOMContentLoaded', () => {
    const urunlerListesi = document.getElementById('urunler-listesi');
    const categoryList = document.getElementById('categoryList');
    const brandList = document.getElementById('brandList');
    const tagList = document.getElementById('tagList');
    const productModal = document.getElementById('productModal');
    const closeProductModal = document.getElementById('closeProductModal');
    let allProducts = []; // Tüm ürünleri saklamak için
    let filters = {
        kategori: null,
        marka: null,
        etiket: null
    };

    const normalizeTag = (text) => {
        return text.trim().toLowerCase();
    };

    const getUniqueList = (items) => [...new Set(items.filter(Boolean))];

    const buildTagList = () => {
        const tags = new Set();
        allProducts.forEach(urun => {
            if (!urun.ad) return;
            urun.ad.split(/[^\p{L}0-9]+/u).forEach(word => {
                const normalized = normalizeTag(word);
                if (normalized.length > 2) tags.add(normalized);
            });
        });
        return [...tags].sort((a, b) => a.localeCompare(b, 'tr'));
    };

    const renderFilters = () => {
        const categories = getUniqueList(allProducts.map(urun => urun.kategori || 'Diğer'));
        const brands = getUniqueList(allProducts.map(urun => urun.marka || 'Diğer'));
        const tags = buildTagList();

        categoryList.innerHTML = `<li><a href="#" class="filter-link ${filters.kategori ? '' : 'active'}" data-type="kategori" data-value="">Tüm Kategoriler</a></li>` + categories.map(kategori => `
            <li><a href="#" class="filter-link ${filters.kategori === kategori ? 'active' : ''}" data-type="kategori" data-value="${kategori}">${kategori}</a></li>
        `).join('');

        brandList.innerHTML = `<li><a href="#" class="filter-link ${filters.marka ? '' : 'active'}" data-type="marka" data-value="">Tüm Markalar</a></li>` + brands.map(marka => `
            <li><a href="#" class="filter-link ${filters.marka === marka ? 'active' : ''}" data-type="marka" data-value="${marka}">${marka}</a></li>
        `).join('');

        tagList.innerHTML = tags.map(tag => `
            <a href="#" class="tag-item ${filters.etiket === tag ? 'active' : ''}" data-type="etiket" data-value="${tag}">${tag}</a>
        `).join('');
    };

    const filterProducts = () => {
        return allProducts.filter(urun => {
            if (filters.kategori && (urun.kategori || 'Diğer') !== filters.kategori) return false;
            if (filters.marka && (urun.marka || 'Diğer') !== filters.marka) return false;
            if (filters.etiket && (!urun.ad || !urun.ad.toLowerCase().includes(filters.etiket))) return false;
            return true;
        });
    };

    const renderProducts = (urunler) => {
        if (urunler.length === 0) {
            urunlerListesi.innerHTML = '<p>Şu anda seçilen filtreye uygun ürün bulunmamaktadır.</p>';
            return;
        }

        urunlerListesi.innerHTML = '';
        urunler.forEach(urun => {
            const urunKart = document.createElement('div');
            urunKart.className = 'product-card';
            urunKart.dataset.id = urun.id;

            const stokDurumuClass = urun.stokDurumu ? 'in-stock' : 'out-of-stock';
            const stokDurumuYazi = urun.stokDurumu ? 'Stokta Var' : 'Stokta Yok';
            const kisaAciklama = (urun.aciklama || '').length > 80 ? (urun.aciklama || '').substring(0, 80) + '...' : (urun.aciklama || '');

            urunKart.innerHTML = `
                <img src="${urun.gorselUrl || 'logo.png'}" alt="${urun.ad}">
                <div class="product-content">
                    <h4>${urun.ad}</h4>
                    ${urun.kategori ? `<div class="category">${urun.kategori}</div>` : ''}
                    ${urun.marka ? `<div class="brand">${urun.marka}</div>` : ''}
                    <p>${kisaAciklama}</p>
                    <div class="product-stock ${stokDurumuClass}">${stokDurumuYazi}</div>
                    <a href="#" class="btn-details" data-id="${urun.id}">Detayları Gör</a>
                </div>
            `;
            urunlerListesi.appendChild(urunKart);
        });
    };

    const urunleriGoster = async () => {
        try {
            const response = await fetch('/api/urunler');
            if (!response.ok) {
                throw new Error('Ürünler yüklenirken bir sorun oluştu.');
            }
            const { veri: urunler } = await response.json();
            allProducts = urunler;
            renderFilters();
            renderProducts(filterProducts());
        } catch (error) {
            urunlerListesi.innerHTML = `<p style="color: red;">${error.message}</p>`;
        }
    };

    const resetFilter = (type) => {
        filters[type] = null;
        renderFilters();
        renderProducts(filterProducts());
    };

    const setFilter = (type, value) => {
        filters[type] = value || null;
        if (type !== 'etiket') {
            filters.etiket = null;
        }
        renderFilters();
        renderProducts(filterProducts());
    };

    const openProductModal = (id) => {
        const urun = allProducts.find(p => p.id == id);
        if (!urun) return;

        document.getElementById('productModalImage').src = urun.gorselUrl || 'logo.png';
        document.getElementById('productModalName').textContent = urun.ad;
        document.getElementById('productModalCategory').textContent = urun.kategori || '';
        const stockElement = document.getElementById('productModalStock');
        stockElement.textContent = urun.stokDurumu ? 'Stokta Var' : 'Stokta Yok';
        stockElement.className = `product-stock ${urun.stokDurumu ? 'in-stock' : 'out-of-stock'}`;
        document.getElementById('productModalDescription').innerHTML = urun.aciklama.replace(/\n/g, '<br>');
        productModal.style.display = 'flex';
    };

    urunlerListesi.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-details')) {
            e.preventDefault();
            const id = e.target.dataset.id;
            openProductModal(id);
        }
    });

    [categoryList, brandList, tagList].forEach(container => {
        container.addEventListener('click', (e) => {
            const target = e.target.closest('[data-type]');
            if (!target) return;
            e.preventDefault();
            const type = target.dataset.type;
            const value = target.dataset.value || '';
            setFilter(type, value);
        });
    });

    closeProductModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            productModal.style.display = 'none';
        }
    });

    urunleriGoster();
});
