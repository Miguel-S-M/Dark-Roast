
(function () {
  const DADOS = "https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-50m.json";
  const CAFES = [
    { nome: "Kopi Luwak", lugar: "Sumatra, Indonésia", lon: 97.5, lat: 3.5, pagina: "KopiLuwakCultivo.html", imagem: "ilustracoes/kopi-luwak-cultivo.jpg",
      cena: { desenho: "civeta", dx: 10, dy: 64 },
      producao: "A civeta-de-palmeira (luwak) come as cerejas mais maduras. Os grãos saem inteiros, são lavados, secos e torrados.",
      ambiente: "Terras altas tropicais de Sumatra, com café plantado à sombra de árvores e floresta úmida." },
    { nome: "Black Ivory", lugar: "Chiang Rai, Tailândia", lon: 99.8, lat: 19.9, pagina: "BlackIvoryCultivo.html", imagem: "ilustracoes/black-ivory-cultivo.jpg",
      cena: { desenho: "elefante", dx: 0, dy: -66 },
      producao: "Elefantes comem cerejas de café misturadas com arroz e frutas. Os grãos são recolhidos, lavados, secos e torrados.",
      ambiente: "Montanhas do norte da Tailândia, perto do Triângulo Dourado, com santuário de elefantes." },
    { nome: "Jacu Bird", lugar: "Espírito Santo, Brasil", lon: -41, lat: -20.5, pagina: "JacuBirdCultivo.html", imagem: "ilustracoes/jacu-bird-cultivo.jpg", lado: "esq",
      cena: { desenho: "jacu", dx: 0, dy: 64 },
      producao: "A ave jacu escolhe as cerejas mais maduras. Os grãos que ela elimina são recolhidos, lavados e secos.",
      ambiente: "Mata Atlântica nas montanhas do Espírito Santo, com café orgânico cultivado entre as árvores." },
    { nome: "Geisha", lugar: "Boquete, Panamá", lon: -82.4, lat: 8.8, pagina: "GeishaCultivo.html", imagem: "ilustracoes/geisha-cultivo.jpg",
      cena: { desenho: "vulcao", dx: -62, dy: 48 },
      producao: "Variedade de origem etíope, colhida à mão só no ponto certo e processada em pequenos lotes.",
      ambiente: "Encostas do vulcão Barú, em altitude, com neblina constante e floresta de montanha." },
    { nome: "Santa Helena", lugar: "Ilha de Santa Helena", lon: -5.7, lat: -15.95, pagina: "SantaHelenaCultivo.html", imagem: "ilustracoes/santa-helena-cultivo.jpg",
      cena: { desenho: "ilha", dx: 0, dy: -66 },
      producao: "Variedade Bourbon, plantada na ilha desde o século XVIII e colhida à mão em pequenas fazendas.",
      ambiente: "Ilha vulcânica no meio do Atlântico Sul, com penhascos, ventos constantes e clima ameno." },
    { nome: "Blue Mountain", lugar: "Montanhas Azuis, Jamaica", lon: -77.4, lat: 18.1, pagina: "BlueMountainCultivo.html", imagem: "ilustracoes/blue-mountain-cultivo.jpg",
      cena: { desenho: "montanha", dx: 62, dy: -52 },
      producao: "Colhido à mão nas encostas, lavado e seco. É embalado em barris de madeira, marca registrada desse café.",
      ambiente: "Montanhas Azuis da Jamaica, com chuva frequente, névoa e altitudes elevadas." },
  ];
  const OCEANOS = [
    { texto: "Oceano Pacífico", lon: -150, lat: 12 },
    { texto: "Oceano Atlântico", lon: -32, lat: 10 },
    { texto: "Oceano Índico", lon: 74, lat: -18 },
  ];
  const TROPICO = 23.4366; // Trópicos de Câncer e de Capricórnio
  const ZOOM_MAX = 16;

  const status = document.getElementById("status");
  const tela = document.querySelector(".mapa-tela");
  const caixaPontos = document.getElementById("pontos");
  const reduzMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dur = (ms) => (reduzMovimento ? 0 : ms);

  function erro(msg) { status.textContent = msg; }
  if (typeof d3 === "undefined" || typeof topojson === "undefined") {
    erro("Não foi possível carregar o mapa. Verifique sua conexão com a internet e recarregue a página.");
    return;
  }

  // ---------- Pontos clicáveis (HTML por cima do mapa) ----------
  const pontos = CAFES.map((c) => {
    const a = document.createElement("a");
    a.className = "ponto";
    a.href = c.pagina;
    a.setAttribute("aria-label", `${c.nome}, ${c.lugar}. ${c.producao} ${c.ambiente} Abrir a página do cultivo.`);
    a.innerHTML =
      `<span class="ponto-rotulo">${c.nome}<span class="ponto-lugar">${c.lugar} · ver cultivo</span></span>` +
      `<svg class="ponto-fio" aria-hidden="true"><line x1="0" y1="0" x2="${c.cena.dx}" y2="${c.cena.dy}"/></svg>` +
      `<span class="ponto-cena" style="--dx:${c.cena.dx}px;--dy:${c.cena.dy}px">` +
        `<svg class="cena-desenho" viewBox="0 0 64 64" aria-hidden="true"><use href="#cena-${c.cena.desenho}"/></svg>` +
        `<span class="ponto-nota"><b>Como é feito</b>${c.producao}<b>Ao redor</b>${c.ambiente}</span>` +
      `</span>`;
    caixaPontos.appendChild(a);
    return { cafe: c, el: a, xy: [0, 0] };
  });

  const svg = d3.select("#mapa-svg");
  const zoom = d3.zoom().scaleExtent([1, ZOOM_MAX]).on("zoom", (ev) => aplicar(ev.transform));
  let mundo = null, projecao, camada, rotulos, limites, larg, alt, inicial;

  function aplicar(t) {
    camada.attr("transform", t);
    rotulos.attr("font-size", 15 / t.k);
    rotulos.style("display", larg < 700 && t.k < 2.5 ? "none" : null); // celular: nomes dos oceanos só com zoom
    // Quanto mais perto, mais aparece: primeiro os desenhos, depois os textos
    const mundoPx = (limites[1][0] - limites[0][0]) * t.k;
    const pequena = larg < 700;
    caixaPontos.classList.toggle("com-cenas", mundoPx >= (pequena ? 1300 : 1800));
    caixaPontos.classList.toggle("com-texto", mundoPx >= (pequena ? 2600 : 3200));
    pontos.forEach((p) => {
      const [x, y] = t.apply(p.xy);
      p.el.style.left = x + "px";
      p.el.style.top = y + "px";
      p.el.classList.toggle("esq", p.cafe.lado === "esq" || x > larg - 200);
      // Caixa de texto: abre para o lado que tem espaço e para longe do ponto
      const d = p.cafe.cena, med = pequena ? 52 : 64, notaL = pequena ? 180 : 210;
      p.el.classList.toggle("nota-esq", x + d.dx + med / 2 + 8 + notaL > larg - 8);
      // Desenho e texto só aparecem quando o desenho está na tela
      p.el.classList.toggle("fora", x + d.dx < -40 || x + d.dx > larg + 40 || y + d.dy < -40 || y + d.dy > alt + 40);
      p.el.classList.toggle("nota-cima", d.dy < 0 || y + d.dy + med / 2 + 130 > alt - 8);
    });
  }

  // ---------- Desenho do mapa ----------
  function montar() {
    larg = tela.clientWidth;
    alt = tela.clientHeight;
    svg.attr("viewBox", [0, 0, larg, alt]).selectAll("*").remove();

    const esfera = { type: "Sphere" };
    projecao = d3.geoNaturalEarth1().fitExtent([[16, 16], [larg - 16, alt - 16]], esfera);
    const caminho = d3.geoPath(projecao);
    limites = caminho.bounds(esfera);

    const terra = mundo.objects.land
      ? topojson.feature(mundo, mundo.objects.land)
      : topojson.feature(mundo, mundo.objects.countries);
    const fronteiras = topojson.mesh(mundo, mundo.objects.countries, (a, b) => a !== b);
    const grade = d3.geoGraticule().step([30, 30]);
    const faixa = d3.geoGraticule().extent([[-180, -TROPICO], [180, TROPICO]]).outline();
    const paralelo = (lat) => ({
      type: "LineString",
      coordinates: d3.range(-180, 181, 5).map((lon) => [lon, lat]),
    });

    camada = svg.append("g");
    camada.append("path").attr("class", "m-mar").attr("d", caminho(esfera));
    camada.append("path").attr("class", "m-graticula").attr("d", caminho(grade()));
    camada.append("path").attr("class", "m-terra").attr("d", caminho(terra));
    camada.append("path").attr("class", "m-fronteiras").attr("d", caminho(fronteiras));
    camada.append("path").attr("class", "m-cinturao").attr("d", caminho(faixa));
    camada.append("path").attr("class", "m-tropicos").attr("d", caminho(paralelo(TROPICO)));
    camada.append("path").attr("class", "m-tropicos").attr("d", caminho(paralelo(-TROPICO)));
    rotulos = camada.append("g").selectAll("text").data(OCEANOS).join("text")
      .attr("class", "m-oceano")
      .attr("transform", (d) => `translate(${projecao([d.lon, d.lat])})`)
      .text((d) => d.texto);

    pontos.forEach((p) => { p.xy = projecao([p.cafe.lon, p.cafe.lat]); });

    zoom.extent([[0, 0], [larg, alt]]).translateExtent(limites);
    svg.call(zoom);

    // Enquadramento inicial: mostra todos os cafés
    const xs = pontos.map((p) => p.xy[0]), ys = pontos.map((p) => p.xy[1]);
    const x0 = d3.min(xs), x1 = d3.max(xs), y0 = d3.min(ys), y1 = d3.max(ys);
    const folga = Math.max(60, larg * 0.08);
    const k = Math.max(1, Math.min(larg / (x1 - x0 + 2 * folga), alt / (y1 - y0 + 2 * folga), ZOOM_MAX));
    const t = d3.zoomIdentity.translate(larg / 2, alt / 2).scale(k).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    inicial = zoom.constrain()(t, [[0, 0], [larg, alt]], limites);
    svg.call(zoom.transform, inicial);
  }

  // ---------- Transição: o mapa se aproxima do ponto e a imagem do café abre a página ----------
  let saindo = false;
  function abrir(p) {
    if (saindo) return;
    saindo = true;
    try { sessionStorage.setItem("transicao", String(Date.now())); } catch (e) {}
    if (reduzMovimento) { location.href = p.cafe.pagina; return; }
    const r = p.el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const veu = document.createElement("div");
    veu.className = "transicao";
    veu.setAttribute("aria-hidden", "true");
    veu.style.setProperty("--x", x + "px");
    veu.style.setProperty("--y", y + "px");
    veu.innerHTML = `<img src="${p.cafe.imagem}" alt="">`;
    document.body.appendChild(veu);
    svg.transition().duration(900).call(zoom.scaleBy, 3, [x, y]);
    requestAnimationFrame(() => requestAnimationFrame(() => veu.classList.add("aberta")));
    setTimeout(() => { location.href = p.cafe.pagina; }, 1100);
  }
  caixaPontos.addEventListener("click", (ev) => {
    const a = ev.target.closest("a.ponto");
    if (!a || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    ev.preventDefault();
    abrir(pontos.find((p) => p.el === a));
  });
  // Ao voltar para o mapa pelo botão "voltar" do navegador, desfaz a transição
  window.addEventListener("pageshow", (ev) => {
    if (!ev.persisted) return;
    document.querySelectorAll(".transicao").forEach((v) => v.remove());
    saindo = false;
    if (inicial) svg.transition().duration(dur(700)).call(zoom.transform, inicial);
  });

  // ---------- Botões ----------
  document.getElementById("zoom-mais").addEventListener("click", () =>
    svg.transition().duration(dur(300)).call(zoom.scaleBy, 1.7));
  document.getElementById("zoom-menos").addEventListener("click", () =>
    svg.transition().duration(dur(300)).call(zoom.scaleBy, 1 / 1.7));
  document.getElementById("zoom-inicio").addEventListener("click", () =>
    svg.transition().duration(dur(700)).call(zoom.transform, inicial));

  // ---------- Carregar os dados e desenhar ----------
  d3.json(DADOS).then((dados) => {
    mundo = dados;
    status.textContent = "";
    montar();
    let espera;
    window.addEventListener("resize", () => {
      clearTimeout(espera);
      espera = setTimeout(montar, 200);
    });
  }).catch(() => erro("Não foi possível carregar os dados do mapa. Verifique sua conexão com a internet e recarregue a página."));
})();
