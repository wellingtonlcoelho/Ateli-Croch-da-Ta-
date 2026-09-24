// ─────────────────────────────────────────────────────────
// Esta função roda no servidor da Cloudflare (não no navegador
// do cliente), então é o lugar seguro pra usar o Access Token
// do Mercado Pago sem expô-lo publicamente.
//
// Além de criar o pagamento, ela agora:
//  1. Confere se há estoque real de cada item (usando o D1)
//  2. Grava o pedido no banco de dados com status "pendente"
//  3. Manda o Mercado Pago avisar nosso webhook quando o
//     pagamento for confirmado (notification_url)
//
// Variáveis necessárias (ver README.md):
//  - MP_ACCESS_TOKEN  (secreta)
//  - Vínculo do banco D1 chamado "DB"
// ─────────────────────────────────────────────────────────

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function buscarDisponibilidade(db, produtoIds) {
  if (!db || produtoIds.length === 0) return {};

  const placeholders = produtoIds.map(() => '?').join(',');
  const { results } = await db.prepare(`
    SELECT pe.produto_id AS id,
           pe.estoque - COALESCE(SUM(CASE WHEN p.status = 'approved' THEN ip.quantidade ELSE 0 END), 0) AS disponivel
    FROM produtos_estoque pe
    LEFT JOIN itens_pedido ip ON ip.produto_id = pe.produto_id
    LEFT JOIN pedidos p ON p.id = ip.pedido_id
    WHERE pe.produto_id IN (${placeholders})
    GROUP BY pe.produto_id
  `).bind(...produtoIds).all();

  const mapa = {};
  results.forEach((r) => { mapa[r.id] = r.disponivel; });
  return mapa;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const accessToken = env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return jsonResponse({ erro: 'MP_ACCESS_TOKEN não configurado no servidor.' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ erro: 'Corpo inválido' }, 400);
  }

  const itensRecebidos = Array.isArray(body.itens) ? body.itens : [];
  if (itensRecebidos.length === 0) {
    return jsonResponse({ erro: 'Carrinho vazio' }, 400);
  }

  // Nunca confiamos cegamente em preço/quantidade vindos do navegador.
  const itens = itensRecebidos.map((item) => ({
    id: String(item.id),
    nome: String(item.nome).slice(0, 250),
    quantidade: Math.max(1, Math.min(99, Number(item.quantidade) || 1)),
    preco: Number(item.preco) > 0 ? Number(item.preco) : 0,
  }));

  const db = env.DB;

  // ── 1. Checagem de estoque (se o banco estiver configurado) ──
  if (db) {
    const disponibilidade = await buscarDisponibilidade(db, itens.map((i) => i.id));
    for (const item of itens) {
      const disponivel = disponibilidade[item.id];
      // Se o produto não está cadastrado na tabela de estoque,
      // tratamos como "sem controle de estoque" e deixamos passar.
      if (disponivel !== undefined && item.quantidade > disponivel) {
        return jsonResponse({
          erro: 'estoque_insuficiente',
          produto_id: item.id,
          produto_nome: item.nome,
          disponivel: Math.max(0, disponivel),
        }, 409);
      }
    }
  }

  const total = itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0);
  const origin = new URL(request.url).origin;

  // ── 2. Grava o pedido no banco como "pendente" ──
  let pedidoId = null;
  if (db) {
    try {
      const insercaoPedido = await db.prepare(
        `INSERT INTO pedidos (status, total) VALUES ('pendente', ?)`
      ).bind(total).run();
      pedidoId = insercaoPedido.meta.last_row_id;

      const insercoesItens = itens.map((item) =>
        db.prepare(
          `INSERT INTO itens_pedido (pedido_id, produto_id, produto_nome, preco, quantidade) VALUES (?, ?, ?, ?, ?)`
        ).bind(pedidoId, item.id, item.nome, item.preco, item.quantidade)
      );
      await db.batch(insercoesItens);
    } catch (err) {
      // Se o banco falhar, seguimos sem histórico em vez de travar a venda —
      // melhor vender sem registro do que não vender.
      console.error('Falha ao gravar pedido no D1:', err);
      pedidoId = null;
    }
  }

  // ── 3. Cria a preferência de pagamento no Mercado Pago ──
  const preference = {
    items: itens.map((item) => ({
      title: item.nome,
      quantity: item.quantidade,
      unit_price: item.preco,
      currency_id: 'BRL',
    })),
    back_urls: {
      success: `${origin}/sucesso.html`,
      pending: `${origin}/pendente.html`,
      failure: `${origin}/erro.html`,
    },
    auto_return: 'approved',
    statement_descriptor: 'PONTODELA',
    notification_url: `${origin}/api/webhook-mercadopago`,
    external_reference: pedidoId !== null ? String(pedidoId) : undefined,
  };

  try {
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpResponse.json();

    if (!mpResponse.ok) {
      return jsonResponse({ erro: 'Erro ao criar pagamento', detalhe: data }, 502);
    }

    // Guarda o id da preferência no pedido, pra rastrear depois.
    if (db && pedidoId !== null) {
      await db.prepare(
        `UPDATE pedidos SET mp_preference_id = ? WHERE id = ?`
      ).bind(data.id, pedidoId).run();
    }

    return jsonResponse({ init_point: data.init_point });
  } catch (err) {
    return jsonResponse({ erro: 'Falha ao contatar o Mercado Pago' }, 500);
  }
}
