/**
 * MOBILE VIEW FIX FOR GAUMATOSEWA
 * Ensures both weight selector AND add-to-cart form are visible on mobile
 * 
 * Add this script BEFORE closing </body> tag in index.html
 */

(function() {
    'use strict';
    
    // Wait for DOM to fully load
    function initMobileFix() {
        console.log('🔧 Applying mobile view fixes...');
        
        // Fix all product cards for mobile
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach((card, index) => {
            const mobileCard = card.querySelector('.mobile-card');
            
            if (!mobileCard) return;
            
            // Ensure mobile card is visible
            mobileCard.style.display = 'flex';
            mobileCard.style.flexDirection = 'column';
            
            // Find weight selector
            const weightSelector = mobileCard.querySelector('select[id^="weight-"]');
            
            if (weightSelector) {
                console.log(`✅ Product ${index + 1}: Weight selector found`);
                
                // Make sure weight selector is visible and full width
                weightSelector.style.display = 'block';
                weightSelector.style.width = '100%';
                weightSelector.style.visibility = 'visible';
                weightSelector.style.opacity = '1';
                
                // Find parent container of weight selector
                const weightContainer = weightSelector.parentElement;
                if (weightContainer) {
                    weightContainer.style.display = 'flex';
                    weightContainer.style.flexDirection = 'column';
                    weightContainer.style.gap = '0.25rem';
                    weightContainer.style.width = '100%';
                }
            }
            
            // Find and show any form/button after weight selector
            const allElements = mobileCard.querySelectorAll('*');
            
            allElements.forEach(el => {
                const tagName = el.tagName.toLowerCase();
                
                // Show buttons, forms, inputs on mobile
                if (tagName === 'button' || tagName === 'form' || tagName === 'input') {
                    // Check if it's an add-to-cart related element
                    const onclick = el.getAttribute('onclick') || '';
                    const className = el.className || '';
                    
                    if (onclick.includes('cart') || 
                        onclick.includes('add') || 
                        className.includes('add') || 
                        className.includes('cart') ||
                        tagName === 'form') {
                        
                        console.log(`✅ Product ${index + 1}: Showing ${tagName}.${className}`);
                        
                        el.style.display = '';
                        el.style.visibility = 'visible';
                        el.style.opacity = '1';
                        el.style.width = '100%';
                        
                        if (tagName === 'button') {
                            el.style.marginTop = '0.25rem';
                            el.style.padding = '0.5rem';
                            el.style.justifyContent = 'center';
                        }
                    }
                }
            });
            
            // Look specifically for elements that might be hidden
            const hiddenElements = mobileCard.querySelectorAll('[style*="display: none"], [style*="display:none"], .hidden');
            
            hiddenElements.forEach(el => {
                const isFormRelated = 
                    el.tagName === 'BUTTON' || 
                    el.tagName === 'FORM' || 
                    el.tagName === 'INPUT' ||
                    el.getAttribute('onclick')?.includes('cart');
                
                if (isFormRelated) {
                    console.log(`🔓 Product ${index + 1}: Unhiding form element`);
                    el.style.display = '';
                    el.classList.remove('hidden');
                }
            });
        });
        
        console.log('✅ Mobile view fixes applied!');
    }
    
    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFix);
    } else {
        initMobileFix();
    }
    
    // Also run after a short delay to catch dynamic content
    setTimeout(initMobileFix, 1000);
    
    // Run again when products are filtered/loaded
    window.addEventListener('productsLoaded', initMobileFix);
    
})();
