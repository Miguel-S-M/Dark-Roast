// Pixel art desenhada em canvas, sem arquivos de imagem: o portão e a cena da página inicial, a xícara,
// os grãos e as telas dos minigames do "Monte do seu jeito". Tudo nasce em baixa resolução e o CSS
// amplia com image-rendering: pixelated.
const Pixel = (function () {
  function tela(largura, altura) {
    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  const ret = (ctx, cor, x, y, l, a) => { ctx.fillStyle = cor; ctx.fillRect(x, y, l, a); };

  // elipse sem serrilhado suave: preenche linha por linha, então a borda fica "quadradinha"
  function elipse(ctx, cor, cx, cy, rx, ry) {
    ctx.fillStyle = cor;
    for (let y = Math.ceil(cy - ry); y <= Math.floor(cy + ry); y++) {
      const t = (y + 0.5 - cy) / ry;
      if (Math.abs(t) > 1) continue;
      const meio = rx * Math.sqrt(1 - t * t);
      ctx.fillRect(Math.round(cx - meio), y, Math.max(1, Math.round(2 * meio)), 1);
    }
  }

  // aleatório com semente: a cena sai igual toda vez
  function sorteador(semente) {
    let s = semente;
    return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; };
  }

  const rgb = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  function misturar(a, b, t) {
    const pa = rgb(a), pb = rgb(b);
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  // ---------- portão (torii) ----------
  function torii() {
    const { canvas, ctx } = tela(96, 106);
    const VERM = "#c0392b", CLARO = "#df5b4a", ESCURO = "#8e2a21", PRETO = "#1c1816", PRETO2 = "#3a3430";
    ret(ctx, PRETO, 0, 2, 2, 3); ret(ctx, PRETO, 94, 2, 2, 3);       // pontas do telhado, viradas para cima
    ret(ctx, PRETO, 0, 4, 96, 2); ret(ctx, PRETO, 2, 6, 92, 4);
    ret(ctx, PRETO2, 4, 4, 88, 1);
    ret(ctx, VERM, 7, 10, 82, 5); ret(ctx, CLARO, 7, 10, 82, 1); ret(ctx, ESCURO, 7, 14, 82, 1);
    ret(ctx, ESCURO, 44, 15, 8, 17); ret(ctx, CLARO, 44, 15, 8, 1);  // plaquinha do meio
    ret(ctx, VERM, 8, 31, 80, 6); ret(ctx, CLARO, 8, 31, 80, 1); ret(ctx, ESCURO, 8, 36, 80, 1);
    [13, 77].forEach((x) => {
      ret(ctx, VERM, x, 15, 6, 86);
      ret(ctx, CLARO, x, 15, 1, 86);
      ret(ctx, ESCURO, x + 4, 15, 2, 86);
      ret(ctx, PRETO, x - 2, 98, 10, 8);
      ret(ctx, PRETO2, x - 2, 98, 10, 1);
    });
    return canvas;
  }

  // ---------- xícara ----------
  // opcoes: liquido (cor ou null = vazia), espuma (cor), vapor, chantilly, sorvete, caramelo, canela, limao, acucar
  function xicara(o) {
    o = o || {};
    const { canvas, ctx } = tela(48, 52);
    const Y = 24; // altura da borda
    const meio = (y) => 17 - 5.5 * Math.pow((y - Y) / (44 - Y), 1.3);
    const rnd = sorteador(11);

    elipse(ctx, "rgba(0,0,0,0.25)", 24, 48, 22, 3);
    elipse(ctx, "#bdb4a0", 24, 46, 22, 4);
    elipse(ctx, "#e9e2d2", 24, 45, 22, 3.5);

    for (let y = Y; y <= 44; y++) {
      const m = meio(y), larg = Math.round(2 * m), sombra = Math.max(2, Math.round(m * 0.3));
      ret(ctx, "#f4efe3", Math.round(24 - m), y, larg, 1);
      ret(ctx, "#d9d1bf", Math.round(24 + m) - sombra, y, sombra, 1);
    }
    for (let y = 31; y <= 35; y++) {
      const m = meio(y);
      ret(ctx, "#2f4f8f", Math.round(24 - m), y, Math.round(2 * m), 1);
      for (let x = Math.round(24 - m) + (y % 2); x < Math.round(24 + m); x += 3) ret(ctx, "#6d8fd1", x, y, 1, 1); // ondinhas
    }
    ret(ctx, "#cfc6b2", 15, 44, 18, 2);

    elipse(ctx, "#bdb4a0", 42, 32, 5.5, 7.5);   // alça
    elipse(ctx, "#f4efe3", 42, 32, 4.5, 6.5);
    ctx.clearRect(40, 29, 3, 6);

    elipse(ctx, "#fbf7ec", 24, Y, 17.5, 4.5);   // borda e o que tem dentro
    elipse(ctx, o.liquido || "#cdc4b0", 24, Y + 0.5, 15.5, 3.5);
    if (!o.liquido) elipse(ctx, "#b3a994", 24, Y + 1.5, 14, 2);
    else ret(ctx, misturar(o.liquido, "#ffffff", 0.3), 14, Y - 1, 6, 1);
    if (o.espuma) elipse(ctx, o.espuma, 24, Y, 13, 2.5);

    let pilha = 0;
    if (o.sorvete) {
      elipse(ctx, "#e2d2a8", 24, Y - 5, 8, 7);
      elipse(ctx, "#f6e9c8", 23, Y - 6, 7, 6);
      ret(ctx, "#ffffff", 19, Y - 9, 3, 1);
      ret(ctx, "#e2d2a8", 16, Y - 1, 16, 1);
      pilha = 10;
    }
    const base = Y - pilha;
    if (o.chantilly) {
      elipse(ctx, "#e4e4f0", 24, base - 1, 10, 3.5); elipse(ctx, "#ffffff", 24, base - 2, 9.5, 3);
      elipse(ctx, "#e4e4f0", 24, base - 6, 7, 3);    elipse(ctx, "#ffffff", 24, base - 7, 6.5, 2.5);
      elipse(ctx, "#e4e4f0", 24, base - 10, 3.5, 2.5); elipse(ctx, "#ffffff", 24, base - 11, 3, 2);
      ret(ctx, "#ffffff", 24, base - 14, 1, 2);
    }

    if (o.caramelo) {
      const [y, x0, x1] = o.chantilly ? [base - 2, 16, 32] : o.sorvete ? [Y - 6, 18, 30] : [Y, 11, 37];
      for (let x = x0; x <= x1; x++) {
        const yy = y + (Math.floor((x - x0) / 3) % 2 ? 1 : -1);
        ret(ctx, x % 4 ? "#d8912b" : "#f2b84b", x, yy, 1, 1);
        ret(ctx, "#d8912b", x, yy + 1, 1, 1);
      }
      if (o.chantilly || o.sorvete) ret(ctx, "#d8912b", x1 - 2, y + 2, 1, 3);
    }

    if (o.canela) {
      const [cy, rx] = o.chantilly ? [base - 7, 5] : o.sorvete ? [Y - 6, 6] : [Y, 11];
      for (let i = 0; i < 16; i++) {
        const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd());
        ret(ctx, rnd() > 0.5 ? "#9a5b2e" : "#7a421f", Math.round(24 + Math.cos(a) * rx * r), Math.round(cy + Math.sin(a) * 2 * r), 1, 1);
      }
    }

    if (o.limao) {
      elipse(ctx, "#e8c53a", 9, Y + 1, 6, 5.5);
      elipse(ctx, "#fbe98a", 9, Y + 1, 4.5, 4);
      ret(ctx, "#e8c53a", 9, Y - 3, 1, 8); ret(ctx, "#e8c53a", 5, Y + 1, 9, 1);
      ret(ctx, "#e8c53a", 6, Y - 1, 1, 1); ret(ctx, "#e8c53a", 12, Y + 3, 1, 1);
      ret(ctx, "#e8c53a", 12, Y - 1, 1, 1); ret(ctx, "#e8c53a", 6, Y + 3, 1, 1);
    }

    if (o.acucar) {
      [[3, 42], [8, 44]].forEach(([x, y]) => {
        ret(ctx, "#ffffff", x, y, 4, 4); ret(ctx, "#d8d8e8", x, y + 3, 4, 1); ret(ctx, "#d8d8e8", x + 3, y, 1, 4);
      });
    }

    if (o.vapor && !o.sorvete) {
      ctx.globalAlpha = 0.4;
      [18, 24, 30].forEach((x, c) => {
        for (let y = base - (o.chantilly ? 17 : 4); y > 2; y--) ret(ctx, "#ffffff", Math.round(x + Math.sin(y * 0.7 + c * 2) * 1.6), y, 1, 1);
      });
      ctx.globalAlpha = 1;
    }
    return canvas;
  }

  // ---------- grão ----------
  function grao(cor) {
    const { canvas, ctx } = tela(14, 18);
    const escuro = misturar(cor, "#000000", 0.4);
    elipse(ctx, escuro, 7, 9, 6, 8);
    elipse(ctx, cor, 7, 9, 5, 7);
    for (let y = 3; y <= 15; y++) ret(ctx, escuro, 7 + Math.round(Math.sin((y - 3) * 0.5) * 1.3), y, 1, 1);
    ret(ctx, "rgba(255,255,255,0.3)", 4, 6, 1, 3);
    return canvas;
  }

  // ---------- cena da página inicial ----------
  function cena() {
    const L = 320, A = 211;
    const { canvas, ctx } = tela(L, A);
    const rnd = sorteador(7);

    const faixas = ["#0f0c2a", "#171340", "#231a55", "#352366", "#4f2b78", "#7a3480", "#b2417c", "#dd5f6b", "#f08a5d", "#f7b668"];
    faixas.forEach((cor, i) => {
      ret(ctx, cor, 0, i * 15, L, 15);
      for (let r = 1; r <= 2 && i; r++) for (let x = 0; x < L; x += 2) ret(ctx, cor, x + (r % 2), i * 15 - r, 1, 1); // transição pontilhada
    });

    for (let i = 0; i < 70; i++) ret(ctx, rnd() > 0.7 ? "#ffffff" : "#b9bdf5", Math.floor(rnd() * L), Math.floor(rnd() * 80), 1, 1);
    [[30, 10], [96, 24], [200, 14], [300, 30], [150, 6]].forEach(([x, y]) => {
      ret(ctx, "#ffffff", x, y, 1, 1); ret(ctx, "#d5d8ff", x - 1, y, 1, 1); ret(ctx, "#d5d8ff", x + 1, y, 1, 1);
      ret(ctx, "#d5d8ff", x, y - 1, 1, 1); ret(ctx, "#d5d8ff", x, y + 1, 1, 1);
    });

    ctx.globalAlpha = 0.08; elipse(ctx, "#f6e7b0", 262, 38, 24, 24);
    ctx.globalAlpha = 0.14; elipse(ctx, "#f6e7b0", 262, 38, 18, 18);
    ctx.globalAlpha = 1;
    elipse(ctx, "#f6e7b0", 262, 38, 13, 13);
    ret(ctx, "#e0cd92", 256, 33, 3, 2); ret(ctx, "#e0cd92", 266, 41, 4, 3); ret(ctx, "#e0cd92", 259, 46, 2, 2);

    // Fuji, com a neve em zigue-zague
    const pico = 62, chao = 148, cx = 160;
    for (let y = pico; y < chao; y++) {
      const m = 4 + 112 * Math.pow((y - pico) / (chao - pico), 0.78);
      for (let x = Math.round(cx - m); x <= Math.round(cx + m); x++) {
        const neve = y < pico + 15 + 7 * Math.abs(Math.sin(x * 0.33));
        ret(ctx, neve ? (x < cx ? "#c9cdf2" : "#eef0ff") : x < cx ? "#262055" : "#33296a", x, y, 1, 1);
      }
    }
    ctx.globalAlpha = 0.45;
    ret(ctx, "#e07a8a", 70, 112, 70, 2); ret(ctx, "#e07a8a", 190, 104, 60, 2); ret(ctx, "#e07a8a", 96, 122, 40, 2);
    ctx.globalAlpha = 1;
    for (let x = 0; x < L; x++) {
      const topo = 143 + Math.round(3 * Math.sin(x / 17) + 2 * Math.sin(x / 7));
      ret(ctx, "#1a1536", x, topo, 1, chao - topo + 1);
    }

    const aguas = ["#1d1b4e", "#211f58", "#262361", "#2b2868"];
    for (let y = chao; y < A; y++) ret(ctx, aguas[Math.floor((y - chao) / 16) % 4], 0, y, L, 1);
    for (let i = 0; i < 70; i++) ret(ctx, "#4a4a98", Math.floor(rnd() * L), chao + 3 + Math.floor(rnd() * 36), 2 + Math.floor(rnd() * 4), 1);
    for (let y = chao + 2; y < 180; y += 3) {
      const l = Math.max(2, 9 - Math.floor((y - chao) / 6) + Math.floor(rnd() * 3));
      ret(ctx, "#f3e3a0", 262 - Math.floor(l / 2), y, l, 1);
    }

    const portao = torii();
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.translate(0, chao * 2);
    ctx.scale(1, -1);
    ctx.drawImage(portao, 112, 42);
    ctx.restore();
    ctx.drawImage(portao, 112, 42);

    // ilha com lanterna de pedra
    elipse(ctx, "#120d26", 36, 160, 46, 12);
    ret(ctx, "#4b4660", 30, 150, 12, 4); ret(ctx, "#5a5470", 34, 134, 4, 16); ret(ctx, "#6b6585", 30, 124, 12, 10);
    ctx.globalAlpha = 0.25; elipse(ctx, "#ffd36b", 36, 129, 14, 10); ctx.globalAlpha = 1;
    ret(ctx, "#ffd36b", 33, 127, 6, 5);
    ret(ctx, "#4b4660", 26, 118, 20, 3); ret(ctx, "#4b4660", 29, 115, 14, 3); ret(ctx, "#4b4660", 33, 112, 6, 3); ret(ctx, "#4b4660", 35, 110, 2, 2);

    // mesa de madeira com a xícara vazia
    ret(ctx, "#3a2316", 0, 180, L, A - 180);
    ret(ctx, "#5a3a22", 0, 180, L, 1);
    for (let y = 189; y < A; y += 8) ret(ctx, "#2a190f", 0, y, L, 1);
    for (let y = 181, k = 0; y < A; y += 8, k++) for (let x = (k % 2) * 40; x < L; x += 80) ret(ctx, "#2a190f", x, y, 1, 8);
    elipse(ctx, "rgba(0,0,0,0.35)", 160, 193, 26, 4);
    ctx.drawImage(xicara({}), 136, 142);

    // galho de cerejeira no canto
    const galho = (x) => Math.round(10 + x * 0.28 + Math.sin(x / 9) * 1.5);
    for (let x = 0; x < 92; x++) ret(ctx, "#2a1a1e", x, galho(x), 1, x < 30 ? 3 : 2);
    [[24, 1], [44, 1], [60, -1], [78, 1]].forEach(([x, d]) => {
      for (let k = 0; k < 12; k++) ret(ctx, "#2a1a1e", x + k, galho(x) + d * Math.round(k * 0.8), 1, 1);
    });
    for (let i = 0; i < 80; i++) {
      const x = Math.floor(rnd() * 100), y = galho(x) + Math.floor(rnd() * 28) - 14;
      const cor = rnd() > 0.8 ? "#e87fa0" : "#f4a6b8";
      ret(ctx, cor, x, y, 3, 3); ret(ctx, "#fbd4de", x + 1, y + 1, 1, 1);
    }
    return canvas;
  }

  // ---------- minigame da torra ----------
  const GRAOS_NA_PANELA = [[24, 25], [32, 27], [41, 24], [50, 27], [59, 24], [68, 26], [76, 24], [28, 22], [46, 21], [64, 21], [36, 30], [56, 30], [72, 29], [20, 28]];

  // o: cor (do grão), quadro (número que muda com o tempo), fumaca (0 a 1)
  function panela(ctx, o) {
    ctx.clearRect(0, 0, 112, 64);
    [[34, 58, 10], [48, 60, 14], [62, 58, 11], [76, 60, 9]].forEach(([x, y, h], i) => {
      const alt = h + 8 + ((o.quadro + i) % 2 ? 3 : -2); // as pontas entram sob a panela
      for (let k = 0; k < alt; k++) {
        const l = Math.max(2, Math.round(9 * (1 - k / alt)));
        ret(ctx, "#d9381e", x - Math.floor(l / 2), y - k, l, 1);
        if (l > 4) ret(ctx, "#ff9a2e", x - Math.floor((l - 2) / 2), y - k, l - 2, 1);
        if (l > 6) ret(ctx, "#ffd37a", x - 1, y - k, 2, 1);
      }
    });
    ret(ctx, "#6b4a2f", 86, 24, 25, 4); ret(ctx, "#4a3320", 86, 27, 25, 1);  // cabo de madeira
    elipse(ctx, "#2a2522", 50, 32, 36, 14);
    ret(ctx, "#3d3631", 22, 41, 12, 1);
    elipse(ctx, "#4a423b", 50, 26, 38, 8);
    elipse(ctx, "#120e0c", 50, 26.5, 35, 6.5);
    const escuro = misturar(o.cor, "#000000", 0.35);
    GRAOS_NA_PANELA.forEach(([x, y], i) => {
      const py = y + ((i + o.quadro) % 5 === 0 ? -1 : 0);
      ret(ctx, o.cor, x, py, 5, 3); ret(ctx, o.cor, x + 1, py - 1, 3, 1); ret(ctx, o.cor, x + 1, py + 3, 3, 1);
      ret(ctx, escuro, x + 1, py + 1, 3, 1);
    });
    if (o.fumaca > 0) {
      ctx.globalAlpha = 0.5;
      const n = Math.round(o.fumaca * 16);
      for (let i = 0; i < n; i++) {
        const x = 24 + ((i * 17 + o.quadro * 3) % 56), y = 18 - ((i * 5 + o.quadro) % 18);
        ret(ctx, o.fumaca > 0.8 ? "#1a1a1a" : "#b8b8c8", x, y, 2, 2);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- minigame da coagem ----------
  const COAGEM_TOPO = 34, COAGEM_FUNDO = 55;
  const alturaDoNivel = (f) => Math.round(COAGEM_FUNDO - f * (COAGEM_FUNDO - COAGEM_TOPO));

  // o: nivel (0 a 1), despejando, copo (0 a 1), quadro, banda ([min, max])
  function coagem(ctx, o) {
    ctx.clearRect(0, 0, 120, 96);
    // copo de vidro, para dar para ver o café subindo
    for (let y = 62; y <= 90; y++) {
      const m = 19 - (y - 62) * 0.15;
      ret(ctx, "#a8c8e8", Math.round(60 - m), y, Math.round(2 * m), 1);
      ret(ctx, "#1d1740", Math.round(60 - m) + 2, y, Math.round(2 * m) - 4, 1);
    }
    const altura = Math.round(o.copo * 26);
    if (altura > 0) ret(ctx, "#5a3418", 43, 89 - altura, 34, altura);
    if (altura > 1) ret(ctx, "#8a5a30", 43, 89 - altura, 34, 1);
    ret(ctx, "#ffffff55", 42, 64, 1, 20);

    // suporte e cone
    ret(ctx, "#e9e2d2", 52, 58, 16, 4);
    for (let y = 32; y <= 57; y++) {
      const m = 23 - (y - 32) * 0.62;
      ret(ctx, "#e9e2d2", Math.round(60 - m), y, Math.round(2 * m), 1);
      ret(ctx, "#2a2650", Math.round(60 - m) + 2, y, Math.round(2 * m) - 4, 1);
    }
    ret(ctx, "#2f4f8f", 37, 32, 46, 2);
    const topoAgua = alturaDoNivel(o.nivel);
    if (o.nivel > 0.02) for (let y = topoAgua; y < 57; y++) {
      const m = 23 - (y - 32) * 0.62 - 2;
      ret(ctx, y === topoAgua ? "#cfe8ff" : "#6aa6e0", Math.round(60 - m), y, Math.round(2 * m), 1);
    }
    for (let y = 53; y < 57; y++) {   // borra do café
      const m = 23 - (y - 32) * 0.62 - 2;
      ret(ctx, "#4a2c1a", Math.round(60 - m), y, Math.round(2 * m), 1);
    }
    if (o.nivel > 0.02 && o.quadro % 3 !== 2) ret(ctx, "#6b4a2f", 60, 58 + (o.quadro % 3), 1, 2);   // pingo

    // faixa certa, à esquerda
    const alto = alturaDoNivel(o.banda[1]), baixo = alturaDoNivel(o.banda[0]);
    ret(ctx, "#4fbf6b", 28, alto, 2, baixo - alto);
    ret(ctx, "#f2c14e", 24, alto, 8, 1); ret(ctx, "#f2c14e", 24, baixo, 8, 1);

    // chaleira de ferro
    elipse(ctx, "#5a5a68", 92, 16, 13, 9); elipse(ctx, "#3b3b46", 92, 17, 12, 8);
    ret(ctx, "#3a3a42", 84, 10, 5, 2);
    elipse(ctx, "#3a3a42", 92, 8, 6, 3); ret(ctx, "#4a4a52", 91, 4, 2, 2);
    ret(ctx, "#4a4a58", 78, 20, 8, 3); ret(ctx, "#4a4a58", 72, 22, 8, 3); ret(ctx, "#4a4a58", 68, 24, 6, 2);
    ret(ctx, "#5a5a68", 80, 3, 22, 2);
    if (o.despejando) {
      const fim = o.nivel > 0.02 ? topoAgua : 52;
      for (let y = 26; y < fim; y++) ret(ctx, (y + o.quadro) % 3 ? "#9ed0ff" : "#ffffff", 68, y, 2, 1);
    }
  }

  return { torii, xicara, grao, cena, panela, coagem, misturar, elipse, ret, tela, alturaDoNivel };
})();
