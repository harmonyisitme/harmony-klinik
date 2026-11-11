/* Rana İşitme Merkezi - Ürünler Sayfası */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const productList = document.getElementById("urunler-listesi");
    const categoryList = document.getElementById("categoryList");
    const brandList = document.getElementById("brandList");
    const tagList = document.getElementById("tagList");

    const productModal = document.getElementById("productModal");
    const closeProductModal = document.getElementById("closeProductModal");

    const modalImage = document.getElementById("productModalImage");
    const modalName = document.getElementById("productModalName");
    const modalCategory = document.getElementById("productModalCategory");
    const modalStock = document.getElementById("productModalStock");
    const modalDescription = document.getElementById("productModalDescription");

    const productCount = document.getElementById("productCount");
    const clearFiltersButton = document.getElementById("clearProductFilters");

    let allProducts = [];

    const filters = {
        category: [],
        brand: [],
        tag: []
    };

    // Ürün adından tanınabilecek özellik etiketleri
    const knownTags = [
        "Bluetooth",
        "Şarjlı",
        "Şarj Edilebilir",
        "Pilli",
        "Kulak İçi",
        "Kulak Arkası",
        "RIC",
        "BTE",
        "CIC",
        "IIC",
        "ITE",
        "ITC",
        "Mini",
        "Akıllı"
    ];

    function cleanValue(value) {
        if (value === null || value === undefined) return "";
        return String(value).trim();
    }

    function getProductTags(product) {
        const name = cleanValue(product.ad).toLocaleLowerCase("tr-TR");
        const category = cleanValue(product.kategori).toLocaleLowerCase("tr-TR");
        const description = cleanValue(product.aciklama).toLocaleLowerCase("tr-TR");

        const searchableText = `${name} ${category} ${description}`;

        return knownTags.filter(tag =>
            searchableText.includes(tag.toLocaleLowerCase("tr-TR"))
        );
    }

    function getStockText(product) {
        const stock = product.stokDurumu;

        if (stock === false || stock === 0) {
            return "Bilgi Alınız";
        }

        const value = cleanValue(stock).toLocaleLowerCase("tr-TR");

        if (
            value.includes("yok") ||
            value.includes("tükendi") ||
            value.includes("stokta değil") ||
            value === "false" ||
            value === "0"
        ) {
            return "Bilgi Alınız";
        }

        if (
            value.includes("var") ||
            value.includes("mevcut") ||
            value.includes("stokta") ||
            value === "true" ||
            value === "1"
        ) {
            return "Bilgi Alınız";
        }

        return value ? cleanValue(stock) : "Bilgi Alınız";
    }

    function isAvailable(product) {
        const stock = product.stokDurumu;

        if (stock === false || stock === 0) return false;

        const value = cleanValue(stock).toLocaleLowerCase("tr-TR");

        return !(
            value.includes("yok") ||
            value.includes("tükendi") ||
            value.includes("stokta değil") ||
            value === "false" ||
            value === "0"
        );
    }

    function createFilterOption(container, value, type) {
        const label = document.createElement("label");
        label.className = "filter-option";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = value;

        const text = document.createElement("span");
        text.textContent = value;

        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (!filters[type].includes(value)) {
                    filters[type].push(value);
                }
            } else {
                filters[type] = filters[type].filter(item => item !== value);
            }

            renderProducts();
        });

        label.appendChild(checkbox);
        label.appendChild(text);
        container.appendChild(label);
    }

    function renderFilterList(container, values, type) {
        if (!container) return;

        container.replaceChildren();

        const uniqueValues = [...new Set(
            values.map(cleanValue).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b, "tr"));

        if (uniqueValues.length === 0) {
            const empty = document.createElement("span");
            empty.className = "filter-empty";
            empty.textContent = "Bu alanda seçenek bulunamadı.";
            container.appendChild(empty);
            return;
        }

        uniqueValues.forEach(value => {
            createFilterOption(container, value, type);
        });
    }

    function renderFilters() {
        renderFilterList(
            categoryList,
            allProducts.map(product => product.kategori),
            "category"
        );

        renderFilterList(
            brandList,
            allProducts.map(product => product.marka),
            "brand"
        );

        const allTags = allProducts.flatMap(product => getProductTags(product));

        renderFilterList(tagList, allTags, "tag");
    }

    function getFilteredProducts() {
        return allProducts.filter(product => {
            const categoryMatch =
                filters.category.length === 0 ||
                filters.category.includes(cleanValue(product.kategori));

            const brandMatch =
                filters.brand.length === 0 ||
                filters.brand.includes(cleanValue(product.marka));

            const productTags = getProductTags(product);

            const tagMatch =
                filters.tag.length === 0 ||
                filters.tag.some(tag => productTags.includes(tag));

            return categoryMatch && brandMatch && tagMatch;
        });
    }

    function createProductCard(product, index) {
        const card = document.createElement("article");
        card.className = "product-card";

        const imageArea = document.createElement("div");
        imageArea.className = "product-card-image";

        const image = document.createElement("img");
        image.alt = cleanValue(product.ad) || "İşitme cihazı";
        image.loading = "lazy";

        const imageUrl = cleanValue(product.gorselUrl);

        if (imageUrl) {
            image.src = imageUrl;
            image.addEventListener("error", () => {
                imageArea.innerHTML = "";
                const placeholder = document.createElement("div");
                placeholder.style.color = "#c92335";
                placeholder.style.fontSize = "42px";
                placeholder.innerHTML = '<i class="fas fa-ear-listen"></i>';
                imageArea.appendChild(placeholder);
            }, { once: true });
        } else {
            const placeholder = document.createElement("div");
            placeholder.style.color = "#c92335";
            placeholder.style.fontSize = "42px";
            placeholder.innerHTML = '<i class="fas fa-ear-listen"></i>';
            imageArea.appendChild(placeholder);
        }

        if (imageUrl) imageArea.appendChild(image);

        const content = document.createElement("div");
        content.className = "product-card-content";

        const category = document.createElement("span");
        category.className = "product-card-category";
        category.textContent = cleanValue(product.kategori) || "İşitme Cihazı";

        const name = document.createElement("h3");
        name.textContent = cleanValue(product.ad) || "İşitme Cihazı";

        const description = document.createElement("p");
        description.className = "product-card-description";
        description.textContent =
            cleanValue(product.aciklama) || "Ürün hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.";

        const footer = document.createElement("div");
        footer.className = "product-card-footer";

        const brand = document.createElement("span");
        brand.className = "product-brand";
        brand.textContent = cleanValue(product.marka) || "Rana İşitme Merkezi";

        const stock = document.createElement("span");
        stock.className = "product-stock";

        const available = isAvailable(product);

        if (!available) {
            stock.classList.add("unavailable");
        }

        const stockIcon = document.createElement("i");
        stockIcon.className = available
            ? "fas fa-check-circle"
            : "fas fa-info-circle";

        const stockText = document.createElement("span");
        stockText.textContent = getStockText(product);

        stock.appendChild(stockIcon);
        stock.appendChild(stockText);

        footer.appendChild(brand);
        footer.appendChild(stock);

        const detailButton = document.createElement("button");
        detailButton.type = "button";
        detailButton.className = "product-detail-button";
        detailButton.innerHTML = '<i class="fas fa-eye"></i> Ürün Detaylarını İncele';

        detailButton.addEventListener("click", () => {
            openProductModal(product);
        });

        content.appendChild(category);
        content.appendChild(name);
        content.appendChild(description);
        content.appendChild(footer);
        content.appendChild(detailButton);

        card.appendChild(imageArea);
        card.appendChild(content);

        return card;
    }

    function renderProducts() {
        if (!productList) return;

        const filteredProducts = getFilteredProducts();

        productList.replaceChildren();

        if (productCount) {
            productCount.textContent =
                `${filteredProducts.length} ürün listeleniyor`;
        }

        if (filteredProducts.length === 0) {
            const message = document.createElement("div");
            message.className = "products-message";

            const icon = document.createElement("i");
            icon.className = "fas fa-search";

            const text = document.createElement("p");
            text.textContent = "Seçtiğiniz filtrelere uygun ürün bulunamadı. Filtreleri temizleyerek tekrar deneyebilirsiniz.";

            message.appendChild(icon);
            message.appendChild(text);
            productList.appendChild(message);
            return;
        }

        filteredProducts.forEach((product, index) => {
            productList.appendChild(createProductCard(product, index));
        });
    }

    function openProductModal(product) {
        if (!productModal) return;

        modalName.textContent = cleanValue(product.ad) || "Ürün Detayı";
        modalCategory.textContent = cleanValue(product.kategori) || "İşitme Cihazı";
        modalStock.textContent = getStockText(product);
        modalDescription.textContent =
            cleanValue(product.aciklama) || "Bu ürün hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.";

        const imageUrl = cleanValue(product.gorselUrl);

        if (modalImage) {
            modalImage.src = imageUrl;
            modalImage.alt = cleanValue(product.ad) || "İşitme cihazı";
            modalImage.style.display = imageUrl ? "block" : "none";
        }

        productModal.classList.add("active");
        productModal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
    }

    function closeModal() {
        if (!productModal) return;

        productModal.classList.remove("active");
        productModal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    if (closeProductModal) {
        closeProductModal.addEventListener("click", closeModal);
    }

    if (productModal) {
        productModal.addEventListener("click", event => {
            if (event.target === productModal) {
                closeModal();
            }
        });
    }

    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            closeModal();
        }
    });

    if (clearFiltersButton) {
        clearFiltersButton.addEventListener("click", () => {
            filters.category = [];
            filters.brand = [];
            filters.tag = [];

            document.querySelectorAll(
                "#categoryList input, #brandList input, #tagList input"
            ).forEach(input => {
                input.checked = false;
            });

            renderProducts();
        });
    }

    async function loadProducts() {
        if (!productList) return;

        try {
            const response = await fetch("/api/urunler");

            if (!response.ok) {
                throw new Error(`Ürün servisi yanıt vermedi: ${response.status}`);
            }

            const result = await response.json();

            if (!result || !Array.isArray(result.veri)) {
                throw new Error("Ürün verileri beklenen formatta gelmedi.");
            }

            allProducts = result.veri;

            renderFilters();
            renderProducts();

        } catch (error) {
            console.error("Ürünler yüklenirken hata oluştu:", error);

            productList.replaceChildren();

            const message = document.createElement("div");
            message.className = "products-message";

            const icon = document.createElement("i");
            icon.className = "fas fa-exclamation-circle";

            const text = document.createElement("p");
            text.textContent = "Ürünler şu anda yüklenemiyor. Lütfen sayfayı yenileyin veya bizimle iletişime geçin.";

            message.appendChild(icon);
            message.appendChild(text);
            productList.appendChild(message);

            if (productCount) {
                productCount.textContent = "Ürünler yüklenemedi";
            }
        }
    }

    loadProducts();
});
