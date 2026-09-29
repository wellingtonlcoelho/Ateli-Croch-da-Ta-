export async function onRequestGet({ request, env }) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ erro: 'Não autorizado' }), { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const db = env.DB;
    
    const query = `
      SELECT u.id, u.nome, u.email, u.role, s.expira_em 
      FROM sessoes s 
      JOIN usuarios u ON s.usuario_id = u.id 
      WHERE s.token = ?
    `;
    const session = await db.prepare(query).bind(token).first();
    
    if (!session || new Date(session.expira_em) < new Date()) {
      return new Response(JSON.stringify({ erro: 'Sessão expirada ou inválida' }), { status: 401 });
    }
    
    return new Response(JSON.stringify({ 
      id: session.id, nome: session.nome, email: session.email, role: session.role 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
