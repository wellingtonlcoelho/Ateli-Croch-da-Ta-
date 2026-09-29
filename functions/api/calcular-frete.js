// Calcula prazo de entrega estimado baseado no CEP
export async function onRequestPost({ request, env }) {
  try {
    const { cep } = await request.json();
    if (!cep || cep.length < 8) {
      return new Response(JSON.stringify({ erro: 'CEP inválido' }), { status: 400 });
    }

    const cepLimpo = cep.replace(/\D/g, '');

    // Consulta ViaCEP para descobrir o estado
    const viaCepRes = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const viaCepData = await viaCepRes.json();

    if (viaCepData.erro) {
      return new Response(JSON.stringify({ erro: 'CEP não encontrado' }), { status: 404 });
    }

    const uf = viaCepData.uf;
    const cidade = viaCepData.localidade;

    // Tabela de prazos por região (origem: Curitiba-PR)
    const prazos = {
      // Mesmo estado
      'PR': { dias: 3, frete: 15.00 },
      // Sul
      'SC': { dias: 5, frete: 18.00 },
      'RS': { dias: 5, frete: 20.00 },
      // Sudeste
      'SP': { dias: 7, frete: 22.00 },
      'RJ': { dias: 8, frete: 25.00 },
      'MG': { dias: 8, frete: 25.00 },
      'ES': { dias: 9, frete: 28.00 },
      // Centro-Oeste
      'GO': { dias: 10, frete: 30.00 },
      'MS': { dias: 8,  frete: 28.00 },
      'MT': { dias: 10, frete: 32.00 },
      'DF': { dias: 9,  frete: 28.00 },
      // Nordeste
      'BA': { dias: 12, frete: 35.00 },
      'SE': { dias: 12, frete: 35.00 },
      'AL': { dias: 13, frete: 38.00 },
      'PE': { dias: 13, frete: 38.00 },
      'PB': { dias: 14, frete: 40.00 },
      'RN': { dias: 14, frete: 40.00 },
      'CE': { dias: 15, frete: 42.00 },
      'PI': { dias: 15, frete: 42.00 },
      'MA': { dias: 16, frete: 45.00 },
      // Norte
      'PA': { dias: 18, frete: 48.00 },
      'TO': { dias: 14, frete: 38.00 },
      'AP': { dias: 20, frete: 55.00 },
      'AM': { dias: 22, frete: 60.00 },
      'RR': { dias: 22, frete: 60.00 },
      'AC': { dias: 25, frete: 65.00 },
      'RO': { dias: 18, frete: 48.00 }
    };

    const info = prazos[uf] || { dias: 20, frete: 50.00 };

    return new Response(JSON.stringify({
      cep: cepLimpo,
      uf,
      cidade,
      bairro: viaCepData.bairro,
      logradouro: viaCepData.logradouro,
      prazo_dias: info.dias,
      frete: info.frete
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ erro: err.message }), { status: 500 });
  }
}
