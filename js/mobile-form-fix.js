/**
 * Mobile Form Dropdown Fix
 * Adds missing form/type dropdown (Raw Form, Powder Form, Tablets) to mobile product cards
 * 
 * Issue: Mobile cards only show weight dropdown, but desktop shows both weight AND form dropdown
 * This script clones/creates the form dropdown for mobile view
 */

(function() {
    'use strict';
    
    // Wait for DOM to be ready
    function initMobileFormFix() {
        console.log('🔧 Mobile Form Dropdown Fix: Initializing...');
        
        // Check if we're on mobile or if mobile cards exist
        const mobileCards = document.querySelectorAll('.mobile-card');
        
        if (mobileCards.length === 0) {
            console.log('🔧 No mobile cards found - fix not needed');
            return;
        }
        
        console.log(`🔧 Found ${mobileCards.length} mobile cards - adding form dropdowns`);
        
        // Process each mobile card
        mobileCards.forEach((mobileCard, index) => {
            const productCard = mobileCard.closest('.product-card');
            if (!productCard) return;
            
            // Get product ID from onclick attribute or data attribute
            const productId = extractProductId(productCard);
            if (!productId) return;
            
            // Check if form dropdown already exists in this mobile card
            const existingFormDropdown = mobileCard.querySelector('#form-' + productId + ', #mform-' + productId + ', .mobile-form-select');
            if (existingFormDropdown) {
                console.log(`🔧 Form dropdown already exists for product ${productId}`);
                return;
            }
            
            // Find the form dropdown from desktop card to get options
            const desktopCard = productCard.querySelector('.desktop-card');
            const desktopFormSelect = desktopCard ? desktopCard.querySelector('[id^="form-"]') : null;
            
            // Create form dropdown for mobile
            const formSelect = createMobileFormDropdown(productId, desktopFormSelect);
            
            // Find the weight select container and add form dropdown after it
            const weightSelect = mobileCard.querySelector('[id^="weight-"], [id^="mw-"]');
            if (weightSelect && weightSelect.parentElement) {
                // Check if there's an Add button in the same container
                const addButton = mobileCard.querySelector('button[onclick*="quickAdd"]');
                
                if (addButton && addButton.parentElement === weightSelect.parentElement) {
                    // The weight select and Add button are in a flex container together
                    // We need to add the form dropdown as a NEW ROW above this container
                    
                    // Create wrapper div for the form dropdown (full width)
                    const formWrapper = document.createElement('div');
                    formWrapper.className = 'w-full mt-1 mb-1';
                    
                    // Add label text
                    const label = document.createElement('span');
                    label.className = 'text-[8px] text-emerald-600/70 font-medium block mb-0.5';
                    label.textContent = 'Form:';
                    formWrapper.appendChild(label);
                    
                    formWrapper.appendChild(formSelect);
                    
                    // Insert the form wrapper BEFORE the flex container that has weight+Add
                    const flexContainer = weightSelect.parentElement;
                    flexContainer.parentNode.insertBefore(formWrapper, flexContainer);
                    
                    console.log(`✅ Added form dropdown for product ${productId} (new row above weight)`);
                } else {
                    // Just add it after the weight select's parent container
                    const formWrapper = document.createElement('div');
                    formWrapper.className = 'w-full mt-1';
                    formWrapper.appendChild(formSelect);
                    weightSelect.parentElement.insertAdjacentElement('afterend', formWrapper);
                    console.log(`✅ Added form dropdown for product ${productId} (after weight parent)`);
                }
            } else {
                // Fallback: append to mobile card
                const formWrapper = document.createElement('div');
                formWrapper.className = 'w-full mt-1';
                formWrapper.appendChild(formSelect);
                mobileCard.appendChild(formWrapper);
                console.log(`✅ Added form dropdown for product ${productId} (appended to card)`);
            }
        });
        
        console.log('🔧 Mobile Form Dropdown Fix: Complete!');
    }
    
    /**
     * Extract product ID from product card element
     */
    function extractProductId(productCard) {
        // Try onclick attribute first
        const onclick = productCard.getAttribute('onclick') || '';
        const match = onclick.match(/(\d+)/);
        if (match) return match[1];
        
        // Try data attribute
        if (productCard.dataset.productId) return productCard.dataset.productId;
        
        // Try from modal ID pattern
        const modalMatch = productCard.id ? productCard.id.match(/product-(\d+)/) : null;
        if (modalMatch) return modalMatch[1];
        
        return null;
    }
    
    /**
     * Create a mobile-friendly form dropdown select element
     */
    function createMobileFormDropdown(productId, desktopSelect) {
        const select = document.createElement('select');
        select.id = 'mform-' + productId;  // Use mform- prefix for mobile
        select.setAttribute('data-product-id', productId);
        select.setAttribute('aria-label', 'Product Form Type');
        select.className = 'mobile-form-select w-full px-2 py-1.5 border border-emerald-300 rounded-lg text-[10px] bg-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors';
        
        // Default options for organic products
        select.innerHTML = `
            <option value="">Choose Form...</option>
            <option value="raw">🌿 Raw Form</option>
            <option value="powder">✨ Powder Form</option>
            <option value="tablets">💊 Tablets</option>
            <option value="capsules">💉 Capsules</option>
            <option value="oil">🫧 Oil Extract</option>
            <option value="paste">🧴 Paste Form</option>
        `;
        
        // If we have a desktop reference, copy its options instead of using defaults
        if (desktopSelect) {
            const options = desktopSelect.querySelectorAll('option');
            if (options.length > 0) {
                select.innerHTML = '';
                options.forEach(opt => {
                    const newOpt = document.createElement('option');
                    newOpt.value = opt.value;
                    newOpt.textContent = opt.textContent;
                    if (opt.selected) newOpt.selected = true;
                    select.appendChild(newOpt);
                });
                console.log(`📋 Copied ${options.length} options from desktop for product ${productId}`);
            }
        }
        
        // Add change event handler
        select.addEventListener('change', function() {
            console.log(`📱 Product ${productId} form changed to: ${this.value}`);
            
            // Sync with desktop form dropdown if it exists
            const productCard = this.closest('.product-card');
            if (productCard) {
                const desktopForm = productCard.querySelector('.desktop-card [id^="form-"]');
                if (desktopForm) {
                    desktopForm.value = this.value;
                }
            }
            
            // Dispatch custom event for other scripts to listen
            window.dispatchEvent(new CustomEvent('mobileFormChanged', {
                detail: { productId: productId, form: this.value }
            }));
        });
        
        return select;
    }
    
    /**
     * Initialize on DOMContentLoaded, with fallback for dynamic content
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFix);
    } else {
        // DOM already loaded
        initMobileFormFix();
    }
    
    // Also re-run after delays in case products load dynamically via JS
    setTimeout(initMobileFormFix, 500);
    setTimeout(initMobileFormFix, 1000);
    setTimeout(initMobileFormFix, 2000);
    
    // Re-run when window loads (for any late-loading content)
    window.addEventListener('load', () => {
        setTimeout(initMobileFormFix, 500);
        setTimeout(initMobileFormFix, 1500);
    });
    
    // Observe DOM changes for dynamically added products (infinite scroll, filters, etc.)
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver((mutations) => {
            let shouldReinit = false;
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && (
                        node.classList?.contains('product-card') ||
                        node.classList?.contains('mobile-card') ||
                        node.querySelector?.('.mobile-card')
                    )) {
                        shouldReinit = true;
                    }
                });
            });
            if (shouldReinit) {
                initMobileFormFix();
            }
        });
        
        // Start observing once DOM is ready
        const startObserving = () => {
            const productGrid = document.getElementById('productGrid');
            if (productGrid) {
                observer.observe(productGrid, { childList: true, subtree: true });
                console.log('🔧 MutationObserver started for product grid');
            }
        };
        
        if (document.readyState !== 'loading') {
            startObserving();
        } else {
            document.addEventListener('DOMContentLoaded', startObserving);
        }
    }
    
    // Expose function globally for manual triggering
    window.MobileFormFix = {
        init: initMobileFormFix,
        reinit: function() { 
            console.log('🔧 Manual reinit triggered');
            setTimeout(initMobileFormFix, 100); 
        }
    };
    
})();
