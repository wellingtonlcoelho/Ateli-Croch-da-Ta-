import { hashPassword, generateToken } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const { email, senha } = await request.json();
    const hash = await hashPassword(senha);
    const db = env.DB;

    const user = await db.prepare("SELECT id, nome, role FROM usuarios WHERE email = ? AND senha_hash = ?")
      .bind(email, hash).first();

    if (!user) {
      return new Response(JSON.stringify({ erro: 'E-mail ou senha inválidos' }), { status: 401 });
    }

    const token = generateToken();
    const expira = new Date();
    expira.setDate(expira.getDate() + 7); // Token dura 7 dias

    await db.prepare("INSERT INTO sessoes (token, usuario_id, expira_em) VALUES (?, ?, ?)")
      .bind(token, user.id, expira.toISOString()).run();

    return new Response(JSON.stringify({ 
      sucesso: true, 
      token, 
      usuario: { id: user.id, nome: user.nome, role: user.role } 
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
