export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return j({ error: 'Not logged in' }, 401);

  const row = await env.USERS_DB.prepare(
    "SELECT u.id, u.username, u.display_name, u.is_admin FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > datetime('now')"
  ).bind(token).first();

  if (!row) {
    await env.USERS_DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return j({ error: 'Session expired' }, 401);
  }

  return j({ id: row.id, username: row.username, display_name: row.display_name || row.username, is_admin: !!row.is_admin });
}

function j(data, s = 200) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }); }
function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }; }