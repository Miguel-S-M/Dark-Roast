// Seções a mais da página do café (cafe.html): ficha técnica, comparador, calendário e ciclo da
// planta no cultivo; método de colheita na colheita; link da loja na torra.
(function () {
  "use strict";
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const FASES = [
    ["florada", "Florada"],
    ["amadurecimento", "Cerejas amadurecendo"],
    ["colheita", "Colheita"],
  ];
  const dinheiro = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const parametros = new URLSearchParams(location.search);
  const etapa = ["cultivo", "colheita", "torra"].includes(parametros.get("e")) ? parametros.get("e") : "cultivo";
  const cafe = window.CAFES.find((c) => c.id === parametros.get("c"));
  const principal = document.getElementById("conteudo");
  const extra = cafe && window.CAFES_EXTRA[cafe.id];
  if (!principal || !extra) return;

  const mesAtual = new Date().getMonth() + 1;
  const hemisferio = (e) => (e.hemisferio === "sul" ? "Sul" : "Norte");

  // [10, 11, 12, 1] vira "outubro a janeiro"; a lista pode atravessar a virada do ano
  function faixa(meses) {
    const tem = new Set(meses);
    const inicio = meses.find((m) => !tem.has(m === 1 ? 12 : m - 1));
    if (inicio === undefined) return "o ano todo";
    let fim = inicio;
    while (tem.has(fim === 12 ? 1 : fim + 1)) fim = fim === 12 ? 1 : fim + 1;
    return inicio === fim ? MESES[inicio - 1] : MESES[inicio - 1] + " a " + MESES[fim - 1];
  }

  function secao(titulo, lead, ...conteudo) {
    return Dom.criar("section", { classe: "extra" },
      Dom.criar("h2", { texto: titulo }),
      lead && Dom.criar("p", { classe: "extra-lead", texto: lead }),
      ...conteudo);
  }

  function fichaTecnica() {
    const linhas = [["Altitude", extra.altitude], ["Clima", extra.clima], ["Variedade", extra.variedade], ["Hemisfério", hemisferio(extra)]];
    return Dom.criar("dl", { classe: "cafe-ficha" },
      linhas.map(([nome, valor]) => Dom.criar("div", {}, Dom.criar("dt", { texto: nome }), Dom.criar("dd", { texto: valor }))));
  }

  function comparador() {
    const resultado = Dom.criar("div", { classe: "rolagem", "aria-live": "polite" });
    const seletor = Dom.criar("select", {},
      Dom.criar("option", { value: "", texto: "Escolha um café" }),
      window.CAFES.filter((c) => c.id !== cafe.id).map((c) => Dom.criar("option", { value: c.id, texto: c.nome })));

    function linhas(c) {
      const e = window.CAFES_EXTRA[c.id];
      return [
        ["Lugar", c.lugar],
        ["Altitude", e.altitude],
        ["Clima", e.clima],
        ["Variedade", e.variedade],
        ["Colheita", faixa(e.calendario.colheita) + " (hemisfério " + hemisferio(e) + ")"],
        ["Como é colhido", e.metodo.tipo],
        ["Preço de referência", dinheiro.format(e.preco) + " por kg"],
      ];
    }

    seletor.addEventListener("change", () => {
      const outro = window.CAFES.find((c) => c.id === seletor.value);
      if (!outro) { resultado.replaceChildren(); return; }
      const minhas = linhas(cafe), dele = linhas(outro);
      resultado.replaceChildren(Dom.criar("table", { classe: "comparacao" },
        Dom.criar("thead", {}, Dom.criar("tr", {}, Dom.criar("td"), Dom.criar("th", { scope: "col", texto: cafe.nome }), Dom.criar("th", { scope: "col", texto: outro.nome }))),
        Dom.criar("tbody", {}, minhas.map(([nome, valor], i) =>
          Dom.criar("tr", {}, Dom.criar("th", { scope: "row", texto: nome }), Dom.criar("td", { texto: valor }), Dom.criar("td", { texto: dele[i][1] }))))));
    });

    return Dom.criar("div", { classe: "comparar" }, Dom.campo("Comparar com outro café", "comparar-cafe", seletor), resultado);
  }

  function statusDeHoje() {
    const agora = FASES.filter(([chave]) => extra.calendario[chave].includes(mesAtual)).map(([, nome]) => nome.toLowerCase());
    return "Em " + MESES[mesAtual - 1] + ": " + (agora.length ? agora.join(" e ") + "." : "o pé está em repouso, sem fase marcada.");
  }

  function calendario() {
    const cabecalho = Dom.criar("tr", {}, Dom.criar("td"),
      MESES.map((nome, i) => Dom.criar("th", { scope: "col", classe: i + 1 === mesAtual ? "agora" : null, "aria-label": nome, texto: nome.slice(0, 3) })));
    const corpo = FASES.map(([chave, nome]) =>
      Dom.criar("tr", {}, Dom.criar("th", { scope: "row", texto: nome }),
        MESES.map((_, i) => {
          const ativo = extra.calendario[chave].includes(i + 1);
          return Dom.criar("td", { classe: (ativo ? "on " : "") + (i + 1 === mesAtual ? "agora" : ""), "data-fase": chave },
            ativo && Dom.criar("span", { classe: "sr", texto: "sim" }));
        })));
    return Dom.criar("div", {},
      Dom.criar("div", { classe: "rolagem" }, Dom.criar("table", { classe: "cal" },
        Dom.criar("caption", { texto: "Calendário de " + cafe.nome + " (hemisfério " + hemisferio(extra) + ")" }),
        Dom.criar("thead", {}, cabecalho), Dom.criar("tbody", {}, corpo))),
      Dom.criar("p", { classe: "cal-hoje", texto: statusDeHoje() }));
  }

  function cicloDaPlanta() {
    const c = extra.calendario;
    const passos = [
      { desenho: "flor", nome: "Flor", texto: "Flores brancas e perfumadas abrem em " + faixa(c.florada) + " e duram poucos dias." },
      { desenho: "folha", nome: "Folha", texto: "O pé cresce e se enche de folhas. Cada flor fecundada vira uma cereja." },
      { desenho: "cereja", nome: "Cereja verde", texto: "Por meses a cereja só engorda. Ainda está dura e não presta para colher.", verde: true },
      { desenho: "cereja", nome: "Cereja madura", texto: "Fica vermelha por volta de " + faixa(c.amadurecimento) + ". É o sinal de que dá para colher." },
      { desenho: "grao", nome: "Grão", texto: "Dentro de cada cereja ficam duas sementes. A colheita vai de " + faixa(c.colheita) + "." },
    ];
    return Dom.criar("ol", { classe: "ciclo" }, passos.map((p) =>
      Dom.criar("li", {},
        Dom.svg("svg", { viewBox: "0 0 64 64", "aria-hidden": "true", style: p.verde ? "--shu:#7a9a4f" : null }, Dom.svg("use", { href: "#" + p.desenho })),
        Dom.criar("strong", { texto: p.nome }),
        Dom.criar("p", { texto: p.texto }))));
  }

  function metodoDeColheita() {
    const cartao = (titulo, vantagens, limites, deste) => Dom.criar("div", { classe: "metodo-card" + (deste ? " deste" : "") },
      deste && Dom.criar("span", { classe: "metodo-tag", texto: "É o que este café usa" }),
      Dom.criar("h3", { texto: titulo }),
      Dom.criar("p", {}, Dom.criar("strong", { texto: "Vantagem: " }), vantagens),
      Dom.criar("p", {}, Dom.criar("strong", { texto: "Limite: " }), limites));
    const aMao = extra.metodo.tipo === "À mão";
    return secao("À mão ou à máquina",
      "A cereja não amadurece toda ao mesmo tempo, e esse é o problema da colheita. Cada jeito resolve de uma forma.",
      Dom.criar("div", { classe: "metodo-par" },
        cartao("À mão", "Dá para escolher só as cerejas maduras, passando várias vezes pelo mesmo pé.", "Pede muita gente, leva semanas e custa caro.", aMao),
        cartao("À máquina", "Uma colhedeira sacode o pé e termina uma fazenda grande em poucos dias.", "Derruba maduras e verdes juntas e só funciona em terreno plano. Muito usada no Brasil.", !aMao)),
      Dom.criar("p", { classe: "metodo-motivo" }, Dom.criar("strong", { texto: cafe.nome + ": " }), extra.metodo.motivo + " Época da colheita: " + faixa(extra.calendario.colheita) + "."));
  }

  function linkDaLoja() {
    return secao("Levar para casa",
      "Quanto custaria ter o " + cafe.nome + " na sua xícara? A loja do Dark Roast faz a conta por quilo e guarda o carrinho na sua conta.",
      Dom.criar("a", { classe: "extra-botao", href: "loja.html?c=" + cafe.id, texto: "Calcular o preço do " + cafe.nome }));
  }

  const caixa = Dom.criar("div", { classe: "extras" });
  if (etapa === "cultivo") {
    caixa.append(
      secao("Ficha técnica", "Onde e como esse café cresce. Escolha outro café para ver as diferenças lado a lado.",
        Dom.criar("div", { classe: "tecnica" }, fichaTecnica(), comparador())),
      secao("Calendário do ano", "O hemisfério muda tudo: no Sul a colheita cai no nosso inverno, no Norte ela vem no fim do ano.", calendario()),
      secao("Ciclo da planta", "Do botão de flor até o grão, na ordem em que acontece.", cicloDaPlanta()));
  } else if (etapa === "colheita") {
    caixa.append(metodoDeColheita());
  } else {
    caixa.append(linkDaLoja());
  }

  const corpo = principal.querySelector(".cafe-corpo");
  if (corpo) corpo.after(caixa);
  else principal.append(caixa);
})();
