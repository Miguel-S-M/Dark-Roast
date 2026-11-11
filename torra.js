// Forja: ao clicar na fornalha, os grãos pulam para a tela. Cada grão leva à torra de um café
(function () {
  const forja = document.querySelector(".forja");
  const fornalha = document.querySelector(".fornalha");
  const boca = document.querySelector(".boca");
  const camada = document.getElementById("graos");
  const dica = document.querySelector(".tor-dica");
  if (!forja || !fornalha || !boca || !camada) return;

  const reais = Array.from(camada.querySelectorAll(".grao"));
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => a + Math.random() * (b - a);
  // o segundo translate centraliza o elemento no ponto (x, y)
  const T = (x, y, r, s) => `translate(${x}px,${y}px) translate(-50%,-50%) rotate(${r}deg) scale(${s})`;
  let lancado = false;
  let tempo;

  // grãos pequenos, só de enfeite, espalhados pelo chão
  const extras = [];
  const TAMANHOS = ["grao-1", "grao-2", "grao-3"];
  for (let i = 0; i < 26; i++) {
    const g = document.createElement("img");
    g.className = "grao-extra";
    g.src = `ilustracoes/png/${TAMANHOS[i % 3]}.png`;
    g.alt = "";
    g.setAttribute("aria-hidden", "true");
    g.draggable = false;
    g.hidden = true;
    g.style.width = Math.round(rnd(26, 46)) + "px";
    g._fx = rnd(0.03, 0.97);
    g._fy = rnd(0.7, 0.97);
    g._rot = rnd(-80, 80);
    camada.insertBefore(g, camada.firstChild);
    extras.push(g);
  }

  // cada grão fica levemente girado, mas a etiqueta com o nome continua reta
  reais.forEach((g, i) => g.querySelector(".grao-corpo").style.setProperty("--giro", ((i % 3) - 1) * 14 + "deg"));

  function posReais(W, H) {
    const n = reais.length;
    if (W >= 760) {
      const larg = Math.min(W - 120, 940), x0 = (W - larg) / 2;
      return reais.map((_, i) => ({ x: x0 + larg * (i / (n - 1)), y: H * (i % 2 ? 0.84 : 0.78) }));
    }
    const cols = [0.2, 0.5, 0.8];
    return reais.map((_, i) => ({ x: W * cols[i % 3], y: H * (i < 3 ? 0.74 : 0.89) }));
  }

  function alvo(el, i, pr, W, H) {
    if (el._fx !== undefined) return { x: el._fx * W, y: el._fy * H, r: el._rot };
    return { x: pr[i].x, y: pr[i].y, r: 0 };
  }

  function pular(el, sx, sy, a, delay, dur, H) {
    el.getAnimations().forEach((an) => an.cancel());
    el.hidden = false;
    el.classList.remove("pousou");
    const final = T(a.x, a.y, a.r, 1);
    if (reduz) { el.style.transform = final; el.classList.add("pousou"); return; }
    const alto = rnd(190, 340) * Math.max(0.7, H / 800);
    const anim = el.animate([
      { transform: T(sx, sy, 0, 0.2), opacity: 0, offset: 0, easing: "ease-out" },
      { transform: T(sx + (a.x - sx) * 0.55, Math.min(sy, a.y) - alto, a.r * 0.5, 1), opacity: 1, offset: 0.45, easing: "ease-in" },
      { transform: final, opacity: 1, offset: 0.78, easing: "ease-out" },
      { transform: T(a.x, a.y - rnd(12, 26), a.r + rnd(-12, 12), 1), opacity: 1, offset: 0.89, easing: "ease-in" },
      { transform: final, opacity: 1, offset: 1 },
    ], { duration: dur, delay, fill: "both" });
    anim.onfinish = () => { el.style.transform = final; anim.cancel(); el.classList.add("pousou"); };
  }

  function faiscas(sx, sy) {
    if (reduz) return;
    for (let i = 0; i < 34; i++) {
      const f = document.createElement("i");
      f.className = "faisca";
      f.style.left = sx + "px";
      f.style.top = sy + "px";
      forja.appendChild(f);
      const dx = rnd(-140, 140), dy = -rnd(140, 380);
      f.animate([
        { transform: "translate(-50%,-50%) scale(1)", opacity: 0, offset: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translate(${dx}px,${dy}px) scale(0.2)`, opacity: 0, offset: 1 },
      ], { duration: rnd(900, 1800), delay: rnd(0, 500), easing: "ease-out", fill: "both" }).onfinish = () => f.remove();
    }
  }

  function lancar() {
    const fr = forja.getBoundingClientRect(), br = boca.getBoundingClientRect();
    const W = fr.width, H = fr.height;
    const sx = br.left - fr.left + br.width / 2, sy = br.top - fr.top + br.height * 0.6;
    const pr = posReais(W, H);

    forja.classList.add("acesa", "quente");
    fornalha.classList.add("acesa");
    clearTimeout(tempo);
    tempo = setTimeout(() => { forja.classList.remove("acesa"); fornalha.classList.remove("acesa"); }, 2400);
    faiscas(sx, sy);

    extras.forEach((g) => pular(g, sx, sy, alvo(g, 0, pr, W, H), rnd(0, 700), rnd(1100, 1700), H));
    reais.forEach((g, i) => pular(g, sx, sy, alvo(g, i, pr, W, H), 250 + i * 120, rnd(1300, 1700), H));

    if (!lancado) {
      lancado = true;
      if (dica) dica.textContent = "Cada grão é um café. Clique em um para ver como é a torra dele.";
      fornalha.setAttribute("aria-label", "Soprar o fogo e soltar os grãos de novo");
    }
  }

  fornalha.addEventListener("click", lancar);

  // ao redimensionar, os grãos já soltos voltam ao lugar certo
  let rz;
  window.addEventListener("resize", () => {
    if (!lancado) return;
    clearTimeout(rz);
    rz = setTimeout(() => {
      const fr = forja.getBoundingClientRect(), pr = posReais(fr.width, fr.height);
      extras.concat(reais).forEach((g, i) => {
        const a = alvo(g, reais.indexOf(g), pr, fr.width, fr.height);
        g.getAnimations().forEach((an) => an.cancel());
        g.style.transform = T(a.x, a.y, a.r, 1);
        g.classList.add("pousou");
      });
    }, 120);
  });

  // clicar em um grão: ele cresce na luz da fornalha e a página do café abre
  camada.addEventListener("click", (e) => {
    const grao = e.target.closest("a.grao");
    if (!grao || e.defaultPrevented || !cliqueComum(e)) return;
    marcarTransicao();
    if (reduz) return;
    e.preventDefault();
    camada.classList.add("escolheu");
    grao.classList.add("escolhido");
    setTimeout(() => { location.href = grao.href; }, 420);
  });

  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    camada.classList.remove("escolheu");
    camada.querySelectorAll(".escolhido").forEach((g) => g.classList.remove("escolhido"));
  });
})();
