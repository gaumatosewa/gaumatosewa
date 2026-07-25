# Deploying to Cloudflare Pages

## Option 1: Connect GitHub Repository (Recommended)

1. Push this repo to GitHub
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Select your repository
4. Configure build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`
5. Click **Save and Deploy**

## Option 2: Direct Upload

1. Go to Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Upload assets**
2. Upload the entire project folder (exclude `.git`, `node_modules`)
3. Your site will be live immediately

## Setting Environment Variables

After deploying, configure your site settings:

1. Go to **Pages → Your Project → Settings → Environment variables and secrets**
2. Add variables:
   | Variable | Description | Example |
   |----------|-------------|---------|
   | `SITE_NAME` | Your brand name | `GreenEarth Organics` |
   | `SITE_TAGLINE` | Site description | `Premium organic products...` |
   | `CONTACT_EMAIL` | Contact email | `info@greenearth.com` |
   | `CONTACT_PHONE` | Phone number | `+977-9800000000` |
   | `ADDRESS_CITY` | City | `Kathmandu` |
   | `ADDRESS_PROVINCE` | Province/State | `Bagmati` |
   | `ADDRESS_COUNTRY` | Country | `Nepal` |
   | `DEFAULT_CURRENCY` | Default currency code | `USD` |
   | `EXCHANGE_RATE_TO_NPR` | USD to NPR rate | `133.50` |
3. Click **Encrypt** for each (or leave as plain text for non-sensitive values)
4. Click **Save**
5. **Redeploy** for changes to take effect

## Using Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy . --project-name=gaumatosewa

# Deploy to production with specific env vars
wrangler pages deploy . --project-name=gaumatosewa --env=production
```

## Custom Domain

1. Go to **Pages → Your Project → Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain (e.g., `shop.yourdomain.com`)
4. Update your DNS records as instructed by Cloudflare
5. SSL is automatic

## What Gets Cached

| File Type | Cache Duration |
|-----------|----------------|
| CSS, JS | 1 day - 1 year |
| Images, SVGs | 1 year (immutable) |
| HTML | No cache (revalidate) |
| Data JSON | 1 hour |

Configured in `_headers` file.

## Troubleshooting

- **Blank page:** Check browser console for errors. Ensure all files are uploaded.
- **Config not loading:** The `/api/config` function only works on Cloudflare. Locally, it falls back to `data/config.json`.
- **Images not showing:** Verify paths in `data/products.json` match files in `images/products/`.
