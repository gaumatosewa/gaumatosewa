/**
 * Cloudflare Pages Function - /api/config
 * Serves site configuration from environment variables.
 * Falls back to defaults if env vars are not set.
 * Environment variables are configured in wrangler.toml [vars]
 * or Cloudflare Dashboard → Pages → Settings → Environment Variables.
 *
 * The USD -> NPR exchange rate is fetched live from open.er-api.com
 * (free, no API key, updates daily) and cached at the edge for 1 hour.
 * If the live fetch fails for any reason, it falls back to
 * EXCHANGE_RATE_TO_NPR / the hardcoded default so the site never breaks.
 */

async function getLiveExchangeRate(fallbackRate) {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      // Cache the upstream response at Cloudflare's edge for 1 hour
      cf: { cacheTtl: 3600, cacheEverything: true },
    });
    if (!res.ok) return fallbackRate;

    const data = await res.json();
    const rate = data?.rates?.NPR;
    if (typeof rate === 'number' && rate > 0) {
      return rate;
    }
    return fallbackRate;
  } catch (e) {
    return fallbackRate;
  }
}

export async function onRequest(context) {
  const { env } = context;

  const fallbackRate = parseFloat(env.EXCHANGE_RATE_TO_NPR) || 133.50;
  const liveRate = await getLiveExchangeRate(fallbackRate);

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
      exchangeRateToNPR: liveRate,
    },
  };

  return new Response(JSON.stringify(config), {
    headers: {
      "Content-Type": "application/json",
      // Short edge cache so the displayed rate stays fresh throughout the day
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
