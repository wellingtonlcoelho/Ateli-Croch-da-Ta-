// ─────────────────────────────────────────────────────────
// CATÁLOGO DE PRODUTOS
// Edite esta lista para adicionar, remover ou mudar seus amigurumi.
// Cada produto precisa de: id (único), nome, preco (em reais, número),
// descricao, imagem (caminho do arquivo dentro da pasta /images) e categoria.
//
// Para trocar uma foto: coloque o arquivo dentro da pasta "images"
// e escreva o nome do arquivo no campo "imagem" (ex: "images/coelho.jpg").
// Se o campo "imagem" ficar vazio (""), o site mostra um ícone no lugar.
// ─────────────────────────────────────────────────────────

const PRODUTOS = [
  { id: "p01", nome: "Coelhinho Flor", preco: 89.90, categoria: "Coleção Jardim",
    descricao: "Coelho fofinho com orelhas caídas e uma florzinha na orelha. Feito em fio 100% algodão.",
    imagem: "" },
  { id: "p02", nome: "Ursinho Mel", preco: 79.90, categoria: "Clássicos",
    descricao: "Ursinho clássico com laço no pescoço. Altura aproximada de 18cm.",
    imagem: "" },
  { id: "p03", nome: "Gatinho Malhado", preco: 74.90, categoria: "Bichanos",
    descricao: "Gato sentado com carinha serena, disponível em cinza ou laranja.",
    imagem: "" },
  { id: "p04", nome: "Polvo Arco-Íris", preco: 94.90, categoria: "Fundo do Mar",
    descricao: "Polvo com oito tentáculos em degradê de cores. Peça que mais leva tempo pra fazer!",
    imagem: "" },
  { id: "p05", nome: "Unicórnio Estelar", preco: 99.90, categoria: "Fantasia",
    descricao: "Unicórnio branco com crina colorida e chifre bordado à mão.",
    imagem: "" },
  { id: "p06", nome: "Dino Verdinho", preco: 84.90, categoria: "Pré-histórico",
    descricao: "Dinossauro de espinhos macios, sucesso entre as crianças.",
    imagem: "" },
  { id: "p07", nome: "Abelhinha Zum", preco: 59.90, categoria: "Jardim",
    descricao: "Abelhinha pequena com asas de feltro, tamanho ideal para chaveiro ou mini presente.",
    imagem: "" },
  { id: "p08", nome: "Sapinho Feliz", preco: 64.90, categoria: "Fundo do Mar",
    descricao: "Sapo verde-limão com bochechas rosadas e sorriso largo.",
    imagem: "" },
  { id: "p09", nome: "Raposinha Outono", preco: 82.90, categoria: "Floresta",
    descricao: "Raposa laranja com peito branco e cauda fofa.",
    imagem: "" },
  { id: "p10", nome: "Coruja Sábia", preco: 77.90, categoria: "Floresta",
    descricao: "Coruja com olhos grandes bordados e asas dobráveis.",
    imagem: "" },
  { id: "p11", nome: "Panda Bambu", preco: 89.90, categoria: "Clássicos",
    descricao: "Panda preto e branco segurando uma folhinha de bambu em feltro.",
    imagem: "" },
  { id: "p12", nome: "Lhama Serelepe", preco: 87.90, categoria: "Fantasia",
    descricao: "Lhama com manta colorida, um dos queridinhos da loja.",
    imagem: "" },
  { id: "p13", nome: "Tubarãozinho Bobo", preco: 69.90, categoria: "Fundo do Mar",
    descricao: "Tubarão de barbatana macia, super gostoso de abraçar.",
    imagem: "" },
  { id: "p14", nome: "Elefantinho Nuvem", preco: 91.90, categoria: "Clássicos",
    descricao: "Elefante cinza-clarinho com orelhas grandes e tromba curvada.",
    imagem: "" },
  { id: "p15", nome: "Pinguim Gelo", preco: 72.90, categoria: "Polar",
    descricao: "Pinguim preto e branco com cachecol listrado removível.",
    imagem: "" },
];
