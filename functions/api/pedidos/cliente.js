export async function onRequestGet({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const db = env.DB;
    
    const session = await db.prepare("SELECT usuario_id FROM sessoes WHERE token = ?").bind(token).first();
    if (!session) return new Response(JSON.stringify({ erro: 'Sessão inválida' }), { status: 401 });
    
    const pedidos = await db.prepare("SELECT * FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC").bind(session.usuario_id).all();
    
    for (let p of pedidos.results) {
      const itens = await db.prepare("SELECT * FROM itens_pedido WHERE pedido_id = ?").bind(p.id).all();
      p.itens = itens.results;
    }
    
    return new Response(JSON.stringify(pedidos.results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
