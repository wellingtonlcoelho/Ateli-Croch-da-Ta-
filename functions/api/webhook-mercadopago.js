// ─────────────────────────────────────────────────────────
// Este endpoint é chamado automaticamente pelo Mercado Pago
// (não pela sua cliente) sempre que o status de um pagamento
// muda — é assim que ficamos sabendo de uma venda mesmo que
// a cliente feche o navegador antes de voltar pro site.
//
// URL configurada automaticamente pela função create-preference.js
// (campo notification_url). Não precisa cadastrar nada manualmente
// no painel do Mercado Pago.
//
// Variáveis usadas (ver README.md):
//  - MP_ACCESS_TOKEN   (já configurada)
//  - Vínculo do banco D1 chamado "DB"
//  - RESEND_API_KEY, SELLER_EMAIL, RESEND_FROM  (opcionais — sem
//    elas, o pedido ainda é atualizado, só não manda e-mail)
// ─────────────────────────────────────────────────────────

async function enviarEmailDeVenda(env, pedidoId, db) {
  if (!env.RESEND_API_KEY || !env.SELLER_EMAIL) return;

  const { results } = await db.prepare(
    `SELECT produto_nome, preco, quantidade FROM itens_pedido WHERE pedido_id = ?`
  ).bind(pedidoId).all();

  if (!results || results.length === 0) return;

  const linhas = results
    .map((i) => `${i.quantidade}x ${i.produto_nome} — R$ ${(i.preco * i.quantidade).toFixed(2)}`)
    .join('\n');
  const total = results.reduce((soma, i) => soma + i.preco * i.quantidade, 0);

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || 'Ponto de Lã <onboarding@resend.dev>',
        to: env.SELLER_EMAIL,
        subject: `Nova venda confirmada — Pedido #${pedidoId}`,
        text: `Você vendeu:\n\n${linhas}\n\nTotal: R$ ${total.toFixed(2)}\n\nPedido #${pedidoId}`,
      }),
    });
  } catch (err) {
    // Um e-mail que falha não deve impedir o resto do processamento.
    console.error('Falha ao enviar e-mail de notificação:', err);
  }
}

async function processarPagamento(paymentId, env) {
  const db = env.DB;

  const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
  });
  if (!resp.ok) return;

  const payment = await resp.json();
  const pedidoId = payment.external_reference;
  const status = payment.status; // approved | rejected | pending | in_process | ...

  if (!pedidoId || !db) return;

  await db.prepare(
    `UPDATE pedidos SET status = ?, mp_payment_id = ?, atualizado_em = datetime('now') WHERE id = ?`
  ).bind(status, String(payment.id), pedidoId).run();

  if (status === 'approved') {
    await enviarEmailDeVenda(env, pedidoId, db);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let body = {};
  try {
    body = await request.json();
  } catch {
    // Alguns formatos antigos do Mercado Pago mandam via query string.
  }

  const url = new URL(request.url);
  const paymentId =
    body?.data?.id ||
    url.searchParams.get('data.id') ||
    (url.searchParams.get('topic') === 'payment' ? url.searchParams.get('id') : null);

  // O Mercado Pago espera uma resposta 200 rápida — processamos e
  // respondemos "ok" independentemente do resultado, pra evitar que
  // ele fique tentando reenviar a notificação repetidamente.
  if (paymentId) {
    try {
      await processarPagamento(paymentId, env);
    } catch (err) {
      console.error('Erro ao processar webhook:', err);
    }
  }

  return new Response('ok', { status: 200 });
}

// O Mercado Pago também pode chamar via GET em integrações antigas (IPN).
export async function onRequestGet(context) {
  return onRequestPost(context);
}
