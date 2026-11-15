// Dados técnicos de cada café, usados no calendário, na ficha, no comparador e na loja.
// Épocas e altitudes são aproximadas e mudam de safra para safra. Preços são só de referência
// (R$ por kg) para a calculadora: não são cotação de mercado.
window.CAFES_EXTRA = {
  "kopi-luwak": {
    hemisferio: "norte",
    altitude: "900 a 1.600 m",
    clima: "Tropical úmido, com chuva quase o ano todo",
    variedade: "Arábica (algumas fazendas usam robusta)",
    calendario: { florada: [3, 4, 5], amadurecimento: [9, 10, 11], colheita: [10, 11, 12, 1] },
    metodo: { tipo: "À mão", motivo: "Os grãos são achados no chão da floresta, depois que a civeta passa. Não existe máquina para isso." },
    preco: 1800,
  },
  "black-ivory": {
    hemisferio: "norte",
    altitude: "cerca de 1.500 m",
    clima: "Tropical de montanha, com estação seca e estação chuvosa bem marcadas",
    variedade: "Arábica",
    calendario: { florada: [3, 4], amadurecimento: [9, 10, 11], colheita: [11, 12, 1, 2] },
    metodo: { tipo: "À mão", motivo: "Os grãos saem misturados ao esterco do elefante e são separados um a um por quem trabalha no santuário." },
    preco: 7000,
  },
  "jacu-bird": {
    hemisferio: "sul",
    altitude: "900 a 1.200 m",
    clima: "Tropical de altitude, com verão chuvoso e inverno seco",
    variedade: "Arábica",
    calendario: { florada: [9, 10], amadurecimento: [2, 3, 4], colheita: [5, 6, 7, 8] },
    metodo: { tipo: "À mão", motivo: "A ave escolhe as cerejas na mata. O que se colhe é o que ela deixa, e isso só se acha andando entre as árvores." },
    preco: 900,
  },
  geisha: {
    hemisferio: "norte",
    altitude: "1.600 a 1.900 m",
    clima: "Frio de montanha, com neblina quase todo dia",
    variedade: "Gesha (arábica)",
    calendario: { florada: [3, 4], amadurecimento: [9, 10, 11], colheita: [11, 12, 1, 2, 3] },
    metodo: { tipo: "À mão", motivo: "Cada pé é visitado várias vezes, só para tirar as cerejas no ponto exato. O lote é pequeno e vale muito." },
    preco: 1200,
  },
  "santa-helena": {
    hemisferio: "sul",
    altitude: "cerca de 500 a 800 m",
    clima: "Subtropical oceânico, ameno e com vento constante",
    variedade: "Bourbon de ponta verde (arábica)",
    calendario: { florada: [10, 11], amadurecimento: [4, 5, 6], colheita: [7, 8, 9] },
    metodo: { tipo: "À mão", motivo: "As fazendas são pequenas e ficam em encostas íngremes de uma ilha vulcânica. Máquina não entra." },
    preco: 700,
  },
  "blue-mountain": {
    hemisferio: "norte",
    altitude: "910 a 1.700 m",
    clima: "Úmido e fresco, com chuva e névoa frequentes",
    variedade: "Typica (arábica)",
    calendario: { florada: [3, 4, 5], amadurecimento: [8, 9, 10], colheita: [9, 10, 11, 12, 1, 2] },
    metodo: { tipo: "À mão", motivo: "As encostas são muito inclinadas e as cerejas não amadurecem juntas. Só gente consegue escolher." },
    preco: 450,
  },
};
