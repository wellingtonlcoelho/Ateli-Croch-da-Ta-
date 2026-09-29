-- ─────────────────────────────────────────────────────────
-- Esquema do banco de dados da loja (Cloudflare D1)
--
-- Como usar este arquivo: veja o Passo "Banco de dados (D1)"
-- no README.md. Resumo: você cola o conteúdo deste arquivo no
-- console SQL do D1 (painel da Cloudflare) uma única vez, ou
-- roda `wrangler d1 execute SEU_BANCO --file=schema.sql`.
-- ─────────────────────────────────────────────────────────

-- Quantidade disponível de cada amigurumi.
-- "estoque" é o total que você fez daquela peça.
-- A quantidade JÁ VENDIDA é calculada automaticamente a partir
-- dos pedidos aprovados — você nunca precisa subtrair na mão.
CREATE TABLE IF NOT EXISTS produtos_estoque (
  produto_id TEXT PRIMARY KEY,
  estoque INTEGER NOT NULL DEFAULT 0
);

-- Um pedido é criado no momento em que a cliente clica em
-- "Finalizar compra" (status "pendente"), e é atualizado
-- automaticamente pelo webhook quando o Mercado Pago confirma
-- o pagamento (status "approved", "rejected" etc.)
CREATE TABLE IF NOT EXISTS pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER REFERENCES usuarios(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  status_confeccao TEXT DEFAULT 'na_fila',
  prazo_confeccao_dias INTEGER,
  prazo_entrega_dias INTEGER,
  cep_destino TEXT,
  codigo_rastreio TEXT,
  total REAL NOT NULL,
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT
);

-- Os itens que compõem cada pedido.
CREATE TABLE IF NOT EXISTS itens_pedido (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id TEXT NOT NULL,
  produto_nome TEXT NOT NULL,
  preco REAL NOT NULL,
  quantidade INTEGER NOT NULL
);

-- ─────────────────────────────────────────────────────────
-- Estoque inicial — AJUSTE ESSAS QUANTIDADES para as reais.
-- Se adicionar um produto novo no products.js, adicione aqui
-- também uma linha com o mesmo "id" e a quantidade feita.
-- ─────────────────────────────────────────────────────────
INSERT INTO produtos_estoque (produto_id, estoque) VALUES
  ('p01', 5), ('p02', 5), ('p03', 5), ('p04', 3), ('p05', 4),
  ('p06', 5), ('p07', 8), ('p08', 6), ('p09', 4), ('p10', 5),
  ('p11', 4), ('p12', 4), ('p13', 5), ('p14', 4), ('p15', 5)
ON CONFLICT(produto_id) DO NOTHING;

-- ─────────────────────────────────────────────────────────
-- NOVAS TABELAS: SISTEMA DE USUÁRIOS E SUPORTE
-- ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'cliente',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessoes (
  token TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  expira_em TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS suporte_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  assunto TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'aberto',
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mensagens_suporte (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL REFERENCES suporte_tickets(id),
  remetente_id INTEGER NOT NULL REFERENCES usuarios(id),
  mensagem TEXT NOT NULL,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);
