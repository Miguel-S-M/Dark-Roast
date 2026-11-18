// Easter egg da colheita: digite "teia" (cheet.js) e o armazém se enche de teias de aranha.
// Arraste o espanador (ou use as setas, com o espanador focado) por cima das teias para limpar.
(function () {
  "use strict";
  const armazem = document.querySelector(".armazem");
  if (!armazem) return;

  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const NS = "http://www.w3.org/2000/svg";

  // [x%, y%, canto, tamanho, aranha]  (x e y em % do armazém; canto = de onde a teia sai)
  const LUGARES = [
    [0, 0, "tl", 1.3, false], [100, 0, "tr", 1.35, true],
    [37.5, 3, "tr", 0.8, false], [62.5, 3, "tl", 0.85, true],
    [11.7, 23, "tl", 0.85, false], [88.3, 23, "tr", 0.85, false],
    [11.8, 55, "tl", 0.95, true], [88.2, 55, "tr", 0.95, false],
    [19, 33, "tl", 0.7, false], [51, 33, "tr", 0.66, false], [72, 33, "tl", 0.72, false],
    [0, 62, "tl", 1, true], [100, 62, "tr", 1, false], [41, 69, "tr", 0.62, false],
  ];

  let camada = null, teias = [], espanador = null, contador = null, ativo = false, tAviso;

  // ---------- aviso e contador ----------
  const aviso = document.createElement("p");
  aviso.className = "ee-aviso";
  aviso.setAttribute("role", "status");
  document.body.appendChild(aviso);
  function dizer(t, ms) {
    aviso.textContent = t;
    aviso.classList.add("visivel");
    clearTimeout(tAviso);
    tAviso = setTimeout(() => aviso.classList.remove("visivel"), ms || 3600);
  }
  function atualizarContador() {
    if (!contador) return;
    const n = teias.filter((t) => !t.limpa).length;
    contador.textContent = n + (n === 1 ? " teia restante" : " teias restantes");
  }

  // ---------- desenho da teia ----------
  function desenharTeia() {
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "fios");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("aria-hidden", "true");
    const raios = 5 + Math.floor(Math.random() * 3);
    const angulos = Array.from({ length: raios }, (_, i) => 4 + (82 * i) / (raios - 1) + rnd(-3, 3));
    const comp = angulos.map(() => rnd(86, 100));
    const ponto = (a, r) => [Math.cos((a * Math.PI) / 180) * r, Math.sin((a * Math.PI) / 180) * r];
    let d = "";
    angulos.forEach((a, i) => { const [x, y] = ponto(a, comp[i]); d += `M0 0 L${x.toFixed(1)} ${y.toFixed(1)} `; });
    const aneis = 5 + Math.floor(Math.random() * 2);
    let dAneis = "";
    for (let k = 1; k <= aneis; k++) {
      const f = k / aneis;
      for (let i = 0; i < raios - 1; i++) {
        const [x1, y1] = ponto(angulos[i], comp[i] * f), [x2, y2] = ponto(angulos[i + 1], comp[i + 1] * f);
        const [cx, cy] = ponto((angulos[i] + angulos[i + 1]) / 2, comp[i] * f * rnd(0.8, 0.9));
        dAneis += `M${x1.toFixed(1)} ${y1.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} `;
      }
    }
    // fios soltos pendurados
    let dSolto = "";
    for (let i = 0; i < 3; i++) { const [x, y] = ponto(rnd(10, 80), rnd(60, 100)); dSolto += `M${x.toFixed(1)} ${y.toFixed(1)} q${rnd(-6, 6).toFixed(1)} ${rnd(8, 16).toFixed(1)} ${rnd(-4, 4).toFixed(1)} ${rnd(16, 26).toFixed(1)} `; }
    [[d], [dAneis], [dSolto, "solto"]].forEach(([dd, cls]) => {
      const p = document.createElementNS(NS, "path");
      p.setAttribute("d", dd);
      if (cls) p.setAttribute("class", cls);
      svg.appendChild(p);
    });
    return svg;
  }
  const ARANHA = '<svg viewBox="0 0 22 22" aria-hidden="true"><g stroke="#0b0807" stroke-width="1.3" fill="none" stroke-linecap="round">' +
    '<path d="M11 12 L3 7 L1 11 M11 12 L2 13 L2 18 M11 12 L19 7 L21 11 M11 12 L20 13 L20 18 M11 11 L5 3 M11 11 L17 3"/></g>' +
    '<ellipse cx="11" cy="13" rx="5" ry="5.8" fill="#14100e" stroke="#3a2f28"/><circle cx="11" cy="8.2" r="3" fill="#1b1512"/>' +
    '<path d="M9 14 L11 11 L13 14 Z" fill="#b2312a"/></svg>';

  function criarTeias() {
    camada = document.createElement("div");
    camada.className = "ee-teias";
    camada.setAttribute("aria-hidden", "true");
    armazem.appendChild(camada);
    teias = LUGARES.map(([x, y, canto, f, temAranha], i) => {
      const el = document.createElement("div");
      el.className = "ee-teia" + (reduz ? "" : " crescendo");
      el.dataset.canto = canto;
      el.style.setProperty("--f", f);
      el.style.setProperty("--ox", canto === "tl" ? "0%" : "100%");
      el.style.setProperty("--atraso", (i * 0.09).toFixed(2) + "s");
      el.style.top = y + "%";
      el.style.left = canto === "tl" ? x + "%" : `calc(${x}% - var(--ee-t) * ${f})`;
      el.appendChild(desenharTeia());
      let aranha = null;
      if (temAranha) {
        aranha = document.createElement("div");
        aranha.className = "ee-aranha";
        aranha.style.setProperty("--ax", canto === "tl" ? "46%" : "54%");
        aranha.style.setProperty("--ay", rnd(28, 40).toFixed(0) + "%");
        aranha.innerHTML = '<i class="fio"></i>' + ARANHA;
        el.appendChild(aranha);
      }
      camada.appendChild(el);
      return { el, canto, aranha, sujeira: 1, limpa: false };
    });
    atualizarContador();
  }

  // ---------- poeira ----------
  function poeira(x, y, qtd) {
    if (reduz) return;
    for (let i = 0; i < qtd; i++) {
      const p = document.createElement("i");
      const s = rnd(8, 20);
      p.className = "ee-po";
      p.style.cssText = `left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px`;
      document.body.appendChild(p);
      p.animate([{ transform: "translate(0,0) scale(0.5)", opacity: 0.9 }, { transform: `translate(${rnd(-50, 50)}px,${rnd(10, 60)}px) scale(1.5)`, opacity: 0 }],
        { duration: rnd(600, 1100), easing: "ease-out", fill: "both" }).onfinish = () => p.remove();
    }
  }

  // ---------- limpar ----------
  function limparTeia(t) {
    t.limpa = true;
    const r = t.el.getBoundingClientRect();
    poeira(r.left + r.width * (t.canto === "tl" ? 0.4 : 0.6), r.top + r.height * 0.4, 9);
    if (t.aranha) {
      const a = t.aranha;
      a.getAnimations().forEach((an) => an.cancel());
      const topo = a.getBoundingClientRect().top - t.el.getBoundingClientRect().top;
      a.style.top = topo + "px";
      if (!reduz) a.animate([{ transform: "translateX(-50%) translateY(0)", opacity: 1 }, { transform: "translateX(-50%) translateY(520px)", opacity: 0 }], { duration: 750, easing: "cubic-bezier(.5,0,.9,.6)", fill: "forwards" });
      dizer("Uma aranha fugiu!", 2200);
    }
    const sair = () => t.el.remove();
    if (reduz) sair();
    else t.el.animate([{ opacity: 0.35, transform: "translateY(0) rotate(0deg)" }, { opacity: 0, transform: `translateY(${rnd(40, 90)}px) rotate(${rnd(-14, 14)}deg) scale(0.9)` }],
      { duration: 700, easing: "ease-in", fill: "forwards" }).onfinish = sair;
    atualizarContador();
    if (teias.every((x) => x.limpa)) terminar();
  }

  function varrer(x, y, dist) {
    let tocou = false;
    teias.forEach((t) => {
      if (t.limpa) return;
      const r = t.el.getBoundingClientRect(), s = r.width;
      if (s < 20) return; // ainda crescendo
      const cx = r.left + s * (t.canto === "tl" ? 0.4 : 0.6), cy = r.top + s * 0.4;
      if (Math.hypot(x - cx, y - cy) > s * 0.62 + 20) return;
      tocou = true;
      t.sujeira -= Math.max(dist, 6) / (s * 1.7);
      t.el.style.opacity = Math.max(0.12, t.sujeira).toFixed(2);
      if (t.sujeira <= 0) limparTeia(t);
    });
    if (tocou) poeira(x + rnd(-14, 14), y + rnd(-10, 10), 1);
  }

  function terminar() {
    dizer("Armazém limpo! Até a luz da janela entra melhor agora.", 5200);
    const janela = document.querySelector(".janela");
    if (janela) { janela.classList.remove("ee-limpa"); void janela.offsetWidth; janela.classList.add("ee-limpa"); }
    if (espanador && !reduz) espanador.animate([{ transform: "rotate(0)" }, { transform: "rotate(-18deg) scale(1.15)" }, { transform: "rotate(14deg) scale(1.1)" }, { transform: "rotate(0) scale(1)" }], { duration: 800 });
    for (let i = 0; i < 6; i++) setTimeout(() => poeira(innerWidth * rnd(0.2, 0.8), innerHeight * rnd(0.2, 0.7), 4), i * 120);
    setTimeout(() => {
      [contador, espanador, camada].forEach((e) => e && e.remove());
      contador = espanador = camada = null; teias = []; ativo = false;
    }, 3200);
  }

  // ---------- espanador ----------
  const ESPANADOR = '<svg viewBox="0 0 80 210" aria-hidden="true"><defs><linearGradient id="ee-mad" x1="0" x2="1"><stop offset="0" stop-color="#8a6a3c"/><stop offset="1" stop-color="#4a361d"/></linearGradient></defs>' +
    '<rect x="35" y="92" width="10" height="112" rx="5" fill="url(#ee-mad)"/><rect x="34" y="150" width="12" height="26" rx="2" fill="#b2312a"/>' +
    '<g transform="translate(40 88)">' +
    [-58, -40, -22, -8, 8, 22, 40, 58].map((a, i) => `<ellipse cx="0" cy="-38" rx="${i % 2 ? 11 : 13}" ry="44" transform="rotate(${a})" fill="${["#e9dcc4", "#cdbfa6", "#f4ead6", "#b9a98c"][i % 4]}" stroke="#6f6252" stroke-width="1"/>`).join("") +
    '</g><path d="M33 84 L47 84 L44 100 L36 100 Z" fill="#8d857d" stroke="#2a2420" stroke-width="1.5"/></svg>';

  function criarEspanador() {
    const el = document.createElement("div");
    el.className = "ee-espanador";
    el.setAttribute("role", "button");
    el.tabIndex = 0;
    el.setAttribute("aria-label", "Espanador. Arraste sobre as teias, ou use as setas do teclado, para limpar");
    el.innerHTML = ESPANADOR;
    document.body.appendChild(el);
    espanador = el;

    const L = 62, A = L * (210 / 80);
    let x = innerWidth - L - 28, y = innerHeight - A - 24, vx = 0;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const pos = () => { el.style.left = x + "px"; el.style.top = y + "px"; };
    pos();
    if (!reduz) el.animate([{ transform: `translateY(${-(y + 300)}px) rotate(-30deg)`, easing: "cubic-bezier(.5,0,.9,.5)" }, { transform: "translateY(0) rotate(6deg)", offset: 0.6, easing: "ease-out" }, { transform: "translateY(-16px) rotate(-3deg)", offset: 0.78, easing: "ease-in" }, { transform: "translateY(0) rotate(0)" }], { duration: 1000 });

    function mover(nx, ny) {
      const dx = nx - x, dy = ny - y;
      x = clamp(nx, 0, innerWidth - L); y = clamp(ny, 0, innerHeight - A);
      vx = vx * 0.6 + dx * 0.4;
      const graus = clamp(vx * 1.4, -30, 30);
      el.style.transform = `rotate(${graus}deg)`;
      pos();
      const ponta = Math.sin((graus * Math.PI) / 180) * A * 0.75;
      varrer(x + L / 2 + ponta, y + A * 0.2, Math.hypot(dx, dy));
    }

    let ox = 0, oy = 0, preso = false;
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.getAnimations().forEach((a) => a.cancel());
      ox = e.clientX - x; oy = e.clientY - y; preso = true;
      el.setPointerCapture(e.pointerId); el.classList.add("arrastando");
    });
    el.addEventListener("pointermove", (e) => { if (preso) mover(e.clientX - ox, e.clientY - oy); });
    const soltar = () => { preso = false; vx = 0; el.classList.remove("arrastando"); el.style.transform = "rotate(0deg)"; };
    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);
    el.addEventListener("keydown", (e) => {
      const passo = e.shiftKey ? 70 : 32, mapa = { ArrowLeft: [-passo, 0], ArrowRight: [passo, 0], ArrowUp: [0, -passo], ArrowDown: [0, passo] };
      if (!mapa[e.key]) return;
      e.preventDefault();
      mover(x + mapa[e.key][0], y + mapa[e.key][1]);
    });
    el.addEventListener("keyup", () => { vx = 0; el.style.transform = "rotate(0deg)"; });
  }

  function comecar() {
    if (ativo) {
      dizer("As teias já estão por aí. Pegue o espanador!");
      if (espanador && !reduz) espanador.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 450 });
      return;
    }
    ativo = true;
    criarTeias();
    criarEspanador();
    contador = document.createElement("p");
    contador.className = "ee-contador";
    document.body.appendChild(contador);
    atualizarContador();
    dizer("Quanto tempo esse armazém ficou fechado… Pegue o espanador e limpe as teias.", 4800);
    window.alert("tempo passa")
  }

  // ---------- gatilho de teclado (cheet.js) ----------
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
  sequencia("t e i a", comecar);
})();
