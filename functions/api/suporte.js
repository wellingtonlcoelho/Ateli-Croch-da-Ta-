// API de suporte: listar tickets e enviar mensagens
export async function onRequestGet({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const db = env.DB;

    const session = await db.prepare(
      "SELECT u.id, u.role FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token = ?"
    ).bind(token).first();
    if (!session) return new Response(JSON.stringify({ erro: 'Sessão inválida' }), { status: 401 });

    let tickets;
    if (session.role === 'admin') {
      tickets = await db.prepare(`
        SELECT t.*, u.nome as cliente_nome, u.email as cliente_email
        FROM suporte_tickets t JOIN usuarios u ON t.usuario_id = u.id
        ORDER BY t.criado_em DESC
      `).all();
    } else {
      tickets = await db.prepare(
        "SELECT * FROM suporte_tickets WHERE usuario_id = ? ORDER BY criado_em DESC"
      ).bind(session.id).all();
    }

    for (let t of tickets.results) {
      const msgs = await db.prepare(`
        SELECT m.*, u.nome as remetente_nome, u.role as remetente_role
        FROM mensagens_suporte m JOIN usuarios u ON m.remetente_id = u.id
        WHERE m.ticket_id = ? ORDER BY m.criado_em ASC
      `).bind(t.id).all();
      t.mensagens = msgs.results;
    }

    return new Response(JSON.stringify(tickets.results), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const db = env.DB;

    const session = await db.prepare(
      "SELECT u.id, u.role FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token = ?"
    ).bind(token).first();
    if (!session) return new Response(JSON.stringify({ erro: 'Sessão inválida' }), { status: 401 });

    const { acao, assunto, mensagem, ticket_id } = await request.json();

    if (acao === 'novo_ticket') {
      const result = await db.prepare(
        "INSERT INTO suporte_tickets (usuario_id, assunto) VALUES (?, ?)"
      ).bind(session.id, assunto).run();

      const newId = result.meta.last_row_id;
      await db.prepare(
        "INSERT INTO mensagens_suporte (ticket_id, remetente_id, mensagem) VALUES (?, ?, ?)"
      ).bind(newId, session.id, mensagem).run();

      return new Response(JSON.stringify({ sucesso: true, ticket_id: newId }), { status: 201 });
    }

    if (acao === 'responder') {
      await db.prepare(
        "INSERT INTO mensagens_suporte (ticket_id, remetente_id, mensagem) VALUES (?, ?, ?)"
      ).bind(ticket_id, session.id, mensagem).run();
      return new Response(JSON.stringify({ sucesso: true }), { status: 200 });
    }

    if (acao === 'fechar' && session.role === 'admin') {
      await db.prepare("UPDATE suporte_tickets SET status = 'fechado' WHERE id = ?").bind(ticket_id).run();
      return new Response(JSON.stringify({ sucesso: true }), { status: 200 });
    }

    return new Response(JSON.stringify({ erro: 'Ação inválida' }), { status: 400 });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
