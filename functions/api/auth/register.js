import { hashPassword } from '../_utils.js';

export async function onRequestPost({ request, env }) {
  try {
    const { nome, email, senha } = await request.json();
    if (!nome || !email || !senha) {
      return new Response(JSON.stringify({ erro: 'Dados incompletos' }), { status: 400 });
    }

    const hash = await hashPassword(senha);
    const db = env.DB;

    const existente = await db.prepare("SELECT id FROM usuarios WHERE email = ?").bind(email).first();
    if (existente) {
      return new Response(JSON.stringify({ erro: 'E-mail já cadastrado' }), { status: 409 });
    }

    // O primeiro usuário cadastrado pode ser forçado como admin via SQL no D1,
    // ou podemos criar uma regra: se email == "admin@...", role = admin. 
    // Por padrão todos são "cliente".
    await db.prepare("INSERT INTO usuarios (nome, email, senha_hash, role) VALUES (?, ?, ?, 'cliente')")
      .bind(nome, email, hash).run();

    return new Response(JSON.stringify({ sucesso: true }), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
