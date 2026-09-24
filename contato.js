// ─────────────────────────────────────────────────────────
// DADOS DE CONTATO DA LOJA
// ─────────────────────────────────────────────────────────

const CONTATO = {
  bio: "Oi, eu sou a Thalita! Crio cada amigurumi à mão, ponto a ponto, com fio 100% algodão. Cada peça é única e feita com bastante carinho — que tal fazer parte dessa história com um bichinho feito especialmente para você?",
  instagramUrl: "https://instagram.com/seu.perfil.aqui",
  instagramTexto: "@seu.perfil.aqui",
  email: "seuemail@exemplo.com",
  whatsapp: "5500000000000",
  whatsappMensagem: "Olá! Vi sua loja e gostaria de saber mais sobre os amigurumis 🧶",
};

// A arte é inserida como um único <img>. Isso evita o bug causado pela
// mistura do SVG antigo, pseudo-elementos CSS e círculos decorativos duplicados.
document.addEventListener('DOMContentLoaded', () => {
  const heroArt = document.querySelector('.hero-art');
  if (!heroArt) return;

  heroArt.innerHTML = '<img src="images/gatinho-croche-animado.svg" alt="Gatinho fazendo crochê" style="width: 100%; max-width: 320px;">';
});
