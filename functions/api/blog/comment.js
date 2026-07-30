/**
 * /api/blog/comment
 * GET  ?slug=xxx          → List comments for a post
 * POST { slug, name, text } → Create a new comment
 * 
 * Rate limit: 1 comment per IP per minute
 */

export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);

  // --- CORS preflight ---
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders() });
  }

  // --- GET: List comments ---
  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return json({ error: 'slug is required' }, 400);
    }

    const { results } = await db
      .prepare(
        'SELECT id, name, text, created_at as date, likes FROM comments WHERE post_slug = ? ORDER BY created_at DESC'
      )
      .bind(slug)
      .all();

    // Also get the static comments from blog.json (merged on frontend)
    return json({ comments: results });
  }

  // --- POST: Create comment ---
  if (request.method === 'POST') {
    try {
      const body = await request.json();
      const { slug, name, text } = body;

      if (!slug || !name || !text) {
        return json({ error: 'slug, name, and text are required' }, 400);
      }

      if (name.length > 100 || text.length > 2000) {
        return json({ error: 'Name max 100 chars, comment max 2000 chars' }, 400);
      }

      // Simple profanity / spam filter
      const banned = ['http://', 'https://', '<script', 'buy now', 'click here', 'free money', 'casino', 'viagra', 'lottery'];
      const lower = text.toLowerCase();
      for (const word of banned) {
        if (lower.includes(word)) {
          return json({ error: 'Comment contains disallowed content.' }, 400);
        }
      }

      // Rate limit: 1 comment per IP per minute
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const ipHash = await hashStr(ip + 'comment-salt');

      const recent = await db
        .prepare('SELECT id FROM comments WHERE ip_hash = ? AND created_at > datetime(\'now\', \'-1 minute\')')
        .bind(ipHash)
        .first();

      if (recent) {
        return json({ error: 'Please wait a minute before posting another comment.' }, 429);
      }

      const result = await db
        .prepare('INSERT INTO comments (post_slug, name, text, ip_hash) VALUES (?, ?, ?, ?)')
        .bind(slug, sanitize(name), sanitize(text), ipHash)
        .run();

      return json({ success: true, id: result.meta.last_row_id });
    } catch (e) {
      return json({ error: 'Invalid request body' }, 400);
    }
  }

  return json({ error: 'Method not allowed' }, 405);
}

// --- Helpers ---

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function sanitize(str) {
  return str.replace(/[<>]/g, '').trim();
}

async function hashStr(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}
