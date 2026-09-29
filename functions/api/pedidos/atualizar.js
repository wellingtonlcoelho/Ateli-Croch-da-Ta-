export async function onRequestPost({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    const token = authHeader.split(' ')[1];
    const db = env.DB;
    
    const session = await db.prepare("SELECT u.role FROM sessoes s JOIN usuarios u ON s.usuario_id = u.id WHERE s.token = ?").bind(token).first();
    if (!session || session.role !== 'admin') return new Response(JSON.stringify({ erro: 'Proibido' }), { status: 403 });
    
    const { id, status_confeccao, prazo_confeccao_dias, codigo_rastreio } = await request.json();
    
    await db.prepare(`
      UPDATE pedidos SET 
        status_confeccao = ?, 
        prazo_confeccao_dias = ?, 
        codigo_rastreio = ?,
        atualizado_em = datetime('now')
      WHERE id = ?
    `).bind(status_confeccao, prazo_confeccao_dias || null, codigo_rastreio || null, id).run();
    
    return new Response(JSON.stringify({ sucesso: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
