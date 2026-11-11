// Minijogo da página de colheita: arraste só as cerejas maduras para o cesto.
// Tocar ou apertar Enter numa cereja também a coloca no cesto, para quem não usa mouse.
(function () {
  "use strict";
  const parametros = new URLSearchParams(location.search);
  const principal = document.getElementById("conteudo");
  if (parametros.get("e") !== "colheita" || !principal || !principal.querySelector(".cafe-corpo")) return;

  const TOTAL = 14;
  const VERDE = "#7a9a4f";
  const MOVIMENTO_MINIMO = 6; // abaixo disso o gesto conta como toque, não como arrasto
  const rnd = (a, b) => a + Math.random() * (b - a);

  let nMaduras, certas, erradas, acabou;

  const placar = Dom.criar("p", { classe: "jogo-placar", role: "status" });
  const recado = Dom.criar("p", { classe: "jogo-recado", role: "status" });
  const ramo = Dom.criar("div", { classe: "jogo-ramo" });
  const contagem = Dom.criar("span", { classe: "jogo-cesto-n" });
  const cesto = Dom.criar("div", { classe: "jogo-cesto", "aria-label": "Cesto" },
    Dom.svg("svg", { viewBox: "0 0 64 64", "aria-hidden": "true" }, Dom.svg("use", { href: "#cesto" })), contagem);
  const recomecar = Dom.criar("button", { type: "button", classe: "extra-botao claro", texto: "Jogar de novo", onclick: novaRodada });

  // entra na mesma coluna das outras seções extras
  (principal.querySelector(".extras") || principal).append(Dom.criar("section", { classe: "extra jogo" },
    Dom.criar("h2", { texto: "Jogo: colha só as maduras" }),
    Dom.criar("p", { classe: "extra-lead", texto: "Arraste as cerejas vermelhas para o cesto e deixe as verdes no pé. Se preferir, toque na cereja." }),
    ramo, cesto, placar, recado, recomecar));

  function dentroDoCesto(x, y) {
    const r = cesto.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function colher(botao, madura) {
    if (acabou) return;
    botao.remove();
    if (madura) certas++;
    else {
      erradas++;
      recado.textContent = "Essa estava verde. Na xícara ela daria um gosto áspero, de erva.";
    }
    atualizar();
    if (certas === nMaduras) terminar();
  }

  function atualizar() {
    contagem.textContent = String(certas + erradas);
    placar.textContent = "Maduras: " + certas + " de " + nMaduras + " · Verdes colhidas por engano: " + erradas;
  }

  function terminar() {
    acabou = true;
    recado.textContent = erradas === 0
      ? "Colheita perfeita: só maduras. É esse cuidado que a colheita à mão pede."
      : "Todas as maduras colhidas, mas " + erradas + (erradas === 1 ? " verde veio junto." : " verdes vieram juntas.") + " Num lote de verdade isso baixa a qualidade.";
    guardarResultado();
  }

  // quem está logado guarda quantas rodadas fez e quantas foram perfeitas
  function guardarResultado() {
    const usuario = Contas.usuarioAtual();
    if (!usuario) { recado.textContent += " Entre na sua conta para guardar suas rodadas."; return; }
    const tabela = Banco.tabela("jogo_colheita");
    const meu = tabela.achar((l) => l.usuario === usuario.chave) || tabela.inserir({ usuario: usuario.chave, rodadas: 0, perfeitas: 0 });
    const salvo = tabela.atualizar(meu.id, { rodadas: meu.rodadas + 1, perfeitas: meu.perfeitas + (erradas === 0 ? 1 : 0) });
    if (salvo) recado.textContent += " Rodadas: " + salvo.rodadas + ", perfeitas: " + salvo.perfeitas + ".";
  }

  function ligarArrasto(botao, madura) {
    let toque = null;
    const soltar = () => { toque = null; botao.classList.remove("pegando"); botao.style.translate = ""; cesto.classList.remove("alvo"); };

    botao.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || acabou) return;
      toque = { x: e.clientX, y: e.clientY, moveu: false };
      botao.setPointerCapture(e.pointerId);
      botao.classList.add("pegando");
    });
    botao.addEventListener("pointermove", (e) => {
      if (!toque) return;
      const dx = e.clientX - toque.x, dy = e.clientY - toque.y;
      if (Math.hypot(dx, dy) > MOVIMENTO_MINIMO) toque.moveu = true;
      botao.style.translate = dx + "px " + dy + "px";
      cesto.classList.toggle("alvo", dentroDoCesto(e.clientX, e.clientY));
    });
    botao.addEventListener("pointerup", (e) => {
      if (!toque) return;
      const valeu = !toque.moveu || dentroDoCesto(e.clientX, e.clientY);
      soltar();
      if (valeu) colher(botao, madura);
    });
    botao.addEventListener("pointercancel", soltar);
    // detail 0 = clique vindo do teclado (Enter ou espaço)
    botao.addEventListener("click", (e) => { if (e.detail === 0) colher(botao, madura); });
  }

  function novaRodada() {
    nMaduras = 6 + Math.floor(Math.random() * 3);
    certas = erradas = 0;
    acabou = false;
    recado.textContent = "";
    const sorteio = Array.from({ length: TOTAL }, (_, i) => i < nMaduras).sort(() => Math.random() - 0.5);
    ramo.replaceChildren(...sorteio.map((madura) => {
      const botao = Dom.criar("button", { type: "button", classe: "jogo-cereja", "aria-label": madura ? "Cereja madura" : "Cereja verde",
        style: "transform:rotate(" + Math.round(rnd(-14, 14)) + "deg);margin-top:" + Math.round(rnd(0, 26)) + "px" },
        Dom.svg("svg", { viewBox: "0 0 64 64", "aria-hidden": "true", style: madura ? null : "--shu:" + VERDE }, Dom.svg("use", { href: "#cereja" })));
      ligarArrasto(botao, madura);
      return botao;
    }));
    atualizar();
  }

  novaRodada();
})();
