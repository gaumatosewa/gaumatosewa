export async function onRequest(context) {
  const { request, env } = context;
  const USERS = env.USERS_DB;

  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
  if (request.method !== 'POST') return j({ error: 'Method not allowed' }, 405);

  try {
    const { username, password } = await request.json();
    if (!username || !password) return j({ error: 'Username and password required' }, 400);

    const user = await USERS.prepare(
      "SELECT id, username, email, password_hash, salt, display_name, is_admin FROM users WHERE username = ? OR email = ?"
    ).bind(username, username.toLowerCase()).first();

    if (!user) return j({ error: 'Invalid credentials' }, 401);

    const hash = await hashPw(password, user.salt);
    if (hash !== user.password_hash) return j({ error: 'Invalid credentials' }, 401);

    // Delete old sessions for this user
    await USERS.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();

    const token = crypto.randomUUID();
    await USERS.prepare('INSERT INTO sessions (user_id, token) VALUES (?, ?)').bind(user.id, token).run();

    return j({
      success: true,
      token,
      user: { id: user.id, username: user.username, display_name: user.display_name || user.username, is_admin: !!user.is_admin }
    });
  } catch (e) {
    return j({ error: 'Invalid request' }, 400);
  }
}

async function hashPw(pw, salt) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function j(data, s = 200) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }); }
function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }; }