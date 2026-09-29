export async function onRequestGet({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const db = env.DB;
    
    const session = await db.prepare("SELECT u.role FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token = ?").bind(token).first();
    if (!session || session.role !== 'admin') return new Response(JSON.stringify({ erro: 'Proibido' }), { status: 403 });
    
    const pedidos = await db.prepare(`
      SELECT p.*, u.nome as cliente_nome, u.email as cliente_email 
      FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id 
      ORDER BY p.criado_em DESC
    `).all();
    
    for (let p of pedidos.results) {
      const itens = await db.prepare("SELECT * FROM itens_pedido WHERE pedido_id = ?").bind(p.id).all();
      p.itens = itens.results;
    }
    
    return new Response(JSON.stringify(pedidos.results), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
