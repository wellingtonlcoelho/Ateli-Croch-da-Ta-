// ─────────────────────────────────────────────────────────
// DADOS DE CONTATO DA LOJA
//
// Edite somente os valores abaixo. Eles alimentam automaticamente
// a seção "Sobre mim" e o botão flutuante do WhatsApp.
// ─────────────────────────────────────────────────────────

const CONTATO = {
  // Texto exibido na seção "Sobre mim"
  bio: "Oi, eu sou a Thalita! Crio cada amigurumi à mão, ponto a ponto, com fio 100% algodão. Cada peça é única e feita com bastante carinho — que tal fazer parte dessa história com um bichinho feito especialmente para você?",

  // Instagram: informe o link completo e o texto que aparecerá no botão
  instagramUrl: "https://instagram.com/seu.perfil.aqui",
  instagramTexto: "@seu.perfil.aqui",

  // E-mail exibido no botão de contato
  email: "seuemail@exemplo.com",

  // WhatsApp: somente números, incluindo país (55) e DDD.
  // Exemplo para (41) 99999-9999: "5541999999999"
  whatsapp: "5500000000000",

  // Mensagem preenchida automaticamente no WhatsApp
  whatsappMensagem: "Olá! Vi sua loja e gostaria de saber mais sobre os amigurumis 🧶",
};

// Substitui o desenho estático da capa pelo gatinho SVG animado.
document.addEventListener('DOMContentLoaded', () => {
  const heroArt = document.querySelector('.hero-art');
  if (!heroArt) return;

  const style = document.createElement('style');
  style.textContent = `
    .hero-art > svg { display: none; }
    .hero-art::before {
      content: "";
      position: absolute;
      inset: 0;
      background: url('hero-cat.svg') center / contain no-repeat;
      z-index: 1;
    }
  `;
  document.head.appendChild(style);
});
