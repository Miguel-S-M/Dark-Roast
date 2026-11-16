// Easter eggs da torra
//  1) digite "carvao": um saco de carvão cai na forja; arraste até a fornalha e o fogo cresce
//  2) clique na bigorna (ou digite "forja"): minigame de forja
// As sequências de teclas usam a biblioteca cheet.js (carregada no torra.html).
(function () {
  "use strict";
  const forja = document.querySelector(".forja");
  const fornalha = document.querySelector(".fornalha");
  const boca = document.querySelector(".boca");
  const bigorna = document.querySelector(".bigorna");
  if (!forja || !fornalha || !boca) return;

  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const NIVEL_MAX = 3, DURACAO_NIVEL = 16000;

  // ---------- aviso rápido (no lugar do alert) ----------
  const aviso = document.createElement("p");
  aviso.className = "ee-aviso";
  aviso.setAttribute("role", "status");
  forja.appendChild(aviso);
  let tAviso;
  function dizer(texto, ms) {
    aviso.textContent = texto;
    aviso.classList.add("visivel");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => aviso.classList.remove("visivel"), ms || 3600);
  }

  // ---------- fogo: níveis 0 a 3 ----------
  const labareda = document.createElement("span");
  labareda.className = "labareda";
  labareda.setAttribute("aria-hidden", "true");
  labareda.innerHTML = "<i></i><i></i><i></i>";
  fornalha.appendChild(labareda);

  let nivel = 0, tNivel, tFaiscas;

  function faisca(sx, sy, alcance) {
    const f = document.createElement("i");
    f.className = "faisca";
    f.style.left = sx + "px";
    f.style.top = sy + "px";
    forja.appendChild(f);
    f.animate([
      { transform: "translate(-50%,-50%) scale(1)", opacity: 0 },
      { opacity: 1, offset: 0.12 },
      { transform: `translate(${rnd(-90, 90)}px,${-rnd(alcance * 0.5, alcance)}px) scale(0.2)`, opacity: 0 },
    ], { duration: rnd(900, 1700), easing: "ease-out", fill: "both" }).onfinish = () => f.remove();
  }
  function posBoca() {
    const fr = forja.getBoundingClientRect(), br = boca.getBoundingClientRect();
    return { x: br.left - fr.left + br.width / 2, y: br.top - fr.top + br.height * 0.4, topo: br.top - fr.top, larg: br.width };
  }
  function chuva(qtd, alcance) {
    if (reduz) return;
    const p = posBoca();
    for (let i = 0; i < qtd; i++) faisca(p.x + rnd(-p.larg * 0.3, p.larg * 0.3), p.y, alcance);
  }

  function definirNivel(n) {
    nivel = Math.max(0, Math.min(NIVEL_MAX, n));
    for (let i = 1; i <= NIVEL_MAX; i++) forja.classList.toggle("nivel-" + i, nivel === i);
    clearInterval(tFaiscas);
    if (nivel > 0 && !reduz) tFaiscas = setInterval(() => chuva(nivel * 2, 140 + nivel * 90), 450);
    clearTimeout(tNivel);
    if (nivel > 0) tNivel = setTimeout(() => {
      definirNivel(nivel - 1);
      if (nivel === 0) dizer("O carvão virou cinza. O fogo voltou ao normal.");
    }, DURACAO_NIVEL);
  }

  // ---------- easter egg 1: saco de carvão ----------
  const SACO = '<svg viewBox="0 0 100 120" aria-hidden="true">' +
    '<path d="M18 44 Q4 74 14 106 Q50 118 86 106 Q96 74 82 44 Z" fill="#1d1612" stroke="#41342b" stroke-width="2"/>' +
    '<path d="M32 44 L27 24 Q50 12 73 24 L68 44 Z" fill="#17110e" stroke="#41342b" stroke-width="2"/>' +
    '<path d="M36 26 L42 17 L50 22 L58 16 L65 25 Z" fill="#2b221c"/>' +
    '<rect x="28" y="38" width="44" height="6" rx="3" fill="#9a7a45"/>' +
    '<rect x="33" y="62" width="34" height="36" rx="2" fill="#efe3cc"/>' +
    '<text x="50" y="91" text-anchor="middle" font-size="30" font-family="Shippori Mincho, serif" fill="#b2312a" lang="ja">炭</text></svg>';
  let saco = null, tNovoSaco;

  function repouso(W, H) {
    const lf = fornalha.getBoundingClientRect(), fr = forja.getBoundingClientRect();
    const larg = Math.min(104, Math.max(72, W * 0.08));
    let x = lf.right - fr.left + 34;
    if (x + larg > W - 8) x = W - larg - 8;
    return { x, y: W >= 760 ? H * 0.7 : H * 0.58 };
  }

  function criarSaco() {
    if (saco) return;
    const fr = forja.getBoundingClientRect(), W = fr.width, H = fr.height;
    const rest = repouso(W, H);
    const el = document.createElement("div");
    el.className = "ee-saco";
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.setAttribute("aria-label", "Saco de carvão. Arraste até a fornalha, ou aperte Enter para jogar no fogo");
    el.innerHTML = SACO;
    el.style.left = rest.x + "px";
    el.style.top = rest.y + "px";
    forja.appendChild(el);
    saco = el;
    if (!reduz) {
      el.animate([
        { transform: `translateY(${-(rest.y + 160)}px) rotate(-14deg)`, easing: "cubic-bezier(.5,0,.9,.5)" },
        { transform: "translateY(0) rotate(4deg)", offset: 0.55, easing: "ease-out" },
        { transform: "translateY(-26px) rotate(-3deg)", offset: 0.72, easing: "ease-in" },
        { transform: "translateY(0) rotate(0deg)", offset: 0.86, easing: "ease-out" },
        { transform: "translateY(-7px)", offset: 0.93, easing: "ease-in" },
        { transform: "translateY(0)" },
      ], { duration: 1100 });
    }
    ligarArraste(el);
  }

  function ligarArraste(el) {
    let ox = 0, oy = 0, movendo = false;
    const sobreFogo = () => {
      const r = el.getBoundingClientRect(), b = boca.getBoundingClientRect(), m = 44;
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      return cx > b.left - m && cx < b.right + m && cy > b.top - m * 2 && cy < b.bottom + m;
    };
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || movendo) return;
      e.preventDefault();
      const r = el.getBoundingClientRect(), fr = forja.getBoundingClientRect();
      ox = e.clientX - r.left; oy = e.clientY - r.top;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.left = r.left - fr.left + "px";
      el.style.top = r.top - fr.top + "px";
      el.setPointerCapture(e.pointerId);
      el.classList.add("arrastando");
      movendo = true;
      dizer("Leve o saco até a boca da fornalha.");
    });
    el.addEventListener("pointermove", (e) => {
      if (!movendo) return;
      const fr = forja.getBoundingClientRect();
      el.style.left = e.clientX - fr.left - ox + "px";
      el.style.top = e.clientY - fr.top - oy + "px";
      fornalha.classList.toggle("ee-alvo", sobreFogo());
    });
    const soltar = (e) => {
      if (!movendo) return;
      movendo = false;
      el.classList.remove("arrastando");
      fornalha.classList.remove("ee-alvo");
      if (e && e.type === "pointercancel") return;
      if (sobreFogo()) { despejar(el); return; }
      // largado fora do fogo: cai no chão
      const fr = forja.getBoundingClientRect(), H = fr.height;
      const topo = parseFloat(el.style.top), chao = Math.min(Math.max(topo, H * 0.6), H * 0.8);
      if (!reduz && chao > topo) el.animate([{ transform: "translateY(0)", easing: "ease-in" }, { transform: `translateY(${chao - topo}px)` }], { duration: 380, fill: "forwards" })
        .onfinish = (ev) => { el.style.top = chao + "px"; ev.target.cancel(); };
      else el.style.top = chao + "px";
    };
    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); despejar(el); }
    });
  }

  function despejar(el) {
    if (el !== saco) return;
    saco = null;
    el.style.pointerEvents = "none";
    el.getAnimations().forEach((a) => a.cancel());
    const fr = forja.getBoundingClientRect(), p = posBoca();
    const r = el.getBoundingClientRect();
    const curL = r.left - fr.left, curT = r.top - fr.top;
    const dx = p.x - r.width * 0.6 - curL, dy = p.topo - r.height * 0.55 - curT;
    const fim = () => {
      for (let i = 0; i < 12; i++) {
        const c = document.createElement("i");
        c.className = "ee-carvao";
        c.style.left = p.x + rnd(-p.larg * 0.28, p.larg * 0.28) + "px";
        c.style.top = p.topo + "px";
        forja.appendChild(c);
        c.animate([{ transform: "translateY(0) rotate(0)", opacity: 1 }, { transform: `translateY(${rnd(40, 80)}px) rotate(${rnd(-200, 200)}deg)`, opacity: 0 }],
          { duration: rnd(450, 800), delay: i * 40, easing: "ease-in", fill: "both" }).onfinish = () => c.remove();
      }
      el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 400, fill: "forwards" }).onfinish = () => el.remove();
      const antes = nivel;
      definirNivel(nivel + 1);
      chuva(40, 320);
      if (antes >= NIVEL_MAX) { dizer("A fornalha já está no máximo. O carvão só alimenta a brasa."); clearTimeout(tNivel); tNivel = setTimeout(() => { definirNivel(nivel - 1); }, DURACAO_NIVEL); }
      else dizer(["", "O fogo cresceu.", "Labaredas! Agora sim está quente.", "Fogo no máximo. O metal vai ficar bem mole!"][nivel]);
      clearTimeout(tNovoSaco);
      tNovoSaco = setTimeout(criarSaco, 2600);
    };
    if (reduz) { fim(); return; }
    el.animate([
      { transform: "translate(0,0) rotate(0deg)" },
      { transform: `translate(${dx}px,${dy}px) rotate(0deg)`, offset: 0.55 },
      { transform: `translate(${dx}px,${dy}px) rotate(-105deg)` },
    ], { duration: 750, easing: "ease-in-out", fill: "forwards" }).onfinish = fim;
  }

  function aoDigitarCarvao() {
    if (saco) {
      saco.animate([{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(1)" }], { duration: 450 });
      dizer("O saco de carvão já está na forja.");
      return;
    }
    clearTimeout(tNovoSaco);
    criarSaco();
    dizer("Um saco de carvão caiu na forja. Arraste até a fornalha.");
  }

  // ---------- easter egg 2: minigame de forja ----------
  const GOLPES = 6;
  let jogo = null;

  const BIGORNA_SVG = '<svg class="ee-f-bigorna" viewBox="0 0 160 90" aria-hidden="true"><defs><linearGradient id="ee-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3d35"/><stop offset="1" stop-color="#130e0b"/></linearGradient></defs>' +
    '<path d="M10 18 H128 L152 14 Q158 22 148 30 L130 32 Q116 36 112 48 V56 H128 V74 H34 V56 H50 V48 Q50 36 34 32 H12 Q4 28 10 18Z" fill="url(#ee-bg)"/><path d="M12 19 H128" stroke="#7a6a5e" stroke-width="1.5" fill="none"/></svg>';
  const MARTELO_SVG = '<svg class="ee-f-martelo" viewBox="0 0 110 60" aria-hidden="true"><rect x="6" y="44" width="84" height="9" rx="3" fill="#8a6a3c"/><rect x="80" y="14" width="26" height="44" rx="3" fill="#8d857d" stroke="#2a2420" stroke-width="2"/><rect x="80" y="14" width="26" height="9" rx="3" fill="#b9b1a8"/></svg>';
  const COLHER = (cor, torta) => '<svg viewBox="0 0 150 90" aria-hidden="true"><g transform="' + (torta ? "rotate(-9 75 45)" : "") + '">' +
    '<path d="M4 44 Q4 40 10 40 L80 40 Q84 40 88 36 Q108 14 134 30 Q150 44 134 60 Q108 76 88 52 Q84 48 80 48 L10 48 Q4 48 4 44Z" fill="' + cor + '" stroke="#17110e" stroke-width="2.5"/>' +
    '<path d="M10 43 H78" stroke="rgba(255,255,255,0.45)" stroke-width="2" stroke-linecap="round"/></g></svg>';
  const RANKS = [
    { min: 0.75, nome: "Mestre ferreiro", texto: "Uma colher medidora de aço azulado, perfeita para o café.", cor: "#9fb7d6", torta: false },
    { min: 0.45, nome: "Ferreiro", texto: "Uma colher de ferro bem batido. Mede o café sem reclamar.", cor: "#a39a90", torta: false },
    { min: 0, nome: "Aprendiz", texto: "Uma colher meio torta, mas ainda serve para o café.", cor: "#74685d", torta: true },
  ];

  function abrirForja() {
    if (jogo) return;
    const antes = document.activeElement;
    const el = document.createElement("div");
    el.className = "ee-forja";
    el.innerHTML =
      '<div class="ee-forja-caixa" role="dialog" aria-modal="true" aria-labelledby="ee-f-titulo">' +
      '<button type="button" class="ee-x" aria-label="Fechar a forja">×</button>' +
      '<h2 id="ee-f-titulo"><span lang="ja">鍛冶</span>Forja</h2>' +
      '<p class="ee-f-info">Clique em <b>Martelar</b> (ou aperte espaço) quando a barra branca estiver na zona laranja. O metal esfria: reaqueça quando a cor apagar. Quanto maior o fogo da fornalha, maior a zona.</p>' +
      '<div class="ee-f-palco"><div class="ee-f-msg" role="status"></div>' + BIGORNA_SVG + '<div class="ee-f-peca"></div>' + MARTELO_SVG + '</div>' +
      '<div class="ee-f-medidor" aria-hidden="true"><div class="ee-f-zona"></div><div class="ee-f-cursor"></div></div>' +
      '<div class="ee-f-linha"><span>Golpes <b class="ee-f-n">0</b>/' + GOLPES + '</span><div class="ee-f-calor"><span>Calor</span><div><i></i></div></div></div>' +
      '<div class="ee-f-botoes"><button type="button" class="principal ee-f-bater">Martelar (espaço)</button><button type="button" class="ee-f-esquentar">Reaquecer (R)</button></div>' +
      '<div class="ee-f-resultado" hidden></div></div>';
    document.body.appendChild(el);

    const q = (s) => el.querySelector(s);
    const caixa = q(".ee-forja-caixa"), peca = q(".ee-f-peca"), martelo = q(".ee-f-martelo"), msg = q(".ee-f-msg");
    const medidor = q(".ee-f-medidor"), zona = q(".ee-f-zona"), cursor = q(".ee-f-cursor"), palco = q(".ee-f-palco");
    const btBater = q(".ee-f-bater"), btEsq = q(".ee-f-esquentar"), res = q(".ee-f-resultado"), contador = q(".ee-f-n");

    const s = { golpes: 0, pontos: 0, calor: 1, pos: 0, dir: 1, centro: 0.5, meia: 0.1, parado: false, fim: false, forma: 0, ultimo: performance.now(), raf: 0 };
    jogo = { el, antes, fechar };

    function sorteiaZona() {
      s.meia = 0.055 + 0.055 * s.calor + 0.018 * nivel;
      s.centro = rnd(0.2 + s.meia, 0.8 - s.meia);
      zona.style.left = (s.centro - s.meia) * 100 + "%";
      zona.style.width = s.meia * 200 + "%";
    }
    function mostrarCalor() { caixa.style.setProperty("--calor", s.calor.toFixed(3)); peca.style.setProperty("--calor", s.calor.toFixed(3)); }
    function falar(t) { msg.textContent = t; }

    function som(qual) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        som.ctx = som.ctx || new AC();
        const c = som.ctx, t = c.currentTime;
        [[qual > 0 ? 620 + qual * 380 : 180, "triangle", 0.28], [qual > 0 ? 1900 + qual * 700 : 300, "square", 0.06]].forEach(([f, tipo, v]) => {
          const o = c.createOscillator(), g = c.createGain();
          o.type = tipo; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.35);
          g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          o.connect(g).connect(c.destination); o.start(t); o.stop(t + 0.42);
        });
      } catch (err) { /* sem áudio, segue sem som */ }
    }

    function faiscasDoGolpe(qual) {
      if (reduz) return;
      const pr = peca.getBoundingClientRect(), pa = palco.getBoundingClientRect();
      const cx = pr.left - pa.left + pr.width / 2, cy = pr.top - pa.top + 4;
      for (let i = 0; i < 8 + Math.round(qual * 14); i++) {
        const f = document.createElement("i");
        f.className = "ee-f-faisca";
        f.style.left = cx + "px"; f.style.top = cy + "px";
        palco.appendChild(f);
        f.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${rnd(-110, 110)}px,${-rnd(20, 90)}px)`, opacity: 0 }],
          { duration: rnd(450, 900), easing: "ease-out", fill: "both" }).onfinish = () => f.remove();
      }
    }

    function bater() {
      if (s.fim || s.parado) return;
      const d = Math.abs(s.pos - s.centro);
      const qual = d <= s.meia ? 1 - d / s.meia : 0;
      s.golpes++; s.pontos += qual;
      contador.textContent = s.golpes;
      if (qual > 0) s.forma = Math.min(1, s.forma + 1 / GOLPES);
      peca.style.setProperty("--sx", (1 + 0.55 * s.forma).toFixed(3));
      peca.style.setProperty("--sy", (1 - 0.5 * s.forma).toFixed(3));
      s.calor = Math.max(0, s.calor - 0.08); mostrarCalor();
      falar(qual > 0.8 ? "Golpe perfeito!" : qual > 0.4 ? "Bom golpe." : qual > 0 ? "Pegou de raspão." : "Errou o ponto!");
      som(qual); faiscasDoGolpe(qual);
      if (!reduz) {
        martelo.animate([{ transform: "translateX(-86%) rotate(-58deg)" }, { transform: "translateX(-86%) rotate(4deg)", offset: 0.35 }, { transform: "translateX(-86%) rotate(-58deg)" }], { duration: 420, easing: "ease-in-out" });
        palco.animate([{ transform: "translate(0,0)" }, { transform: `translate(${rnd(-3, 3)}px,${qual > 0 ? 3 : 1}px)`, offset: 0.4 }, { transform: "translate(0,0)" }], { duration: 200, delay: 130 });
      }
      if (s.golpes >= GOLPES) terminar(); else sorteiaZona();
    }

    function esquentar() {
      if (s.fim || s.parado) return;
      s.parado = true; medidor.classList.add("parado"); btBater.disabled = true; btEsq.disabled = true;
      falar("Voltando ao fogo…");
      const volta = () => { s.calor = 1; mostrarCalor(); s.parado = false; medidor.classList.remove("parado"); btBater.disabled = false; btEsq.disabled = false; falar("Metal em brasa!"); sorteiaZona(); s.ultimo = performance.now(); };
      setTimeout(volta, reduz ? 100 : 1100);
    }

    function terminar() {
      s.fim = true; cancelAnimationFrame(s.raf);
      btBater.disabled = true; btEsq.disabled = true;
      const media = s.pontos / GOLPES, rk = RANKS.find((r) => media >= r.min);
      res.hidden = false;
      res.innerHTML = COLHER(rk.cor, rk.torta) + "<h3>" + rk.nome + "</h3><p>" + rk.texto + " Pontos: " + Math.round(media * 100) + "%.</p>" +
        '<div class="linha"><button type="button" class="principal ee-f-de-novo">Forjar de novo</button><button type="button" class="ee-f-sair">Fechar</button></div>';
      res.querySelector(".ee-f-de-novo").addEventListener("click", recomecar);
      res.querySelector(".ee-f-sair").addEventListener("click", fechar);
      res.querySelector(".ee-f-de-novo").focus();
      falar("Forjado!");
    }
    function recomecar() {
      Object.assign(s, { golpes: 0, pontos: 0, calor: 1, pos: 0, dir: 1, parado: false, fim: false, forma: 0, ultimo: performance.now() });
      contador.textContent = "0"; res.hidden = true; res.innerHTML = "";
      peca.style.setProperty("--sx", 1); peca.style.setProperty("--sy", 1);
      btBater.disabled = false; btEsq.disabled = false; medidor.classList.remove("parado");
      mostrarCalor(); sorteiaZona(); falar(""); btBater.focus(); s.raf = requestAnimationFrame(passo);
    }

    function passo(t) {
      const dt = Math.min(0.05, (t - s.ultimo) / 1000); s.ultimo = t;
      if (!s.parado) {
        const vel = 0.6 + 0.13 * s.golpes;
        s.pos += s.dir * vel * dt;
        if (s.pos >= 1) { s.pos = 1; s.dir = -1; } else if (s.pos <= 0) { s.pos = 0; s.dir = 1; }
        s.calor = Math.max(0, s.calor - 0.04 * dt); mostrarCalor();
      }
      cursor.style.left = s.pos * 100 + "%";
      if (!s.fim) s.raf = requestAnimationFrame(passo);
    }

    function teclas(e) {
      if (e.key === "Escape") { e.preventDefault(); fechar(); return; }
      if (e.key === "Tab") { // mantém o foco dentro da janela
        const foco = Array.from(el.querySelectorAll("button:not(:disabled)")).filter((b) => !b.closest("[hidden]"));
        if (!foco.length) return;
        const i = foco.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); foco[foco.length - 1].focus(); }
        else if (!e.shiftKey && i === foco.length - 1) { e.preventDefault(); foco[0].focus(); }
        return;
      }
      if (e.key === " " && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); bater(); }
      else if (e.key === "r" || e.key === "R") esquentar();
    }
    function fechar() {
      cancelAnimationFrame(s.raf);
      document.removeEventListener("keydown", teclas, true);
      el.remove(); jogo = null;
      if (antes && antes.focus) antes.focus();
    }

    btBater.addEventListener("click", bater);
    btEsq.addEventListener("click", esquentar);
    q(".ee-x").addEventListener("click", fechar);
    el.addEventListener("pointerdown", (e) => { if (e.target === el) fechar(); });
    document.addEventListener("keydown", teclas, true);
    mostrarCalor(); sorteiaZona(); btBater.focus();
    s.raf = requestAnimationFrame(passo);
  }

  if (bigorna) {
    bigorna.removeAttribute("aria-hidden");
    bigorna.setAttribute("role", "button");
    bigorna.setAttribute("tabindex", "0");
    bigorna.setAttribute("aria-label", "Bigorna. Clique para forjar");
    bigorna.addEventListener("click", abrirForja);
    bigorna.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirForja(); } });
  }

  // ---------- gatilhos de teclado (cheet.js) ----------
  function sequencia(teclas, acao) {
    if (typeof window.cheet === "function") { window.cheet(teclas, acao); return; }
    // plano B, caso a biblioteca não carregue (sem internet, por exemplo)
    const alvo = teclas.split(" "); let i = 0;
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      i = e.key.toLowerCase() === alvo[i] ? i + 1 : (e.key.toLowerCase() === alvo[0] ? 1 : 0);
      if (i === alvo.length) { i = 0; acao(); }
    });
  }
  sequencia("c a r v a o", aoDigitarCarvao);
  sequencia("f o r j a", abrirForja);
})();
