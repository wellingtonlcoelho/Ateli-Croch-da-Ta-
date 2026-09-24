# Ponto de Lã — sua loja de amigurumi

Site completo: catálogo, carrinho e pagamento via Mercado Pago (Pix e cartão),
pronto para publicar de graça na Cloudflare Pages.

## Estrutura dos arquivos

```
amigurumi-loja/
├── index.html                       → página principal da loja
├── style.css                        → visual do site
├── script.js                        → carrinho e lógica da página
├── products.js                      → SEU CATÁLOGO (edite aqui)
├── schema.sql                       → estrutura do banco de dados (estoque e pedidos)
├── sucesso.html / pendente.html / erro.html  → páginas após o pagamento
├── functions/api/create-preference.js  → cria o pagamento e checa estoque
├── functions/api/webhook-mercadopago.js → confirma venda e avisa por e-mail
├── functions/api/estoque.js         → informa quantidade disponível ao site
└── images/                          → pasta para colocar as fotos dos produtos
```

## O que o backend faz agora

1. Ao clicar em "Finalizar compra", o site confere no banco de dados se
   ainda há unidades daquele amigurumi antes de criar o pagamento.
2. O pedido é gravado no banco com status "pendente".
3. Quando o Mercado Pago confirma o pagamento (aprovado, recusado, etc.),
   ele avisa automaticamente o site através de um webhook — isso funciona
   mesmo que a cliente feche o navegador antes de voltar à loja.
4. Se o pagamento for aprovado, um e-mail é enviado avisando você da venda.
5. O estoque exibido no site (e o aviso "Esgotado") é sempre calculado a
   partir das vendas realmente aprovadas — você não precisa atualizar
   número nenhum manualmente depois de cada venda.

## Passo 1 — Editar seus produtos

Abra o arquivo `products.js` em qualquer editor de texto. Cada bloco é um produto:

```js
{ id: "p01", nome: "Coelhinho Flor", preco: 89.90, categoria: "Coleção Jardim",
  descricao: "Coelho fofinho com orelhas caídas...",
  imagem: "" },
```

- Troque nome, preço, descrição e categoria à vontade.
- Para adicionar uma foto: coloque o arquivo de imagem dentro da pasta `images`
  (ex: `images/coelho.jpg`) e escreva `imagem: "images/coelho.jpg"`.
  Enquanto o campo ficar vazio (`""`), o site mostra um ícone no lugar da foto.
- Para adicionar um produto novo, copie um bloco inteiro, cole antes do `];`
  no final do arquivo, e troque o `id` para um valor único (ex: `"p16"`).

## Passo 2 — Criar sua conta no Mercado Pago

1. Crie (ou acesse) sua conta em [mercadopago.com.br](https://www.mercadopago.com.br)
2. Vá em **Seu negócio → Configurações → Credenciais de produção**
   (em [mercadopago.com.br/developers/panel](https://www.mercadopago.com.br/developers/panel))
3. Copie o **Access Token de produção** (começa com `APP_USR-...`).
   Guarde-o em local seguro — é a chave que permite receber pagamentos.
   Nunca cole esse token diretamente em nenhum arquivo do site.

## Passo 3 — Subir o código no GitHub

A Cloudflare Pages publica direto a partir de um repositório GitHub.

1. Crie uma conta gratuita em [github.com](https://github.com) se ainda não tiver.
2. Crie um repositório novo (pode ser privado) e suba esta pasta inteira nele
   — pelo site do GitHub (botão "Add file → Upload files") ou por linha de
   comando, se preferir.

## Passo 4 — Publicar na Cloudflare Pages

1. Crie uma conta gratuita em [dash.cloudflare.com](https://dash.cloudflare.com)
2. No menu, vá em **Workers & Pages → Create → Pages → Connect to Git**
3. Selecione o repositório que você criou no passo anterior
4. Nas configurações de build, deixe o **framework como "None"** e os campos
   de build command / output directory em branco (o site é estático, não
   precisa de build)
5. Clique em **Save and Deploy** — em cerca de 1 minuto seu site estará no ar
   em um endereço tipo `ponto-de-la.pages.dev`

## Passo 5 — Configurar o token do Mercado Pago (obrigatório)

Sem esse passo o botão "Finalizar compra" não funciona.

1. No projeto que você acabou de criar na Cloudflare, vá em
   **Settings → Environment variables**
2. Clique em **Add variable**
3. Nome: `MP_ACCESS_TOKEN`
4. Valor: cole o Access Token que você copiou no Passo 2
5. Marque a opção de variável **secreta/encrypted**, se disponível
6. Salve e clique em **Redeploy** (reimplantar) para a variável entrar em vigor

## Passo 6 — Banco de dados (controle de estoque + histórico de pedidos)

Isso é o que dá ao site memória: saber quanto ainda tem de cada peça e
guardar o histórico de vendas.

1. No painel da Cloudflare, vá em **Workers & Pages → D1 SQL Database → Create Database**
2. Dê um nome (ex: `pontodela-db`) e crie
3. Abra o banco criado e clique na aba **Console**
4. Abra o arquivo `schema.sql` (está na pasta do projeto), copie todo o
   conteúdo e cole no console. Clique em **Execute** — isso cria as
   tabelas e já cadastra um estoque inicial de exemplo para cada produto.
5. **Ajuste as quantidades reais**: ainda no console, rode um comando por
   produto para corrigir a quantidade que você realmente tem feita, por
   exemplo:
   ```sql
   UPDATE produtos_estoque SET estoque = 3 WHERE produto_id = 'p01';
   ```
6. Agora ligue esse banco ao seu site: no seu projeto dentro de
   **Workers & Pages**, vá em **Settings → Functions → D1 database bindings
   → Add binding**
   - Variable name: `DB`
   - D1 database: selecione o banco que você criou
7. Clique em **Redeploy** no projeto para a ligação entrar em vigor

**Quando adicionar um produto novo no `products.js`**, lembre de rodar no
console do D1:
```sql
INSERT INTO produtos_estoque (produto_id, estoque) VALUES ('p16', 5);
```
(troque `'p16'` pelo id do novo produto e `5` pela quantidade feita)

**Para ver seu histórico de vendas** a qualquer momento, no mesmo console:
```sql
SELECT * FROM pedidos ORDER BY criado_em DESC;
```

## Passo 7 — E-mail avisando quando vender (opcional)

1. Crie uma conta gratuita em [resend.com](https://resend.com) (até 3.000
   e-mails/mês grátis, mais que suficiente para começar)
2. No painel do Resend, vá em **API Keys → Create API Key** e copie a chave
3. Volte na Cloudflare, no seu projeto, em **Settings → Environment variables**,
   adicione:
   - `RESEND_API_KEY` → a chave copiada (marque como secreta)
   - `SELLER_EMAIL` → o e-mail onde você quer receber o aviso de venda
4. Clique em **Redeploy**

Sem configurar isso, o site continua funcionando normalmente — só não
manda o e-mail de aviso.

## Passo 8 — Domínio próprio (opcional)

Em **Custom domains**, dentro do seu projeto na Cloudflare Pages, você pode
ligar um domínio próprio (ex: `pontodela.com.br`) se já tiver um registrado,
ou comprar um direto por lá.

## Testando antes de vender de verdade

O Mercado Pago tem um modo de teste (credenciais "sandbox" / usuários de
teste). Se quiser simular uma compra sem mexer em dinheiro de verdade antes
de divulgar a loja, veja o guia oficial:
https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/accounts

## Dúvidas comuns

**"Finalizar compra" dá erro.**
Confira se a variável `MP_ACCESS_TOKEN` foi salva certinho na Cloudflare
(Passo 5) e se você clicou em "Redeploy" depois de salvar.

**Todos os produtos aparecem sem limite de estoque, mesmo depois de vender.**
Confira se o banco D1 foi ligado ao projeto (Passo 6, item 6 — o vínculo
chamado `DB`) e se você rodou o `schema.sql` no console do banco.

**Vendi um item mas não recebi o e-mail de aviso.**
Confira se `RESEND_API_KEY` e `SELLER_EMAIL` estão configurados (Passo 7).
Sem eles o site funciona normalmente, só não manda o e-mail. Você também
pode conferir se a venda foi mesmo aprovada olhando a tabela `pedidos`
no console do D1.

**Quero mudar as cores ou o texto do site.**
As cores ficam no topo do arquivo `style.css` (variáveis como `--purple`,
`--lilac`, `--lavender`, `--bg`). Textos como o título da página inicial
estão direto no `index.html`.

**Quero adicionar frete.**
Este site cobra só o valor dos produtos. Para somar frete, dá pra adicionar
um item extra ("Frete") na função `functions/api/create-preference.js`,
ou usar um valor fixo por enquanto e ajustar combinando com a cliente por
mensagem.
