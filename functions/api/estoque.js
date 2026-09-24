// ─────────────────────────────────────────────────────────
// Devolve quantas unidades ainda estão disponíveis de cada
// produto, calculado a partir do estoque cadastrado menos as
// vendas já aprovadas. Usado pelo site para mostrar "Esgotado".
//
// Se o banco D1 ainda não estiver configurado, devolve uma lista
// vazia — o site então funciona normalmente, sem controle de
// estoque, até você configurar o banco.
// ─────────────────────────────────────────────────────────

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT pe.produto_id AS id,
             pe.estoque - COALESCE(SUM(CASE WHEN p.status = 'approved' THEN ip.quantidade ELSE 0 END), 0) AS disponivel
      FROM produtos_estoque pe
      LEFT JOIN itens_pedido ip ON ip.produto_id = pe.produto_id
      LEFT JOIN pedidos p ON p.id = ip.pedido_id
      GROUP BY pe.produto_id
    `).all();

    const mapa = {};
    results.forEach((r) => { mapa[r.id] = Math.max(0, r.disponivel); });

    return new Response(JSON.stringify(mapa), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Falha ao buscar estoque:', err);
    return new Response(JSON.stringify({}), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  }
}
