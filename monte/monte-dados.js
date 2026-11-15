// Dados e regras do "Monte do seu jeito". Os perfis vão de 0 a 5 em quatro eixos (doce, acidez,
// amargor, corpo); cada escolha do jogador soma ou subtrai pontos e o resultado vira o texto final.
// Os números são um jogo, não uma medida de laboratório.
window.MONTE = {
  eixos: [["doce", "Doçura", "a doçura"], ["acidez", "Acidez", "a acidez"], ["amargor", "Amargor", "o amargor"], ["corpo", "Corpo", "o corpo"]],

  cafes: {
    "kopi-luwak":   { sabor: "Suave e achocolatado", perfil: { doce: 3, acidez: 1, amargor: 1, corpo: 3 } },
    "black-ivory":  { sabor: "Quase sem amargor, com notas de chocolate", perfil: { doce: 3, acidez: 1, amargor: 0, corpo: 3 } },
    "jacu-bird":    { sabor: "Macio e doce", perfil: { doce: 4, acidez: 2, amargor: 1, corpo: 3 } },
    geisha:         { sabor: "Floral e leve, com jasmim e cítricos", perfil: { doce: 3, acidez: 4, amargor: 1, corpo: 1 } },
    "santa-helena": { sabor: "Frutado, com acidez brilhante", perfil: { doce: 3, acidez: 4, amargor: 1, corpo: 2 } },
    "blue-mountain": { sabor: "Equilibrado e suave, com toque de nozes e flores", perfil: { doce: 3, acidez: 2, amargor: 1, corpo: 2 } },
  },

  // alvo = faixa (em % do progresso da torra) em que o grão está no ponto daquela torra
  torras: {
    clara: {
      nome: "Clara", cor: "#b07a45", alvo: [48, 62],
      resumo: "Acidez viva, notas frutadas ou florais e corpo leve.",
      dica: "Tire logo depois do primeiro estalo.",
      frase: "Na torra clara a acidez aparece mais e o amargor quase some, então o gosto próprio do grão fica em primeiro plano.",
      ajuste: { acidez: 1, amargor: -1, corpo: -1 },
    },
    media: {
      nome: "Média", cor: "#74472a", alvo: [64, 75],
      resumo: "Equilíbrio: doçura de caramelo, acidez e amargor na medida.",
      dica: "Tire entre o primeiro e o segundo estalo.",
      frase: "A torra média equilibra tudo: sobra doçura de caramelo e nada passa do ponto.",
      ajuste: {},
    },
    escura: {
      nome: "Escura", cor: "#2e1b12", alvo: [80, 90],
      resumo: "Corpo cheio, amargor e gosto de chocolate amargo e torrado.",
      dica: "Tire perto do segundo estalo, antes de queimar.",
      frase: "Na torra escura o corpo engrossa e o amargor aparece, com gosto de chocolate amargo, enquanto a acidez some.",
      ajuste: { acidez: -2, amargor: 1, corpo: 1 },
    },
  },

  qualidadeTorra: {
    ponto: { titulo: "No ponto", texto: "Você tirou os grãos na hora certa.", frase: "Os grãos saíram no ponto da torra.", ajuste: {} },
    "faltou-pouco": { titulo: "Quase lá", texto: "Faltou um pouquinho de fogo: o grão ficou meio verde.", frase: "A torra parou um pouco cedo e deixou uma acidez mais cortante.", ajuste: { acidez: 1, doce: -1 } },
    crua: { titulo: "Crua", texto: "Saiu cedo demais, o grão ainda está com cara de palha.", frase: "O grão saiu cru: tem gosto de grama e de palha, com quase nenhuma doçura.", ajuste: { acidez: 2, doce: -2, corpo: -1 } },
    "passou-pouco": { titulo: "Passou um pouco", texto: "Ficou um tempinho a mais no fogo.", frase: "A torra passou um pouco do ponto e puxou um amargor extra.", ajuste: { amargor: 1, doce: -1 } },
    queimou: { titulo: "Queimou", texto: "Os grãos passaram muito do ponto e carbonizaram.", frase: "O grão queimou: o gosto é de fumaça e carvão, com amargor que domina tudo.", ajuste: { amargor: 3, doce: -2, acidez: -1 } },
  },

  qualidadeCoagem: {
    equilibrada: { titulo: "Equilibrada", texto: "Você manteve a água na faixa certa quase o tempo todo.", frase: "A coagem ficou equilibrada, com a água passando na velocidade certa.", ajuste: {} },
    fraca: { titulo: "Fraca", texto: "A água ficou baixa demais: o café vai sair aguado.", frase: "A coagem ficou fraca, e o café saiu aguado e sem corpo.", ajuste: { corpo: -1, amargor: -1, doce: -1 } },
    forte: { titulo: "Passou da conta", texto: "Água demais, por tempo demais: o café vai sair carregado.", frase: "A coagem passou da conta e o café saiu carregado e mais amargo.", ajuste: { amargor: 1, corpo: 1, doce: -1 } },
  },

  bases: {
    agua: { nome: "Água", curto: "Café coado puro.", frase: "Coado só na água, é um café preto: o sabor do grão aparece sem disfarce.", ajuste: {}, mistura: null },
    leite: { nome: "Leite", curto: "Cremoso, suaviza tudo.", frase: "Com leite, a bebida fica cremosa e a acidez e o amargor se suavizam.", ajuste: { acidez: -1, amargor: -1, doce: 1, corpo: 1 }, mistura: ["#f1e3cf", 0.55] },
    achocolatado: { nome: "Achocolatado", curto: "Vira um mocha doce.", frase: "Com achocolatado vira um mocha: muito doce e achocolatado, com o café ao fundo.", ajuste: { doce: 2, amargor: -1, acidez: -1, corpo: 1 }, mistura: ["#5a3321", 0.6] },
    energetico: { nome: "Energético", curto: "Doce, de fruta e com gás.", frase: "O energético traz uma doçura artificial de fruta e deixa a mistura xaroposa e estranha.", ajuste: { doce: 2, acidez: 1, amargor: -1, corpo: -1 }, mistura: ["#9fd13a", 0.45] },
  },

  extras: {
    acucar: { nome: "Açúcar", curto: "Corta o amargor.", frase: "O açúcar derruba o amargor e arredonda o gosto.", ajuste: { doce: 1, amargor: -1 } },
    caramelo: { nome: "Caramelo", curto: "Calda doce e amanteigada.", frase: "A calda de caramelo deixa tudo mais doce e amanteigado.", ajuste: { doce: 2, corpo: 1 } },
    chantilly: { nome: "Chantilly", curto: "Topo cremoso.", frase: "O chantilly põe uma camada cremosa e doce por cima.", ajuste: { doce: 1, corpo: 1 } },
    canela: { nome: "Canela", curto: "Perfume de especiaria.", frase: "A canela perfuma a xícara com um toque de especiaria.", ajuste: {} },
    sorvete: { nome: "Sorvete", curto: "Derrete e vira gelado cremoso.", frase: "O sorvete derrete aos poucos e deixa a xícara gelada e cremosa, quase um affogato.", ajuste: { doce: 2, corpo: 1 } },
    limao: { nome: "Limão", curto: "Acidez cítrica.", frase: "O limão traz uma acidez cítrica que corta o doce e o amargor.", ajuste: { acidez: 2, doce: -1 } },
  },

  // p = onde o jogador tirou os grãos do fogo (0 a 100)
  avaliarTorra(torra, p) {
    const [de, ate] = MONTE.torras[torra].alvo;
    const id = p >= de && p <= ate ? "ponto"
      : p < de ? (de - p <= 8 ? "faltou-pouco" : "crua")
      : (p - ate <= 8 ? "passou-pouco" : "queimou");
    return { id, ponto: p };
  },

  // r = tempo (s) com a água na faixa, abaixo, acima, transbordando e o total
  avaliarCoagem(r) {
    const id = r.naBanda / r.total >= 0.65 && r.transbordou < 0.8 ? "equilibrada" : r.abaixo >= r.acima ? "fraca" : "forte";
    return { id };
  },

  perfil(est) {
    const soma = Object.assign({}, MONTE.cafes[est.cafeId].perfil);
    const ajustes = [MONTE.torras[est.torra].ajuste, MONTE.qualidadeTorra[est.torrado.id].ajuste, MONTE.qualidadeCoagem[est.coado.id].ajuste,
      MONTE.bases[est.base].ajuste, ...est.extras.map((e) => MONTE.extras[e].ajuste)];
    ajustes.forEach((a) => Object.keys(a).forEach((k) => { soma[k] += a[k]; }));
    Object.keys(soma).forEach((k) => { soma[k] = Math.max(0, Math.min(5, soma[k])); });
    return soma;
  },

  descrever(est, cafe) {
    const m = MONTE.cafes[est.cafeId], t = MONTE.torras[est.torra], b = MONTE.bases[est.base];
    const perfil = MONTE.perfil(est);

    const ordem = MONTE.eixos.slice().sort((x, y) => perfil[y[0]] - perfil[x[0]]);
    const [primeiro, segundo] = ordem, ultimo = ordem[ordem.length - 1];
    let resumo;
    if (perfil[primeiro[0]] <= 2) resumo = "é um copo leve e discreto, sem nenhum sabor mandando.";
    else {
      resumo = perfil[segundo[0]] >= 3 ? "predominam " + primeiro[2] + " e " + segundo[2] : "predomina " + primeiro[2];
      if (perfil[ultimo[0]] <= 1) resumo += ", e quase não se sente " + ultimo[2];
      resumo += ".";
    }

    const paragrafos = [
      cafe.nome + " vem de " + cafe.lugar + ". Puro, ele é " + m.sabor.toLowerCase() + ". " + t.frase,
      MONTE.qualidadeTorra[est.torrado.id].frase + " " + MONTE.qualidadeCoagem[est.coado.id].frase,
      [b.frase].concat(est.extras.map((e) => MONTE.extras[e].frase)).join(" ")
        + (est.base === "energetico" ? " Aviso de verdade: energético com café junta muita cafeína, então na vida real vale ir com calma." : ""),
      "No conjunto, " + resumo,
    ];

    const nomes = est.extras.map((e) => MONTE.extras[e].nome);
    return {
      titulo: cafe.nome + ", torra " + t.nome.toLowerCase(),
      subtitulo: "Base: " + b.nome.toLowerCase() + (nomes.length ? " · Complementos: " + nomes.join(", ").toLowerCase() : " · Sem complementos"),
      paragrafos,
      perfil,
    };
  },
};
