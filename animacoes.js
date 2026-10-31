
(function () {
  const INTRO = 700;           
  const ESPERAR_CLIQUE = true;  
  const TOTAL = 3200;           
  const PNG = "ilustracoes/png/", CENA = "ilustracoes/cena/";
  const CENAS = {
    cultivo:    { arq: "cena-cultivo.jpg",    iw: 1915, ih: 1262, cx: 0.498, cy: 0.514, cor: "#0e1a10", efeito: "petalas" },
    torra:      { arq: "cena-torra.jpg",      iw: 1915, ih: 1262, cx: 0.499, cy: 0.482, cor: "#120806", efeito: "brasas" },
    colheita:   { arq: "cena-colheita.jpg",   iw: 1915, ih: 1285, cx: 0.497, cy: 0.472, cor: "#efd9a4", efeito: "redemoinho" },
    exportacao: { arq: "cena-exportacao.jpg", iw: 1915, ih: 1285, cx: 0.495, cy: 0.41,  cor: "#10233b", efeito: "mar" },
  };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (v) => v[Math.floor(Math.random() * v.length)];
  let palco, veu, aberto = false, saindo = false, timer, inicio, destino, gateAtivo;

  function div(cls, pai) { const d = document.createElement("div"); d.className = cls; (pai || palco).appendChild(d); return d; }
  function imagem(src, cls, pai) { const i = document.createElement("img"); i.src = src; i.draggable = false; i.className = cls; (pai || palco).appendChild(i); return i; }
  const anima = (e, quadros, op) => e.animate(quadros, Object.assign({ fill: "both", easing: "ease-out" }, op));
  const loop = (e, quadros, dur, atrasoNeg) => e.animate(quadros, { duration: dur, delay: -atrasoNeg, iterations: Infinity, easing: "linear" });

  function layout(W, H, c) {
    const larg = W / c.iw, alto = H / c.ih, largo = W / H >= 1.15;
    const sc = largo ? Math.max(larg, alto) : Math.max(larg, Math.min(alto, 2.5 * larg));
    const dw = c.iw * sc, dh = c.ih * sc, ox = (W - dw) / 2, oy = largo ? 0 : (H - dh) / 2;
    return { dw, dh, ox, oy, gx: ox + c.cx * dw, gy: oy + c.cy * dh };
  }

  const EFEITOS = {
    petalas(fx, W, H) { 
      for (let i = 0; i < 26; i++) {
        const p = div("petala", fx), s = rnd(9, 17), x = rnd(0, W);
        p.style.width = s + "px"; p.style.height = s * 0.62 + "px";
        const rot = rnd(0, 360);
        loop(p, [{ transform: `translate(${x}px,-30px) rotate(${rot}deg)` }, { transform: `translate(${x + rnd(-90, 90)}px,${H * 0.5}px) rotate(${rot + 260}deg)` }, { transform: `translate(${x + rnd(-140, 140)}px,${H + 30}px) rotate(${rot + 520}deg)` }], rnd(6500, 10500), rnd(0, 9000));
      }
      for (let i = 0; i < 24; i++) {
        const p = div("poeira", fx), s = rnd(3, 8), x = rnd(0, W);
        p.style.width = p.style.height = s + "px";
        loop(p, [{ transform: `translate(${x}px,${H + 10}px)`, opacity: 0 }, { opacity: 0.9, offset: 0.4 }, { transform: `translate(${x + rnd(-60, 60)}px,${H * 0.1}px)`, opacity: 0 }], rnd(7000, 12000), rnd(0, 11000));
      }
    },
    brasas(fx, W, H, pai) { 
      const luz = div("luz-fogo", pai);
      luz.animate([{ opacity: 0.35 }, { opacity: 0.85 }], { duration: 1100, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
      for (let i = 0; i < 70; i++) {
        const p = div("brasa", fx), s = rnd(2, 6), x = rnd(0, W);
        p.style.width = p.style.height = s + "px"; p.style.background = pick(["#ffb347", "#ff7a1f", "#ffd37a"]);
        loop(p, [{ transform: `translate(${x}px,${H + 10}px)`, opacity: 1 }, { transform: `translate(${x + rnd(-120, 120)}px,${H * 0.55}px)`, opacity: 1, offset: 0.5 }, { transform: `translate(${x + rnd(-200, 200)}px,-20px)`, opacity: 0 }], rnd(2500, 5500), rnd(0, 5000));
      }
    },
    redemoinho(fx, W, H, pai, g) { 
      const giro = div("giro", pai);
      giro.style.setProperty("--gx", g.gx + "px"); giro.style.setProperty("--gy", g.gy + "px");
      giro.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], { duration: 26000, iterations: Infinity, easing: "linear" });
      const R = Math.hypot(W, H) * 0.5;
      for (let i = 0; i < 30; i++) {
        const tipo = i % 3, s = tipo === 0 ? rnd(70, 120) : rnd(16, 34);
        const e = tipo === 0 ? imagem(PNG + "foice.png", "fx-it", fx) : div(tipo === 1 ? "cereja" : "folha", fx);
        e.style.width = s + "px"; e.style.height = s * (tipo === 2 ? 0.5 : 1) + "px";
        const a0 = rnd(0, 6.28), sent = tipo === 0 ? 1 : -1, giroProp = rnd(0, 360);
        const quadros = Array.from({ length: 28 }, (_, j) => {
          const t = j / 27, r = R * (0.12 + 0.88 * t), a = a0 + sent * t * 5.2;
          return { transform: `translate(${g.gx + Math.cos(a) * r}px,${g.gy + Math.sin(a) * r * 0.72}px) translate(-50%,-50%) rotate(${a * 57.3 + 90 + giroProp + t * 300}deg) scale(${0.4 + t})`, opacity: Math.min(1, t * 8, (1 - t) * 6) };
        });
        loop(e, quadros, rnd(6000, 10000), rnd(0, 9000));
      }
    },
    mar(fx, W, H, pai, g, c, lay, src) { 
      [[0.5, 3200, 9, 0.5], [0.74, 2500, 7, -0.6]].forEach(([corte, dur, amp, rot]) => {
        const o = imagem(src, "cena-img onda", pai);
        const m = `linear-gradient(to bottom, transparent ${corte * 100 - 14}%, #000 ${corte * 100}%)`;
        o.style.maskImage = o.style.webkitMaskImage = m;
        Object.assign(o.style, { width: lay.dw + "px", height: lay.dh + "px", left: lay.ox + "px", top: lay.oy + "px" });
        o.animate([{ transform: `translateY(0) rotate(0deg)` }, { transform: `translateY(${amp}px) rotate(${rot}deg)` }], { duration: dur, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
      });
      for (let i = 0; i < 5; i++) {
        const b = div("gaivota", fx), y = rnd(H * 0.12, H * 0.5), s = rnd(22, 40);
        b.style.width = s + "px"; b.innerHTML = '<svg viewBox="0 0 24 10"><path d="M1 7 Q6 0 12 6 Q18 0 23 7" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>';
        loop(b, [{ transform: `translate(-80px,${y}px)` }, { transform: `translate(${W * 0.5}px,${y - 30}px)` }, { transform: `translate(${W + 80}px,${y + 10}px)` }], rnd(14000, 22000), rnd(0, 20000));
      }
      for (let i = 0; i < 36; i++) {
        const p = div("espuma", fx), s = rnd(2, 6), x = rnd(0, W);
        p.style.width = p.style.height = s + "px";
        loop(p, [{ transform: `translate(${x}px,${H * 0.9}px)`, opacity: 0 }, { transform: `translate(${x + rnd(-40, 40)}px,${H * rnd(0.55, 0.8)}px)`, opacity: 0.9, offset: 0.4 }, { transform: `translate(${x + rnd(-60, 60)}px,${H * 0.95}px)`, opacity: 0 }], rnd(1800, 3200), rnd(0, 3000));
      }
      for (let i = 0; i < 6; i++) { 
        const e = imagem(PNG + "grao-" + pick([1, 2, 3]) + ".png", "fx-it", fx), s = rnd(34, 64), x0 = rnd(W * 0.66, W * 0.95), rot = rnd(0, 360);
        e.style.width = s + "px"; e.style.height = s * 1.333 + "px";
        loop(e, [{ transform: `translate(${x0}px,${H + 40}px) translate(-50%,-50%) rotate(${rot}deg)` }, { transform: `translate(${x0 - W * 0.08}px,${H * 0.3}px) translate(-50%,-50%) rotate(${rot + 220}deg)`, offset: 0.5 }, { transform: `translate(${x0 - W * 0.16}px,${H + 60}px) translate(-50%,-50%) rotate(${rot + 440}deg)` }], rnd(3800, 6200), rnd(0, 6000));
      }
    },
  };

  function cena(nome, W, H, link) {
    const c = CENAS[nome], lay = layout(W, H, c), src = CENA + c.arq;
    const fundo = div("cena-fundo"); fundo.style.background = c.cor;
    anima(fundo, [{ opacity: 0 }, { opacity: 1 }], { duration: 500 });
    const cam = div("cena-cam"); cam.style.transformOrigin = `${lay.gx}px ${lay.gy}px`;
    anima(cam, [{ transform: "scale(1.14)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 1100, easing: "cubic-bezier(.2,.7,.2,1)" });
    const deriva = div("cena-deriva", cam); deriva.style.transformOrigin = `${lay.gx}px ${lay.gy}px`;
    deriva.animate([{ transform: "scale(1)" }, { transform: "scale(1.035)" }], { duration: 9000, direction: "alternate", iterations: Infinity, easing: "ease-in-out", delay: 1100 });
    const im = imagem(src, "cena-img", deriva);
    Object.assign(im.style, { width: lay.dw + "px", height: lay.dh + "px", left: lay.ox + "px", top: lay.oy + "px" });
    const fx = div("fx", deriva); anima(fx, [{ opacity: 0 }, { opacity: 1 }], { duration: 900, delay: 900 });
    EFEITOS[c.efeito](fx, W, H, deriva, lay, c, lay, src);
    
    link.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 600, delay: 250, fill: "forwards" });
  }

 
  function ir() { if (destino) { const d = destino; destino = null; location.href = d; } }
  function sair() {
    if (saindo || !aberto) return;
    saindo = true;
    clearTimeout(timer); clearTimeout(inicio);
    veu = div("veu", document.body);
    anima(veu, [{ opacity: 0 }, { opacity: 1 }], { duration: 350, easing: "ease-in" }).finished.then(ir, ir);
    setTimeout(ir, 700);
  }
  function limpar() {
    clearTimeout(timer); clearTimeout(inicio);
    [palco, veu].forEach((e) => e && e.remove());
    if (gateAtivo) { gateAtivo.getAnimations().forEach((a) => a.cancel()); gateAtivo.classList.remove("portao-ativo"); }
    document.body.classList.remove("trancado");
    aberto = saindo = false;
  }
  function tocar(nome, link) {
    if (aberto) return;
    if (!CENAS[nome] || window.matchMedia("(prefers-reduced-motion: reduce)").matches) { location.href = link.href; return; }
    aberto = true; destino = link.href; gateAtivo = link;
    palco = div("palco", document.body);
    palco.setAttribute("aria-hidden", "true");
    palco.addEventListener("click", sair);
    document.body.classList.add("trancado");
    link.classList.add("portao-ativo");
    anima(div("cortina"), [{ opacity: 0 }, { opacity: 1 }], { duration: INTRO });
   
    const W = innerWidth, H = innerHeight, r0 = link.getBoundingClientRect(), lay = layout(W, H, CENAS[nome]);
    const esc = Math.max(1, (0.3 * lay.dw) / r0.width);
    const dx = lay.gx - (r0.left + r0.width / 2), dy = lay.gy - (r0.top + r0.height / 2);
    link.animate([{ transform: "translate(0,0) scale(1)" }, { transform: `translate(${dx}px,${dy}px) scale(${esc})` }], { duration: INTRO, easing: "cubic-bezier(.3,.8,.3,1)", fill: "forwards" });
    inicio = setTimeout(() => { if (aberto && !saindo) cena(nome, W, H, link); }, INTRO);
    if (!ESPERAR_CLIQUE) timer = setTimeout(sair, INTRO + TOTAL);
  }

 
  Object.values(CENAS).forEach((c) => { new Image().src = CENA + c.arq; });
  ["grao-1", "grao-2", "grao-3", "foice"].forEach((n) => { new Image().src = PNG + n + ".png"; });

  document.querySelectorAll(".portao[data-animacao]").forEach((a) =>
    a.addEventListener("click", (ev) => {
      if (ev.button || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
      ev.preventDefault();
      tocar(a.dataset.animacao, a);
    }));
  window.addEventListener("keydown", (ev) => { if (aberto && (ev.key === "Escape" || ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); sair(); } });
  window.addEventListener("pageshow", (ev) => { if (ev.persisted) limpar(); });
})();
