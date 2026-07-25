/**
 * Cloudflare Pages Function - /api/config
 * Serves site configuration from environment variables.
 * Falls back to defaults if env vars are not set.
 * Environment variables are configured in wrangler.toml [vars]
 * or Cloudflare Dashboard → Pages → Settings → Environment Variables.
 */
export async function onRequest(context) {
  const { env } = context;

  const config = {
    siteName: env.SITE_NAME || "GreenEarth Organics",
    tagline: env.SITE_TAGLINE || "Premium organic products from Nepal.",
    copyright: env.SITE_COPYRIGHT || `© ${new Date().getFullYear()} GreenEarth Organics. All rights reserved.`,
    contact: {
      email: env.CONTACT_EMAIL || "info@greenearth.com",
      phone: env.CONTACT_PHONE || "+977-9800000000",
      city: env.ADDRESS_CITY || "Kathmandu",
      province: env.ADDRESS_PROVINCE || "Bagmati",
      country: env.ADDRESS_COUNTRY || "Nepal",
    },
    currency: {
      default: env.DEFAULT_CURRENCY || "USD",
      exchangeRateToNPR: parseFloat(env.EXCHANGE_RATE_TO_NPR) || 133.50,
    },
  };

  return new Response(JSON.stringify(config), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
