// "Monte do seu jeito": escolher café e torra, torrar, coar, escolher base e complementos e ver a
// xícara pronta. Cada etapa é uma função em TELAS que devolve a tela; ir() troca a tela atual.
(function () {
  "use strict";
  const M = window.MONTE;
  const PASSOS = [["cafe", "Café"], ["torra", "Torra"], ["torrar", "Torrar"], ["coar", "Coar"], ["base", "Base"], ["extras", "Extras"], ["pronto", "Pronto"]];
  const PARADAS = [[0, "#8aa24f"], [25, "#c2b25a"], [40, "#c79a4e"], [50, "#b07a45"], [64, "#8c5a33"], [72, "#74472a"], [80, "#4a2c1d"], [88, "#2e1b12"], [95, "#161012"], [100, "#0c0a0a"]];

  const palco = document.getElementById("palco");
  const trilha = document.getElementById("trilha");
  const TELAS = {};
  let estado, atual;
  let parar = () => {}; // cancela o minigame da tela que está saindo

  function reiniciar() {
    estado = { cafeId: null, torra: null, torrado: null, coado: null, base: null, extras: [], salvoId: null };
  }
  const cafeAtual = () => window.CAFES.find((c) => c.id === estado.cafeId);

  function ampliar(canvas, escala) {
    canvas.classList.add("px");
    canvas.style.width = canvas.width * escala + "px";
    return canvas;
  }

  function corDoGrao(p) {
    for (let i = 1; i < PARADAS.length; i++) {
      if (p <= PARADAS[i][0]) {
        const [p0, c0] = PARADAS[i - 1], [p1, c1] = PARADAS[i];
        return Pixel.misturar(c0, c1, (p - p0) / (p1 - p0));
      }
    }
    return PARADAS[PARADAS.length - 1][1];
  }

  function corDaBebida(est) {
    const cafe = M.torras[est.torra].cor;
    const mistura = M.bases[est.base].mistura;
    return mistura ? Pixel.misturar(cafe, mistura[0], mistura[1]) : Pixel.misturar(cafe, "#000000", 0.25);
  }

  function opcoesDaXicara(est) {
    const liquido = corDaBebida(est), extras = est.extras;
    return {
      liquido,
      vapor: !extras.includes("sorvete"),
      espuma: est.base === "leite" ? Pixel.misturar(liquido, "#ffffff", 0.35) : null,
      chantilly: extras.includes("chantilly"),
      sorvete: extras.includes("sorvete"),
      caramelo: extras.includes("caramelo"),
      canela: extras.includes("canela"),
      limao: extras.includes("limao"),
      acucar: extras.includes("acucar"),
    };
  }

  const botao = (texto, fn, claro) => Dom.criar("button", { type: "button", classe: "px-botao" + (claro ? " claro" : ""), texto, onclick: fn });
  const acoes = (...itens) => Dom.criar("div", { classe: "acoes" }, ...itens);
  const tela = (titulo, lead, ...resto) => Dom.criar("div", { classe: "tela" }, Dom.criar("h1", { texto: titulo }), lead && Dom.criar("p", { classe: "tela-lead", texto: lead }), ...resto);

  function marcarTrilha(atual) {
    const i = PASSOS.findIndex(([id]) => id === atual);
    trilha.replaceChildren(...PASSOS.map(([, nome], n) =>
      Dom.criar("li", { classe: n < i ? "feito" : n === i ? "atual" : null, "aria-current": n === i ? "step" : null, texto: (n + 1) + ". " + nome })));
  }

  function ir(passo) {
    parar();
    parar = () => {};
    atual = passo;
    marcarTrilha(passo);
    const conteudo = TELAS[passo]();
    palco.replaceChildren(conteudo);
    const titulo = conteudo.querySelector("h1");
    titulo.tabIndex = -1;
    titulo.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // ---------- escolhas ----------
  TELAS.cafe = function () {
    const cartoes = window.CAFES.map((c) => Dom.criar("button", {
      type: "button", classe: "cartao", "aria-pressed": String(estado.cafeId === c.id),
      onclick: () => { estado.cafeId = c.id; ir("torra"); },
    }, ampliar(Pixel.grao("#74472a"), 3), Dom.criar("strong", { texto: c.nome }), Dom.criar("small", { texto: c.lugar }), Dom.criar("span", { texto: M.cafes[c.id].sabor })));
    return tela("Escolha o café", "Cada um tem um sabor próprio. Pense no que você quer provar.", Dom.criar("div", { classe: "cartoes" }, cartoes));
  };

  TELAS.torra = function () {
    const cartoes = Object.entries(M.torras).map(([id, t]) => Dom.criar("button", {
      type: "button", classe: "cartao", "aria-pressed": String(estado.torra === id),
      onclick: () => { estado.torra = id; ir("torrar"); },
    }, ampliar(Pixel.grao(t.cor), 3), Dom.criar("strong", { texto: "Torra " + t.nome.toLowerCase() }), Dom.criar("span", { texto: t.resumo })));
    return tela("Qual nível de torra?", "Quanto mais tempo no fogo, mais escuro o grão e mais amargo o café.",
      Dom.criar("div", { classe: "cartoes" }, cartoes), acoes(botao("Voltar", () => ir("cafe"), true)));
  };

  TELAS.base = function () {
    const cartoes = Object.entries(M.bases).map(([id, b]) => Dom.criar("button", {
      type: "button", classe: "cartao", "aria-pressed": String(estado.base === id),
      onclick: () => { estado.base = id; ir("extras"); },
    }, Dom.criar("strong", { texto: b.nome }), Dom.criar("span", { texto: b.curto })));
    return tela("Escolha a base", "É o líquido em que o café vai ser coado.",
      Dom.criar("div", { classe: "cartoes" }, cartoes), acoes(botao("Voltar", () => ir("coar"), true)));
  };

  TELAS.extras = function () {
    const previa = Pixel.tela(48, 52);
    ampliar(previa.canvas, 6);
    const desenharPrevia = () => {
      previa.ctx.clearRect(0, 0, 48, 52);
      previa.ctx.drawImage(Pixel.xicara(opcoesDaXicara(estado)), 0, 0);
    };
    desenharPrevia();

    const cartoes = Object.entries(M.extras).map(([id, e]) => {
      const b = Dom.criar("button", { type: "button", classe: "cartao pequeno", "aria-pressed": String(estado.extras.includes(id)) },
        Dom.criar("strong", { texto: e.nome }), Dom.criar("span", { texto: e.curto }));
      b.addEventListener("click", () => {
        estado.extras = estado.extras.includes(id) ? estado.extras.filter((x) => x !== id) : estado.extras.concat(id);
        estado.salvoId = null;
        b.setAttribute("aria-pressed", String(estado.extras.includes(id)));
        desenharPrevia();
      });
      return b;
    });
    return tela("Complementos", "Escolha quantos quiser, ou nenhum. A xícara muda enquanto você escolhe.",
      Dom.criar("div", { classe: "previa-linha" }, previa.canvas, Dom.criar("div", { classe: "cartoes" }, cartoes)),
      acoes(botao("Voltar", () => ir("base"), true), botao("Ver minha xícara", () => ir("pronto"))));
  };

  // ---------- minigame da torra ----------
  TELAS.torrar = function () {
    const torra = M.torras[estado.torra];
    const DURACAO = 16000;
    const { canvas, ctx } = Pixel.tela(112, 64);
    ampliar(canvas, 3);
    const preenchimento = Dom.criar("div", { classe: "barra-preenchimento" });
    const barra = Dom.criar("div", { classe: "barra-torra", role: "progressbar", "aria-label": "Progresso da torra", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": "0" },
      preenchimento,
      Dom.criar("span", { classe: "marca", style: "left:55%" }, Dom.criar("small", { texto: "1º estalo" })),
      Dom.criar("span", { classe: "marca", style: "left:80%" }, Dom.criar("small", { texto: "2º estalo" })));
    const estalo = Dom.criar("p", { classe: "estalo", role: "status" });
    const resultado = Dom.criar("div", { classe: "resultado", hidden: true });
    const tirar = Dom.criar("button", { type: "button", classe: "px-botao grande", texto: "Tirar do fogo" });

    let inicio = null, id = 0, timer = 0, p = 0, acabou = false, estalou1 = false, estalou2 = false;

    function avisar(texto) {
      estalo.textContent = texto;
      clearTimeout(timer);
      timer = setTimeout(() => { estalo.textContent = ""; }, 1400);
    }

    function passo(agora) {
      if (inicio === null) inicio = agora;
      p = Math.min(100, ((agora - inicio) / DURACAO) * 100);
      if (!estalou1 && p >= 55) { estalou1 = true; avisar("Primeiro estalo!"); }
      if (!estalou2 && p >= 80) { estalou2 = true; avisar("Segundo estalo!"); }
      Pixel.panela(ctx, { cor: corDoGrao(p), quadro: Math.floor(agora / 220), fumaca: Math.max(0, (p - 70) / 30) });
      preenchimento.style.width = p + "%";
      barra.setAttribute("aria-valuenow", String(Math.round(p)));
      if (p >= 100) terminar(); else id = requestAnimationFrame(passo);
    }

    function terminar() {
      if (acabou) return;
      acabou = true;
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", tecla);
      estado.torrado = M.avaliarTorra(estado.torra, p);
      const q = M.qualidadeTorra[estado.torrado.id];
      tirar.hidden = true;
      resultado.hidden = false;
      resultado.replaceChildren(Dom.criar("strong", { texto: q.titulo }), Dom.criar("p", { texto: q.texto }),
        acoes(botao("Tentar de novo", () => ir("torrar"), true), botao("Continuar", () => ir("coar"))));
    }

    function tecla(e) {
      if (e.key === " " && !e.repeat) { e.preventDefault(); terminar(); }
    }

    tirar.addEventListener("click", terminar);
    document.addEventListener("keydown", tecla);
    id = requestAnimationFrame(passo);
    parar = () => { cancelAnimationFrame(id); clearTimeout(timer); document.removeEventListener("keydown", tecla); };

    return tela("Torre os grãos", "Tire os grãos do fogo no ponto da torra " + torra.nome.toLowerCase() + ". " + torra.dica + " Use o botão ou a barra de espaço.",
      Dom.criar("div", { classe: "jogo-linha" }, canvas, Dom.criar("div", { classe: "jogo-info" }, estalo, tirar)),
      barra, resultado, acoes(botao("Voltar", () => ir("torra"), true)));
  };

  // ---------- minigame da coagem ----------
  TELAS.coar = function () {
    const DURACAO = 12, BANDA = [0.42, 0.72];
    const { canvas, ctx } = Pixel.tela(120, 96);
    ampliar(canvas, 3);
    const preenchimento = Dom.criar("div", { classe: "barra-preenchimento" });
    const medidor = Dom.criar("div", { classe: "barra-torra barra-nivel", role: "img", "aria-label": "Nível da água no filtro" },
      preenchimento, Dom.criar("span", { classe: "faixa", style: "left:" + BANDA[0] * 100 + "%;width:" + (BANDA[1] - BANDA[0]) * 100 + "%" }));
    const tempo = Dom.criar("p", { classe: "estalo", role: "timer" });
    const resultado = Dom.criar("div", { classe: "resultado", hidden: true });
    const segurar = Dom.criar("button", { type: "button", classe: "px-botao grande", texto: "Segure para despejar" });

    let nivel = 0.12, copo = 0, despejando = false, ultimo = null, id = 0, acabou = false;
    const r = { naBanda: 0, abaixo: 0, acima: 0, transbordou: 0, total: 0 };

    function passo(agora) {
      if (ultimo === null) ultimo = agora;
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      nivel += ((despejando ? 0.34 : 0) - 0.12) * dt;   // enche mais rápido do que escoa
      if (nivel >= 1) { nivel = 1; r.transbordou += dt; }
      nivel = Math.max(0, nivel);
      copo = Math.min(1, copo + nivel * 0.14 * dt);
      r.total += dt;
      if (nivel < BANDA[0]) r.abaixo += dt; else if (nivel > BANDA[1]) r.acima += dt; else r.naBanda += dt;

      Pixel.coagem(ctx, { nivel, despejando, copo, quadro: Math.floor(agora / 130), banda: BANDA });
      preenchimento.style.width = nivel * 100 + "%";
      tempo.textContent = "Faltam " + Math.max(0, Math.ceil(DURACAO - r.total)) + " s";
      if (r.total >= DURACAO) terminar(); else id = requestAnimationFrame(passo);
    }

    function terminar() {
      if (acabou) return;
      acabou = true;
      despejando = false;
      cancelAnimationFrame(id);
      removerTeclas();
      estado.coado = M.avaliarCoagem(r);
      const q = M.qualidadeCoagem[estado.coado.id];
      segurar.hidden = true;
      tempo.textContent = "";
      resultado.hidden = false;
      resultado.replaceChildren(Dom.criar("strong", { texto: q.titulo }), Dom.criar("p", { texto: q.texto }),
        acoes(botao("Tentar de novo", () => ir("coar"), true), botao("Continuar", () => ir("base"))));
    }

    const ligar = (e) => { if (e.pointerId !== undefined) segurar.setPointerCapture(e.pointerId); despejando = true; };
    const desligar = () => { despejando = false; };
    const teclaBaixo = (e) => { if (e.key === " ") { e.preventDefault(); despejando = true; } };
    const teclaCima = (e) => { if (e.key === " ") despejando = false; };
    function removerTeclas() {
      document.removeEventListener("keydown", teclaBaixo);
      document.removeEventListener("keyup", teclaCima);
    }

    segurar.addEventListener("pointerdown", ligar);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach((nome) => segurar.addEventListener(nome, desligar));
    document.addEventListener("keydown", teclaBaixo);
    document.addEventListener("keyup", teclaCima);
    id = requestAnimationFrame(passo);
    parar = () => { cancelAnimationFrame(id); removerTeclas(); };

    return tela("Coe o café", "Segure o botão (ou a barra de espaço) para despejar a água. Mantenha o nível dentro da faixa verde até o tempo acabar: se passar, a água transborda; se faltar, o café fica fraco.",
      Dom.criar("div", { classe: "jogo-linha" }, canvas, Dom.criar("div", { classe: "jogo-info" }, tempo, segurar)),
      medidor, resultado, acoes(botao("Voltar", () => ir("torrar"), true)));
  };

  // ---------- xícara pronta ----------
  TELAS.pronto = function () {
    const cafe = cafeAtual();
    const d = M.descrever(estado, cafe);
    const xicara = ampliar(Pixel.xicara(opcoesDaXicara(estado)), 7);
    const barras = M.eixos.map(([chave, nome]) => Dom.criar("li", {},
      Dom.criar("span", { classe: "rotulo", texto: nome }),
      Dom.criar("span", { role: "img", "aria-label": d.perfil[chave] + " de 5" }, [0, 1, 2, 3, 4].map((i) => Dom.criar("span", { classe: "quadrado" + (i < d.perfil[chave] ? " on" : "") })))));
    const aviso = Dom.criar("p", { classe: "tela-lead", role: "alert" });
    const guardar = Dom.criar("button", { type: "button", classe: "px-botao", texto: estado.salvoId ? "Já está na vitrine" : "Salvar preparo", disabled: estado.salvoId ? true : null });
    guardar.addEventListener("click", async () => {
      if (!window.DarkRoast.exigirLogin("Entre na sua conta para guardar o preparo.")) return;
      guardar.disabled = true;
      aviso.textContent = "";
      try {
        estado.salvoId = (await Preparos.salvar(estado)).id;
        guardar.textContent = "Já está na vitrine";
        window.DarkRoast.aviso("Preparo guardado na vitrine.");
      } catch (erro) {
        guardar.disabled = false;
        aviso.textContent = erro.message;
      }
    });
    return tela(d.titulo, d.subtitulo,
      Dom.criar("div", { classe: "final" },
        xicara,
        Dom.criar("div", { classe: "final-texto" }, d.paragrafos.map((t) => Dom.criar("p", { texto: t })), Dom.criar("ul", { classe: "perfil" }, barras))),
      aviso,
      acoes(
        guardar,
        botao("Montar outro café", () => { reiniciar(); ir("cafe"); }, true),
        botao("Mudar os complementos", () => ir("extras"), true),
        botao("Vitrine", () => ir("vitrine"), true),
        Dom.criar("a", { classe: "px-botao claro", href: "../bases/loja.html?c=" + cafe.id, texto: "Ver o preço desse café" })));
  };

  // ---------- vitrine (dados vindos do PHP/SQL por AJAX) ----------
  const estadoDe = (p) => ({ cafeId: p.cafeId, torra: p.torra, torrado: { id: p.torrado }, coado: { id: p.coado }, base: p.base, extras: p.extras, salvoId: p.id });

  function dataBonita(texto) {
    const data = new Date(texto.replace(" ", "T") + "Z"); // o banco guarda em UTC
    return isNaN(data) ? "" : "Guardado em " + data.toLocaleDateString("pt-BR");
  }

  function cartaoDaVitrine(p, aviso) {
    const est = estadoDe(p);
    const d = M.descrever(est, window.CAFES.find((c) => c.id === p.cafeId));
    return Dom.criar("article", { classe: "vitrine-item" },
      ampliar(Pixel.xicara(opcoesDaXicara(est)), 3),
      Dom.criar("h2", { texto: d.titulo }),
      Dom.criar("p", { classe: "vitrine-sub", texto: d.subtitulo }),
      Dom.criar("small", { texto: dataBonita(p.criadoEm) }),
      acoes(
        botao("Ver detalhes", () => { estado = est; ir("pronto"); }),
        botao("Excluir", async () => {
          if (!window.confirm("Tirar este preparo da vitrine?")) return;
          try { await Preparos.excluir(p.id); ir("vitrine"); } catch (erro) { aviso.textContent = erro.message; }
        }, true)));
  }

  TELAS.vitrine = function () {
    const aviso = Dom.criar("p", { classe: "tela-lead", role: "status" });
    const lista = Dom.criar("div", { classe: "vitrine" });
    const conteudo = tela("Vitrine", "Os preparos que você guardou na sua conta.", aviso, lista,
      acoes(botao("Montar um café", () => { reiniciar(); ir("cafe"); })));

    if (!Contas.usuarioAtual()) {
      aviso.textContent = "Entre na sua conta para ver a sua vitrine.";
      lista.append(botao("Entrar", () => window.DarkRoast.abrirLogin("Entre para ver a sua vitrine.")));
      return conteudo;
    }
    aviso.textContent = "Carregando...";
    Preparos.listar().then((preparos) => {
      if (!palco.contains(conteudo)) return; // a pessoa já trocou de tela
      aviso.textContent = preparos.length ? "" : "A vitrine está vazia. Monte um café e use Salvar preparo.";
      lista.replaceChildren(...preparos.map((p) => cartaoDaVitrine(p, aviso)));
    }).catch((erro) => { aviso.textContent = erro.message; });
    return conteudo;
  };

  document.getElementById("botao-vitrine").addEventListener("click", () => ir("vitrine"));
  document.addEventListener("conta:mudou", () => { if (atual === "vitrine") ir("vitrine"); });
  document.body.style.setProperty("--cena", "url(" + Pixel.cena().toDataURL() + ")");
  reiniciar();
  ir("cafe");
})();
