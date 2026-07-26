/**
 * ui.js - UI Rendering: Products, Modals, Search, Toasts
 */

const UI = {
    currentCategory: 'all',
    searchQuery: '',
    currentModalProduct: null,

    // === Product Grid ===
    renderProducts() {
        const grid = document.getElementById('productGrid');
        const noProducts = document.getElementById('noProducts');
        if (!grid) return;

        let filtered = AppData.products;

        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(p => p.category === this.currentCategory);
        }
        if (this.searchQuery) {
            filtered = AppData.searchProducts(this.searchQuery);
        }

        // Update section title
        const titles = { 'all': 'All Products' };
        for (const cat of AppData.categories) {
            titles[cat.slug] = cat.label;
        }
        document.getElementById('productTitle').textContent = titles[this.currentCategory] || 'All Products';
        document.getElementById('productSubtitle').textContent = filtered.length + ' products available';

        if (filtered.length === 0) {
            grid.innerHTML = '';
            noProducts.classList.remove('hidden');
            return;
        }
        noProducts.classList.add('hidden');

        grid.innerHTML = filtered.map(p => this.renderProductCard(p)).join('');
        lucide.createIcons();
    },

    renderProductCard(p) {
        const meta = AppData.getCategory(p.category);
        const discount = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
        const nprPrice = AppData.formatNPR(p.price);
        const stars = AppData.renderStars(p.rating);
        const imgUrl = `/images/products/${p.image}`;

        return `
        <div class="product-card group bg-white rounded-xl border border-emerald-100 overflow-hidden cursor-pointer" onclick="UI.openProductModal(${p.id})">
            <!-- Mobile Card -->
            <div class="mobile-card p-2">
                <div class="relative mb-1.5">
                    <div class="h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg overflow-hidden">
                        <img src="${imgUrl}" alt="${p.name}" class="w-full h-full object-cover" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-2xl\\'>${p.emoji}</div>'">
                    </div>
                    ${discount ? `<span class="absolute top-1 left-1 px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full">${discount}%</span>` : ''}
                    ${p.featured ? `<span class="absolute top-1 right-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded-full">★</span>` : ''}
                </div>
                <h3 class="text-[11px] font-semibold text-emerald-900 truncate mb-0.5">${p.name}</h3>
                <div class="flex items-baseline gap-1">
                    <span class="text-[11px] font-bold text-emerald-900">$${p.price.toFixed(2)}</span>
                    <span class="text-[9px] text-emerald-600/50">/ ${p.defaultWeight}</span>
                </div>
                <div class="text-[9px] text-emerald-700 font-medium">${nprPrice}</div>
                <div class="flex items-center gap-1 mt-1" onclick="event.stopPropagation()">
                    <select id="weight-${p.id}" class="flex-1 px-1 py-0.5 border border-emerald-200 rounded text-[9px] bg-white outline-none">${p.weights.map(w => `<option value="${w}" ${w === p.defaultWeight ? 'selected' : ''}>${w}</option>`).join('')}</select>
                    <button onclick="UI.quickAdd(${p.id}, event)" class="px-1.5 py-0.5 bg-emerald-600 text-white text-[9px] font-bold rounded hover:bg-emerald-700">Add</button>
                </div>
            </div>
            <!-- Desktop Card -->
            <div class="desktop-card">
                <div class="relative h-48 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden">
                    <img src="${imgUrl}" alt="${p.name}" class="product-image w-full h-full object-cover" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<div class=\\'flex items-center justify-center h-full text-5xl\\'>${p.emoji}</div>'">
                    <div class="absolute top-2 left-2">
                        <span class="px-2 py-0.5 rounded-full text-[10px] font-medium border ${meta ? meta.bgClass : ''}">${meta ? meta.emoji : ''} ${meta ? meta.label : ''}</span>
                    </div>
                    ${discount ? `<span class="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">${discount}% OFF</span>` : ''}
                    ${p.featured ? `<span class="absolute bottom-2 right-2 px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">★ Featured</span>` : ''}
                </div>
                <div class="p-4">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[10px] text-emerald-600/70">${p.defaultWeight}</span>
                    </div>
                    <h3 class="font-semibold text-emerald-900 text-base line-clamp-1 mb-1">${p.name}</h3>
                    <p class="text-sm text-emerald-900/60 line-clamp-2 leading-relaxed mb-2">${p.description}</p>
                    <div class="flex items-center gap-1 mb-2">
                        ${stars}
                        <span class="text-xs text-emerald-600/70">(${p.reviews})</span>
                    </div>
                    <div class="flex items-baseline gap-2 mb-1">
                        <span class="text-lg font-bold text-emerald-900">$${p.price.toFixed(2)}</span>
                        ${p.comparePrice ? `<span class="text-sm text-emerald-600/50 line-through">$${p.comparePrice.toFixed(2)}</span>` : ''}
                    </div>
                    <div class="text-sm text-emerald-700 font-medium mb-3">${nprPrice}</div>
                    <div class="flex items-center gap-2" onclick="event.stopPropagation()">
                        <select id="dw-${p.id}" class="flex-1 px-2 py-1.5 border border-emerald-200 rounded-lg text-xs bg-white outline-none focus:border-emerald-500">${p.weights.map(w => `<option value="${w}" ${w === p.defaultWeight ? 'selected' : ''}>${w}</option>`).join('')}</select>
                        <select id="form-${p.id}" class="px-2 py-1.5 border border-emerald-200 rounded-lg text-xs bg-white outline-none focus:border-emerald-500 disabled:bg-emerald-50 disabled:text-emerald-400 disabled:cursor-not-allowed" ${(p.unitType === 'volume' || p.unitType === 'piece') ? 'disabled' : ''}>
                            <option value="raw">Raw Form</option>
                            <option value="powder">Powder Form</option>
                        </select>
                        <button onclick="UI.quickAdd(${p.id}, event)" class="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1">
                            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    },

    quickAdd(productId, evt) {
        (evt || window.event)?.stopPropagation();
        const p = AppData.getProductById(productId);
        if (!p) return;
        const isMobile = window.innerWidth < 640;
        const selectEl = document.getElementById(isMobile ? `weight-${productId}` : `dw-${productId}`);
        const weight = selectEl ? selectEl.value : p.defaultWeight;
        const multiplier = p.priceMultiplier[weight] || 1;
        const price = +(p.price * multiplier).toFixed(2);
        const formEl = document.getElementById(`form-${productId}`);
        const form = (formEl && !formEl.disabled && formEl.value === 'powder') ? 'Powder Form' : 'Raw Form';
        const msg = Cart.add(p, weight, form, price);
        Toast.show(msg);
    },

    // === Category Filtering ===
    filterByCategory(cat) {
        this.currentCategory = cat;
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === cat);
        });
        this.renderProducts();
    },

    filterProducts() {
        const desktopVal = document.getElementById('searchInput')?.value || '';
        const mobileVal = document.getElementById('mobileSearchInput')?.value || '';
        this.searchQuery = desktopVal || mobileVal;
        this.renderProducts();
    },

    // === Product Modal ===
    openProductModal(productId) {
        const p = AppData.getProductById(productId);
        if (!p) return;
        this.currentModalProduct = p;
        const meta = AppData.getCategory(p.category);
        const discount = p.comparePrice ? Math.round((1 - p.price / p.comparePrice) * 100) : 0;
        const imgUrl = `/images/products/${p.image}`;

        // Set video
        const video = document.getElementById('modalVideo');
        video.src = meta?.video || '';
        video.play().catch(() => {});

        // Set product image as poster
        const videoArea = video.parentElement;
        videoArea.style.backgroundImage = `url(${imgUrl})`;
        videoArea.style.backgroundSize = 'cover';
        videoArea.style.backgroundPosition = 'center';

        // Populate fields
        document.getElementById('modalTitle').textContent = p.emoji + ' ' + p.name;
        document.getElementById('modalStars').innerHTML = AppData.renderStars(p.rating);
        document.getElementById('modalReviewCount').textContent = `(${p.reviews} reviews)`;
        document.getElementById('modalPrice').textContent = '$' + p.price.toFixed(2);

        const cp = document.getElementById('modalComparePrice');
        if (p.comparePrice) { cp.textContent = '$' + p.comparePrice.toFixed(2); cp.classList.remove('hidden'); }
        else { cp.classList.add('hidden'); }

        this.updateModalNPR(p.price);

        // Unit badge
        const unitIcons = { weight: 'scale', volume: 'droplets', piece: 'package' };
        document.getElementById('modalUnitBadge').innerHTML =
            `<i data-lucide="${unitIcons[p.unitType]}" class="w-3.5 h-3.5"></i> ${p.unitType.charAt(0).toUpperCase() + p.unitType.slice(1)}`;

        // Weight select
        const ws = document.getElementById('modalWeight');
        ws.innerHTML = p.weights.map(w => `<option value="${w}" ${w === p.defaultWeight ? 'selected' : ''}>${w}</option>`).join('');

        document.getElementById('modalDescription').textContent = p.description;
        const modalFormEl = document.getElementById('modalForm');
        modalFormEl.value = 'raw';
        modalFormEl.disabled = (p.unitType === 'volume' || p.unitType === 'piece');

        // Category badge
        const catBadge = document.getElementById('modalCategoryBadge');
        catBadge.className = `absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium ${meta ? meta.bgClass : ''}`;
        catBadge.textContent = (meta ? meta.emoji : '') + ' ' + (meta ? meta.label : '');

        // Badges
        const db = document.getElementById('modalDiscountBadge');
        if (discount) { db.textContent = discount + '% OFF'; db.classList.remove('hidden'); }
        else { db.classList.add('hidden'); }

        const fb = document.getElementById('modalFeaturedBadge');
        p.featured ? fb.classList.remove('hidden') : fb.classList.add('hidden');

        // Reset checkout steps
        document.getElementById('checkoutStep1')?.classList.remove('hidden');
        document.getElementById('checkoutStep2')?.classList.add('hidden');
        document.getElementById('checkoutStep3')?.classList.add('hidden');
        document.getElementById('checkoutSuccess')?.classList.add('hidden');

        document.getElementById('productModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        lucide.createIcons();
    },

    closeProductModal() {
        document.getElementById('productModal').classList.add('hidden');
        const video = document.getElementById('modalVideo');
        video.pause();
        video.src = '';
        video.parentElement.style.backgroundImage = '';
        document.body.style.overflow = '';
        this.currentModalProduct = null;
    },

    updateModalPrice() {
        if (!this.currentModalProduct) return;
        const weight = document.getElementById('modalWeight').value;
        const multiplier = this.currentModalProduct.priceMultiplier[weight] || 1;
        const price = +(this.currentModalProduct.price * multiplier).toFixed(2);
        document.getElementById('modalPrice').textContent = '$' + price.toFixed(2);
        if (this.currentModalProduct.comparePrice) {
            const cmp = +(this.currentModalProduct.comparePrice * multiplier).toFixed(2);
            document.getElementById('modalComparePrice').textContent = '$' + cmp.toFixed(2);
        }
        this.updateModalNPR(price);
    },

    updateModalNPR(usdPrice) {
        document.getElementById('modalNPRPrice').textContent = AppData.formatNPR(usdPrice);
        document.getElementById('modalRateNote').textContent =
            `Based on exchange rate: 1 USD = ${SiteConfig.exchangeRate} NPR`;
    },

    addFromModal() {
        if (!this.currentModalProduct) return;
        const p = this.currentModalProduct;
        const weight = document.getElementById('modalWeight').value;
        const form = document.getElementById('modalForm').value === 'powder' ? 'Powder Form' : 'Raw Form';
        const multiplier = p.priceMultiplier[weight] || 1;
        const price = +(p.price * multiplier).toFixed(2);
        const msg = Cart.add(p, weight, form, price);
        Toast.show(msg);
        this.closeProductModal();
    },

    toggleVideo() {
        const v = document.getElementById('modalVideo');
        const icon = document.getElementById('videoPlayIcon');
        if (v.paused) {
            v.play();
            icon.setAttribute('data-lucide', 'pause');
        } else {
            v.pause();
            icon.setAttribute('data-lucide', 'play');
        }
        lucide.createIcons();
    },

    replayVideo() {
        const v = document.getElementById('modalVideo');
        v.currentTime = 0;
        v.play();
        document.getElementById('videoPlayIcon').setAttribute('data-lucide', 'pause');
        lucide.createIcons();
    },

    // === Cart Drawer ===
    openCart() {
        document.getElementById('cartDrawer').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        Cart.renderItems();
        Checkout.switchTab('cart');
        lucide.createIcons();
    },

    closeCart() {
        document.getElementById('cartDrawer').classList.add('hidden');
        document.body.style.overflow = '';
    },

    // === Mobile Toggles ===
    toggleMobileSearch() {
        document.getElementById('mobileSearch').classList.toggle('hidden');
    },

    toggleMobileMenu() {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    },

    // === Live Time ===
    updateLiveTime() {
        const el = document.getElementById('liveTime');
        if (!el) return;
        const now = new Date();
        el.textContent = now.toLocaleString('en-US', {
            weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: true, timeZone: 'Asia/Kathmandu', timeZoneName: 'short'
        });
    },

    // === Exchange Rate Display ===
    updateExchangeDisplay() {
        const el = document.getElementById('exchangeRate');
        if (el) el.textContent = AppData.formatNPR(1).replace('Rs. ', '');
    }
};

// === Toast Notifications ===
const Toast = {
    show(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast-enter flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}`;
        toast.innerHTML = `${type === 'error' ? '✕' : '✓'} ${message}`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};
