// ─────────────────────────────────────────────────────────
// Ícone padrão usado quando um produto não tem foto ainda
// ─────────────────────────────────────────────────────────
const ICONE_PADRAO = `
<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="58" r="24" fill="#9B7FBF"/>
  <circle cx="37" cy="36" r="11" fill="#9B7FBF"/>
  <circle cx="63" cy="36" r="11" fill="#9B7FBF"/>
  <circle cx="43" cy="57" r="2.6" fill="#FAF7F3"/>
  <circle cx="57" cy="57" r="2.6" fill="#FAF7F3"/>
  <path d="M45 66c1.8 2.6 8.2 2.6 10 0" stroke="#FAF7F3" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const money = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// ─────────────────────────────────────────────────────────
// Estado do carrinho (salvo no navegador da pessoa)
// ─────────────────────────────────────────────────────────
let carrinho = JSON.parse(localStorage.getItem('carrinho') || '{}');

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  atualizarContadores();
  renderizarCarrinho();
}

function adicionarAoCarrinho(id) {
  carrinho[id] = (carrinho[id] || 0) + 1;
  salvarCarrinho();
}

function mudarQuantidade(id, delta) {
  if (!carrinho[id]) return;
  carrinho[id] += delta;
  if (carrinho[id] <= 0) delete carrinho[id];
  salvarCarrinho();
}

function removerDoCarrinho(id) {
  delete carrinho[id];
  salvarCarrinho();
}

function totalItens() {
  return Object.values(carrinho).reduce((a, b) => a + b, 0);
}

function totalPreco() {
  return Object.entries(carrinho).reduce((soma, [id, qtd]) => {
    const p = PRODUTOS.find(p => p.id === id);
    return soma + (p ? p.preco * qtd : 0);
  }, 0);
}

function atualizarContadores() {
  document.getElementById('cartCount').textContent = totalItens();
  document.getElementById('drawerTotal').textContent = money(totalPreco());
  document.getElementById('checkoutBtn').disabled = totalItens() === 0;
}

// ─────────────────────────────────────────────────────────
// Renderização do catálogo
// ─────────────────────────────────────────────────────────
function categorias() {
  return ['Todos', ...new Set(PRODUTOS.map(p => p.categoria))];
}

let categoriaAtiva = 'Todos';

function renderizarFiltros() {
  const el = document.getElementById('filters');
  el.innerHTML = categorias().map(cat => `
    <button class="filter-chip ${cat === categoriaAtiva ? 'active' : ''}" data-cat="${cat}">
      ${cat}
    </button>
  `).join('');

  el.querySelectorAll('.filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      categoriaAtiva = btn.dataset.cat;
      renderizarFiltros();
      renderizarGrid();
    });
  });
}

function renderizarGrid() {
  const el = document.getElementById('grid');
  const lista = categoriaAtiva === 'Todos'
    ? PRODUTOS
    : PRODUTOS.filter(p => p.categoria === categoriaAtiva);

  el.innerHTML = lista.map(p => `
    <div class="card">
      <div class="card-media">
        ${p.imagem ? `<img src="${p.imagem}" alt="${p.nome}">` : ICONE_PADRAO}
        <span class="price-tag">${money(p.preco)}</span>
      </div>
      <div class="card-body">
        <div class="card-cat">${p.categoria}</div>
        <div class="card-title">${p.nome}</div>
        <div class="card-desc">${p.descricao}</div>
        <button class="add-btn" data-id="${p.id}">Adicionar ao carrinho</button>
      </div>
    </div>
  `).join('');

  el.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      adicionarAoCarrinho(btn.dataset.id);
      btn.textContent = 'Adicionado ✓';
      btn.classList.add('added');
      setTimeout(() => {
        btn.textContent = 'Adicionar ao carrinho';
        btn.classList.remove('added');
      }, 1200);
    });
  });
}

// ─────────────────────────────────────────────────────────
// Renderização do carrinho (painel lateral)
// ─────────────────────────────────────────────────────────
function renderizarCarrinho() {
  const el = document.getElementById('drawerItems');
  const ids = Object.keys(carrinho);

  if (ids.length === 0) {
    el.innerHTML = `<p class="drawer-empty">Seu carrinho está vazio.<br>Escolha um amigurumi para começar 🧶</p>`;
    return;
  }

  el.innerHTML = ids.map(id => {
    const p = PRODUTOS.find(p => p.id === id);
    if (!p) return '';
    const qtd = carrinho[id];
    return `
      <div class="drawer-item">
        <div class="drawer-item-thumb">
          ${p.imagem ? `<img src="${p.imagem}" alt="${p.nome}">` : ICONE_PADRAO}
        </div>
        <div class="drawer-item-info">
          <div class="drawer-item-name">${p.nome}</div>
          <div class="qty-row">
            <button class="qty-btn" data-id="${id}" data-delta="-1">−</button>
            <span>${qtd}</span>
            <button class="qty-btn" data-id="${id}" data-delta="1">+</button>
            <span class="remove-link" data-id="${id}">remover</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  el.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => mudarQuantidade(btn.dataset.id, Number(btn.dataset.delta)));
  });
  el.querySelectorAll('.remove-link').forEach(link => {
    link.addEventListener('click', () => removerDoCarrinho(link.dataset.id));
  });
}

// ─────────────────────────────────────────────────────────
// Abrir / fechar painel do carrinho
// ─────────────────────────────────────────────────────────
const drawer = document.getElementById('drawer');
const overlay = document.getElementById('overlay');

function abrirCarrinho() {
  drawer.classList.add('open');
  overlay.classList.add('open');
}
function fecharCarrinho() {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
}

document.getElementById('cartToggle').addEventListener('click', abrirCarrinho);
document.getElementById('drawerClose').addEventListener('click', fecharCarrinho);
overlay.addEventListener('click', fecharCarrinho);

// ─────────────────────────────────────────────────────────
// Checkout — chama a função de backend que cria a preferência
// no Mercado Pago e redireciona para o pagamento
// ─────────────────────────────────────────────────────────
document.getElementById('checkoutBtn').addEventListener('click', async () => {
  const btn = document.getElementById('checkoutBtn');
  const itens = Object.entries(carrinho).map(([id, qtd]) => {
    const p = PRODUTOS.find(p => p.id === id);
    return { id: p.id, nome: p.nome, preco: p.preco, quantidade: qtd };
  });

  btn.disabled = true;
  btn.textContent = 'Preparando pagamento...';

  try {
    const resp = await fetch('/api/create-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itens })
    });

    if (!resp.ok) throw new Error('Falha ao criar o pagamento');

    const data = await resp.json();
    if (data.init_point) {
      window.location.href = data.init_point;
    } else {
      throw new Error('Resposta sem link de pagamento');
    }
  } catch (err) {
    console.error(err);
    alert('Não foi possível iniciar o pagamento agora. Tente novamente em instantes.');
    btn.disabled = false;
    btn.textContent = 'Finalizar compra';
  }
});

// ─────────────────────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────────────────────
renderizarFiltros();
renderizarGrid();
atualizarContadores();
renderizarCarrinho();
