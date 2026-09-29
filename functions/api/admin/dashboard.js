// API de estatísticas do dashboard para o admin
export async function onRequestGet({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const db = env.DB;

    const session = await db.prepare(
      "SELECT u.role FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token = ?"
    ).bind(token).first();
    if (!session || session.role !== 'admin') {
      return new Response(JSON.stringify({ erro: 'Proibido' }), { status: 403 });
    }

    const totalPedidos = await db.prepare("SELECT COUNT(*) as total FROM pedidos").first();
    const pedidosAprovados = await db.prepare("SELECT COUNT(*) as total FROM pedidos WHERE status = 'approved'").first();
    const receitaTotal = await db.prepare("SELECT COALESCE(SUM(total), 0) as receita FROM pedidos WHERE status = 'approved'").first();
    const totalClientes = await db.prepare("SELECT COUNT(*) as total FROM usuarios WHERE role = 'cliente'").first();
    const pedidosEmConfeccao = await db.prepare("SELECT COUNT(*) as total FROM pedidos WHERE status_confeccao = 'em_producao'").first();
    const ticketsAbertos = await db.prepare("SELECT COUNT(*) as total FROM suporte_tickets WHERE status = 'aberto'").first();

    const ultimosPedidos = await db.prepare(`
      SELECT p.id, p.total, p.status, p.status_confeccao, p.criado_em, u.nome as cliente_nome
      FROM pedidos p LEFT JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.criado_em DESC LIMIT 10
    `).all();

    return new Response(JSON.stringify({
      total_pedidos: totalPedidos.total,
      pedidos_aprovados: pedidosAprovados.total,
      receita_total: receitaTotal.receita,
      total_clientes: totalClientes.total,
      pedidos_em_confeccao: pedidosEmConfeccao.total,
      tickets_abertos: ticketsAbertos.total,
      ultimos_pedidos: ultimosPedidos.results
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
