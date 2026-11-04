// ===== Sugestões: países para exportar e novos cafés para cultivar =====
// Endereço: sugestoes.html?t=paises  ou  sugestoes.html?t=cafes
// Há ideias prontas (exportacao-dados.js) e o usuário logado pode apoiar ideias e sugerir as suas.
(function () {
  "use strict";
  const TEXTOS = {
    paises: {
      secao: "Para onde exportar",
      titulo: "Países para exportar",
      lead: "Ideias de lugares que podem gostar dos nossos cafés. Apoie as que você acha melhores ou sugira um país.",
      campoNome: "País",
      campoMotivo: "Por que exportar para lá?",
      botao: "Sugerir país",
      vazio: "Ainda não há sugestões dos visitantes. Seja o primeiro!",
    },
    cafes: {
      secao: "O que cultivar a seguir",
      titulo: "Novos cafés para cultivar",
      lead: "Variedades e espécies que poderiam entrar no mapa do Dark Roast. Apoie as que você quer ver e sugira um café.",
      campoNome: "Nome do café ou da variedade",
      campoMotivo: "Por que cultivar esse café?",
      botao: "Sugerir café",
      vazio: "Ainda não há sugestões dos visitantes. Seja o primeiro!",
    },
  };

  const tipo = new URLSearchParams(location.search).get("t") === "cafes" ? "cafes" : "paises";
  const textos = TEXTOS[tipo];
  const chave = "dr_sugestoes_" + tipo;
  const prontas = window.EXPORTACAO[tipo];
  let estado = Dados.ler(chave, { apoios: {}, extras: [] });
  let ordem = "apoios";

  const el = {
    lista: document.getElementById("lista"),
    extras: document.getElementById("lista-extras"),
    ordem: document.getElementById("ordem"),
    form: document.getElementById("form-sugestao"),
    erro: document.getElementById("erro-sugestao"),
  };

  document.title = textos.titulo + " · Dark Roast";
  document.getElementById("secao").textContent = textos.secao;
  document.getElementById("titulo").textContent = textos.titulo;
  document.getElementById("lead").textContent = textos.lead;
  document.getElementById("rotulo-nome").textContent = textos.campoNome;
  document.getElementById("rotulo-motivo").textContent = textos.campoMotivo;
  document.getElementById("botao-sugerir").textContent = textos.botao;

  const salvar = () => Dados.gravar(chave, estado);
  const apoiadores = (id) => estado.apoios[id] || [];

  function alternarApoio(id) {
    const atual = window.DarkRoast.exigirLogin("Entre na sua conta para apoiar.");
    if (!atual) return;
    const lista = apoiadores(id);
    estado.apoios[id] = lista.includes(atual.chave) ? lista.filter((c) => c !== atual.chave) : lista.concat(atual.chave);
    salvar();
    desenhar();
  }

  function botaoApoiar(id) {
    const atual = Contas.usuarioAtual();
    const apoiou = !!atual && apoiadores(id).includes(atual.chave);
    return Dom.criar("button", { type: "button", classe: "botao pequeno", "aria-pressed": String(apoiou),
      texto: (apoiou ? "Apoiado" : "Apoiar") + " · " + apoiadores(id).length, onclick: () => alternarApoio(id) });
  }

  function linksCafes(ids) {
    const nomes = window.CAFES.filter((c) => ids.includes(c.id));
    return Dom.criar("p", { classe: "sug-combina" }, "Combina com: ",
      nomes.map((c, i) => [i ? ", " : "", Dom.criar("a", { href: "cafe.html?c=" + c.id + "&e=cultivo", texto: c.nome })]));
  }

  function cartaoPronto(item) {
    return Dom.criar("article", { classe: "sug-card" },
      Dom.criar("header", { classe: "sug-cab" }, Dom.criar("h3", { texto: item.nome }), Dom.criar("span", { classe: "selo", texto: item.tag })),
      Dom.criar("p", { texto: item.resumo }),
      Dom.criar("ul", { classe: "sug-porque" }, item.porque.map((p) => Dom.criar("li", { texto: p }))),
      Dom.criar("p", { classe: "sug-atencao" }, Dom.criar("strong", { texto: "Atenção: " }), item.atencao),
      linksCafes(item.combina),
      Dom.criar("footer", { classe: "sug-rodape" }, botaoApoiar(item.id)));
  }

  function cartaoExtra(item) {
    const atual = Contas.usuarioAtual();
    const rodape = Dom.criar("footer", { classe: "sug-rodape" }, botaoApoiar(item.id),
      Dom.criar("span", { classe: "sug-autor", texto: "Sugestão de " + item.autor }));
    if (atual && atual.nome === item.autor) {
      rodape.append(Dom.criar("button", { type: "button", classe: "botao claro pequeno", texto: "Excluir", onclick: () => {
        estado.extras = estado.extras.filter((e) => e.id !== item.id);
        delete estado.apoios[item.id];
        salvar();
        desenhar();
      } }));
    }
    return Dom.criar("article", { classe: "sug-card sug-extra" },
      Dom.criar("header", { classe: "sug-cab" }, Dom.criar("h3", { texto: item.nome }), Dom.criar("span", { classe: "selo", texto: "Sugestão do público" })),
      Dom.criar("p", { texto: item.motivo }), rodape);
  }

  function desenhar() {
    const itens = prontas.slice();
    if (ordem === "apoios") itens.sort((a, b) => apoiadores(b.id).length - apoiadores(a.id).length);
    el.lista.replaceChildren(...itens.map(cartaoPronto));
    el.extras.replaceChildren(...(estado.extras.length
      ? estado.extras.map(cartaoExtra)
      : [Dom.criar("p", { classe: "vazio", texto: textos.vazio })]));
  }

  el.ordem.addEventListener("change", () => { ordem = el.ordem.value; desenhar(); });

  el.form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    el.erro.textContent = "";
    const atual = window.DarkRoast.exigirLogin("Entre na sua conta para sugerir.");
    if (!atual) return;
    const nome = el.form.nome.value.trim();
    const motivo = el.form.motivo.value.trim();
    if (!nome || motivo.length < 10) { el.erro.textContent = "Preencha o nome e explique o motivo (pelo menos 10 letras)."; return; }
    const repetido = prontas.concat(estado.extras).some((i) => i.nome.toLowerCase() === nome.toLowerCase());
    if (repetido) { el.erro.textContent = "Essa ideia já está na lista. Que tal apoiá-la?"; return; }
    estado.extras.unshift({ id: Dados.criarId(), nome, motivo, autor: atual.nome, criadaEm: Date.now() });
    salvar();
    el.form.reset();
    desenhar();
    window.DarkRoast.aviso("Sugestão enviada. Obrigado!");
  });

  document.addEventListener("conta:mudou", desenhar);
  desenhar();
})();
