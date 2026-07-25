/**
 * config.js - Site Configuration Loader
 * Fetches config from Cloudflare Pages Function /api/config,
 * falls back to local data/config.json.
 */

const SiteConfig = {
    data: null,

    defaults: {
        siteName: "GreenEarth Organics",
        tagline: "Your trusted source for premium organic products.",
        copyright: `© ${new Date().getFullYear()} GreenEarth Organics. All rights reserved. Made with ❤️ for the planet`,
        contact: {
            email: "info@greenearth.com",
            phone: "+977-9800000000",
            city: "Kathmandu",
            province: "Bagmati",
            country: "Nepal",
        },
        currency: {
            default: "USD",
            exchangeRateToNPR: 133.50,
        },
    },

    async load() {
        try {
            // Try Cloudflare Pages Function first
            const res = await fetch('/api/config');
            if (res.ok) {
                this.data = await res.json();
                return this.data;
            }
        } catch (e) {
            // Function not available (local dev or static-only deploy)
        }

        try {
            // Fallback to local JSON
            const res = await fetch('/data/config.json');
            if (res.ok) {
                this.data = await res.json();
                return this.data;
            }
        } catch (e) {
            // JSON not available
        }

        // Ultimate fallback to hardcoded defaults
        this.data = this.defaults;
        return this.data;
    },

    get(key) {
        if (!this.data) return this.defaults[key] || null;
        return this.data[key] || this.defaults[key] || null;
    },

    get contact() {
        return this.data?.contact || this.defaults.contact;
    },

    get currency() {
        return this.data?.currency || this.defaults.currency;
    },

    get siteName() {
        return this.data?.siteName || this.defaults.siteName;
    },

    get tagline() {
        return this.data?.tagline || this.defaults.tagline;
    },

    get copyright() {
        return this.data?.copyright || this.defaults.copyright;
    },

    get exchangeRate() {
        return parseFloat(this.data?.currency?.exchangeRateToNPR) || this.defaults.currency.exchangeRateToNPR;
    }
};
