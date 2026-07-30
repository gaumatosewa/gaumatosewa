export async function onRequest(context) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders() });
  if (request.method !== 'POST') return j({ error: 'Method not allowed' }, 405);

  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (token) {
    await env.USERS_DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return j({ success: true });
}

function j(data, s = 200) { return new Response(JSON.stringify(data), { status: s, headers: { 'Content-Type': 'application/json', ...corsHeaders() } }); }
function corsHeaders() { return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type,Authorization' }; }