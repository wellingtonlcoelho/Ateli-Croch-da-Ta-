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
├── sucesso.html / pendente.html / erro.html  → páginas após o pagamento
├── functions/api/create-preference.js  → integração segura com o Mercado Pago
└── images/                          → pasta para colocar as fotos dos produtos
```

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

## Passo 6 — Domínio próprio (opcional)

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

**Quero mudar as cores ou o texto do site.**
As cores ficam no topo do arquivo `style.css` (variáveis como `--purple`,
`--lilac`, `--lavender`, `--bg`). Textos como o título da página inicial
estão direto no `index.html`.

**Quero adicionar frete.**
Este site cobra só o valor dos produtos. Para somar frete, dá pra adicionar
um item extra ("Frete") na função `functions/api/create-preference.js`,
ou usar um valor fixo por enquanto e ajustar combinando com a cliente por
mensagem.
