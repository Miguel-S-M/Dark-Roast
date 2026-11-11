// Página de um café: monta o conteúdo a partir de cafes-dados.js
// Endereço: cafe.html?c=geisha&e=torra  (c = café, e = etapa: cultivo, colheita ou torra)
(function () {
  "use strict";
  const ETAPAS = {
    cultivo: { kanji: "栽培", nome: "Cultivo", voltar: "cultivo.html", voltarTexto: "Voltar ao mapa", passos: "Como é feito", redor: "Ao redor" },
    colheita: { kanji: "収穫", nome: "Colheita", voltar: "colheita.html", voltarTexto: "Voltar ao armazém", passos: "Como é colhido", redor: "Ao redor" },
    torra: { kanji: "焙煎", nome: "Torra", voltar: "torra.html", voltarTexto: "Voltar à fornalha", passos: "Como é torrado", redor: "No torrador" },
  };

  const parametros = new URLSearchParams(location.search);
  const posicao = window.CAFES.findIndex((c) => c.id === parametros.get("c"));
  const chaveEtapa = ETAPAS[parametros.get("e")] ? parametros.get("e") : "cultivo";
  const etapa = ETAPAS[chaveEtapa];
  const principal = document.getElementById("conteudo");

  // limpa o aviso da transição e tira a imagem de entrada quando a animação acabar
  try { sessionStorage.removeItem("transicao"); } catch { /* sem sessionStorage */ }
  const entrada = document.querySelector(".entrada");
  entrada.addEventListener("animationend", () => entrada.remove());

  document.getElementById("voltar").href = etapa.voltar;
  document.getElementById("voltar").textContent = etapa.voltarTexto;
  document.getElementById("secao-kanji").textContent = etapa.kanji;
  document.getElementById("secao-nome").textContent = etapa.nome;

  if (posicao < 0) {
    entrada.remove();
    principal.append(Dom.criar("p", { classe: "cafe-vazio" }, "Não encontramos esse café. ",
      Dom.criar("a", { href: "index.html#origem", texto: "Voltar para a origem" })));
    return;
  }

  const cafe = window.CAFES[posicao];
  const dados = cafe.etapas[chaveEtapa];
  document.title = cafe.nome + " · " + etapa.nome + " · Dark Roast";
  document.getElementById("entrada-imagem").src = cafe.imagem;

  function link(outro, texto, rel) {
    return Dom.criar("a", { href: "cafe.html?c=" + outro.id + "&e=" + chaveEtapa, rel },
      Dom.criar("small", { texto }), Dom.criar("span", { texto: outro.nome }));
  }

  const icone = Dom.svg("svg", { classe: "cena-desenho", viewBox: "0 0 64 64", "aria-hidden": "true" },
    Dom.svg("use", { href: "#cena-" + cafe.icone }));

  const nota = dados.nota && Dom.criar("aside", { classe: "cafe-nota" },
    Dom.criar("strong", { texto: dados.nota[0] }), Dom.criar("p", { texto: dados.nota[1] }));
  const enquete = chaveEtapa === "torra" && Dom.criar("a", { classe: "cafe-enquete", href: "enquetes.html", texto: "Vote na enquete: qual torra você prefere?" });

  principal.append(
    Dom.criar("section", { classe: "cafe-heroi" },
      Dom.criar("figure", { classe: "cafe-poster" },
        Dom.criar("img", { src: cafe.imagem, alt: "Ilustração do café " + cafe.nome + ": " + cafe.lugar })),
      Dom.criar("div", {},
        Dom.criar("h1", { classe: "cafe-nome", texto: cafe.nome }),
        Dom.criar("p", { classe: "cafe-lugar" }, icone, Dom.criar("span", { texto: cafe.lugar })),
        Dom.criar("p", { classe: "cafe-lead", texto: dados.lead }),
        Dom.criar("dl", { classe: "cafe-ficha" },
          dados.ficha.map(([nome, valor]) => Dom.criar("div", {}, Dom.criar("dt", { texto: nome }), Dom.criar("dd", { texto: valor })))))),
    Dom.criar("section", { classe: "cafe-corpo" },
      Dom.criar("div", {},
        Dom.criar("h2", { texto: etapa.passos }),
        Dom.criar("ol", { classe: "cafe-passos" }, dados.passos.map((passo) => Dom.criar("li", { texto: passo })))),
      Dom.criar("div", { classe: "cafe-arredores" },
        Dom.criar("h2", { texto: etapa.redor }),
        Dom.criar("p", { texto: dados.redor }), nota, enquete)));

  const anterior = window.CAFES[(posicao + window.CAFES.length - 1) % window.CAFES.length];
  const proximo = window.CAFES[(posicao + 1) % window.CAFES.length];
  document.getElementById("vizinhos").append(link(anterior, "Café anterior", "prev"), link(proximo, "Próximo café", "next"));
})();
