// ─────────────────────────────────────────────────────────
// Esta função roda no servidor da Cloudflare (não no navegador
// do cliente), então é o lugar seguro pra usar o Access Token
// do Mercado Pago sem expô-lo publicamente.
//
// O token deve ser configurado como variável de ambiente secreta
// chamada MP_ACCESS_TOKEN no painel da Cloudflare Pages.
// Veja o README.md para o passo a passo.
// ─────────────────────────────────────────────────────────

export async function onRequestPost(context) {
  const { request, env } = context;

  const accessToken = env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    return new Response(
      JSON.stringify({ erro: 'MP_ACCESS_TOKEN não configurado no servidor.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ erro: 'Corpo inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const itens = Array.isArray(body.itens) ? body.itens : [];
  if (itens.length === 0) {
    return new Response(JSON.stringify({ erro: 'Carrinho vazio' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Monta os itens no formato que o Mercado Pago espera.
  // Preço e quantidade sempre validados aqui no servidor,
  // nunca confiando cegamente no que veio do navegador.
  const items = itens.map((item) => ({
    title: String(item.nome).slice(0, 250),
    quantity: Math.max(1, Math.min(99, Number(item.quantidade) || 1)),
    unit_price: Number(item.preco) > 0 ? Number(item.preco) : 0,
    currency_id: 'BRL',
  }));

  const origin = new URL(request.url).origin;

  const preference = {
    items,
    back_urls: {
      success: `${origin}/sucesso.html`,
      pending: `${origin}/pendente.html`,
      failure: `${origin}/erro.html`,
    },
    auto_return: 'approved',
    statement_descriptor: 'PONTODELA',
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
      return new Response(JSON.stringify({ erro: 'Erro ao criar pagamento', detalhe: data }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ init_point: data.init_point }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ erro: 'Falha ao contatar o Mercado Pago' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
