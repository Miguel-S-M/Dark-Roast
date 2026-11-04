// ===== Enquetes da torra: categorias com cor, votação por conta, gráfico e filtro =====
// Tudo fica no localStorage. Cada conta vota uma vez por enquete e pode trocar o voto.
(function () {
  "use strict";
  const CHAVE_CATEGORIAS = "dr_enquete_categorias";
  const CHAVE_ENQUETES = "dr_enquetes";
  const ID_PREFERENCIA = "preferencia-torra";
  const MIN_OPCOES = 2;
  const MAX_OPCOES = 6;
  const PADRAO_COR = /^#[0-9a-f]{6}$/i;

  let categorias = Dados.ler(CHAVE_CATEGORIAS, null);
  let enquetes = Dados.ler(CHAVE_ENQUETES, null);
  let filtro = "todas";

  const el = {
    resumo: document.getElementById("resumo"),
    categorias: document.getElementById("categorias"),
    lista: document.getElementById("lista"),
    titulo: document.getElementById("titulo-lista"),
    formCategoria: document.getElementById("form-categoria"),
    erroCategoria: document.getElementById("erro-categoria"),
    formEnquete: document.getElementById("form-enquete"),
    erroEnquete: document.getElementById("erro-enquete"),
    selectCategoria: document.getElementById("enquete-categoria"),
    opcoesForm: document.getElementById("opcoes-form"),
  };

  // ----- Dados iniciais (só na primeira visita) -----
  function enqueteInicial(id, pergunta, categoriaId, opcoes, contagens) {
    const votos = {};
    let n = 0;
    contagens.forEach((quantos, indice) => {
      for (let i = 0; i < quantos; i++) votos["convidado-" + ++n] = indice;
    });
    return { id, pergunta, categoriaId, opcoes, votos, autor: "Dark Roast", criadaEm: Date.now() - 86400000 * (contagens.length + 2) };
  }

  if (!categorias) {
    categorias = [
      { id: "nivel", nome: "Nível da torra", cor: "#b2312a" },
      { id: "sabor", nome: "Sabor", cor: "#c58b2a" },
      { id: "preparo", nome: "Preparo", cor: "#3f7a63" },
    ];
    Dados.gravar(CHAVE_CATEGORIAS, categorias);
  }
  if (!enquetes) {
    enquetes = [
      enqueteInicial(ID_PREFERENCIA, "Qual torra você prefere?", "nivel", ["Clara", "Média", "Escura"], [5, 9, 4]),
      enqueteInicial("cafe-torra-clara", "Qual café fica melhor em torra clara?", "nivel", ["Geisha", "Santa Helena", "Blue Mountain", "Jacu Bird"], [8, 4, 3, 2]),
      enqueteInicial("acido-ou-chocolate", "Você prefere um café mais ácido ou mais achocolatado?", "sabor", ["Mais ácido e frutado", "Mais achocolatado", "Equilibrado"], [4, 7, 6]),
      enqueteInicial("como-toma", "Como você prepara o seu café?", "preparo", ["Coado", "Espresso", "Prensa francesa", "Cold brew"], [9, 5, 3, 2]),
    ];
    Dados.gravar(CHAVE_ENQUETES, enquetes);
  }

  // ----- Ajudas -----
  const salvar = () => { Dados.gravar(CHAVE_CATEGORIAS, categorias); Dados.gravar(CHAVE_ENQUETES, enquetes); };
  const categoriaDe = (id) => categorias.find((c) => c.id === id);
  const usuario = () => Contas.usuarioAtual();

  function contagem(enquete) {
    const total = enquete.opcoes.map(() => 0);
    Object.values(enquete.votos).forEach((indice) => { if (total[indice] !== undefined) total[indice]++; });
    return total;
  }

  function corDoTexto(hex) {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? "#1d1b19" : "#ffffff";
  }

  function aplicarCor(elemento, categoria) {
    const cor = categoria ? categoria.cor : "#a0968a";
    elemento.style.setProperty("--cat", cor);
    elemento.style.setProperty("--selo-texto", corDoTexto(cor));
  }

  // ----- Gráfico de barras em SVG -----
  function grafico(enquete) {
    const totais = contagem(enquete);
    const soma = totais.reduce((a, b) => a + b, 0);
    const alturaLinha = 34;
    const largura = 560;
    const svg = Dom.svg("svg", { viewBox: "0 0 " + largura + " " + enquete.opcoes.length * alturaLinha, role: "img",
      "aria-label": "Resultado: " + enquete.opcoes.map((o, i) => o + ", " + totais[i] + (totais[i] === 1 ? " voto" : " votos")).join("; ") });
    const barras = [];
    enquete.opcoes.forEach((opcao, i) => {
      const y = i * alturaLinha;
      const percentual = soma ? Math.round((totais[i] / soma) * 100) : 0;
      const rotulo = opcao.length > 22 ? opcao.slice(0, 21) + "…" : opcao;
      const barra = Dom.svg("rect", { classe: "g-barra", x: 180, y: y + 8, height: 18, rx: 2 });
      barras.push([barra, soma ? (totais[i] / soma) * 300 : 0]);
      svg.append(
        Dom.svg("text", { classe: "g-rotulo", x: 0, y: y + 22 }, Dom.svg("title", { texto: opcao }), document.createTextNode(rotulo)),
        Dom.svg("rect", { classe: "g-trilho", x: 180, y: y + 8, width: 300, height: 18, rx: 2 }),
        barra,
        Dom.svg("text", { classe: "g-valor", x: largura, y: y + 22, "text-anchor": "end", texto: totais[i] + " (" + percentual + "%)" }));
    });
    requestAnimationFrame(() => requestAnimationFrame(() => barras.forEach(([barra, w]) => barra.setAttribute("width", w))));
    return Dom.criar("figure", { classe: "enquete-grafico" }, svg,
      Dom.criar("figcaption", { texto: soma + (soma === 1 ? " voto no total" : " votos no total") }));
  }

  // ----- Votar, compartilhar e excluir -----
  function votar(enquete, indice) {
    const atual = window.DarkRoast.exigirLogin("Entre na sua conta para votar.");
    if (!atual) return;
    if (enquete.votos[atual.chave] === indice) delete enquete.votos[atual.chave]; // clicar de novo tira o voto
    else enquete.votos[atual.chave] = indice;
    salvar();
    desenhar();
  }

  function codificar(enquete) {
    const categoria = categoriaDe(enquete.categoriaId) || { nome: "Sem categoria", cor: "#a0968a" };
    const json = JSON.stringify({ p: enquete.pergunta, o: enquete.opcoes, c: categoria.nome, k: categoria.cor });
    return btoa(unescape(encodeURIComponent(json)));
  }

  function compartilhar(enquete) {
    const endereco = location.href.split("#")[0] + "#enquete=" + codificar(enquete);
    const copiar = navigator.clipboard ? navigator.clipboard.writeText(endereco) : Promise.reject();
    copiar.then(() => window.DarkRoast.aviso("Link copiado. Quem abrir recebe a enquete para votar."))
      .catch(() => window.prompt("Copie o link da enquete:", endereco));
  }

  function importarDoLink() {
    const trecho = location.hash.match(/^#enquete=(.+)$/);
    if (!trecho) return;
    history.replaceState(null, "", location.pathname + location.search);
    try {
      const dados = JSON.parse(decodeURIComponent(escape(atob(trecho[1]))));
      const opcoes = Array.isArray(dados.o) ? dados.o.map((o) => String(o).slice(0, 60)).filter(Boolean) : [];
      if (typeof dados.p !== "string" || !dados.p.trim() || opcoes.length < MIN_OPCOES || opcoes.length > MAX_OPCOES) throw new Error("enquete inválida");
      const nomeCategoria = String(dados.c || "Compartilhadas").slice(0, 24);
      let categoria = categorias.find((c) => c.nome.toLowerCase() === nomeCategoria.toLowerCase());
      if (!categoria) {
        categoria = { id: Dados.criarId(), nome: nomeCategoria, cor: PADRAO_COR.test(dados.k) ? dados.k : "#7a5af8" };
        categorias.push(categoria);
      }
      const igual = enquetes.some((e) => e.pergunta === dados.p && e.categoriaId === categoria.id && e.opcoes.join("|") === opcoes.join("|"));
      if (!igual) {
        enquetes.unshift({ id: Dados.criarId(), pergunta: dados.p.slice(0, 120), categoriaId: categoria.id, opcoes, votos: {}, autor: "enviada por link", criadaEm: Date.now() });
        salvar();
      }
      filtro = "todas";
      setTimeout(() => window.DarkRoast.aviso(igual ? "Você já tem essa enquete." : "Enquete recebida por link!"), 300);
    } catch (erro) {
      setTimeout(() => window.DarkRoast.aviso("Esse link de enquete não é válido."), 300);
    }
  }

  function botaoExcluir(enquete) {
    let esperando = false;
    const botao = Dom.criar("button", { type: "button", classe: "botao claro pequeno", texto: "Excluir" });
    botao.addEventListener("click", () => {
      if (!esperando) {
        esperando = true;
        botao.textContent = "Clique de novo para excluir";
        setTimeout(() => { esperando = false; botao.textContent = "Excluir"; }, 3000);
        return;
      }
      enquetes = enquetes.filter((e) => e.id !== enquete.id);
      salvar();
      desenhar();
    });
    return botao;
  }

  // ----- Desenho da página -----
  function cartao(enquete) {
    const categoria = categoriaDe(enquete.categoriaId);
    const atual = usuario();
    const meuVoto = atual ? enquete.votos[atual.chave] : undefined;
    const artigo = Dom.criar("article", { classe: "enquete" });
    aplicarCor(artigo, categoria);
    const rodape = Dom.criar("div", { classe: "enquete-rodape" },
      Dom.criar("button", { type: "button", classe: "botao claro pequeno", texto: "Compartilhar", onclick: () => compartilhar(enquete) }));
    if (atual && atual.nome === enquete.autor) rodape.append(botaoExcluir(enquete));

    artigo.append(
      Dom.criar("div", { classe: "enquete-cab" },
        Dom.criar("span", { classe: "selo", texto: categoria ? categoria.nome : "Sem categoria" }),
        Dom.criar("span", { classe: "enquete-meta", texto: "por " + enquete.autor + " · " + new Date(enquete.criadaEm).toLocaleDateString("pt-BR") })),
      Dom.criar("h3", { texto: enquete.pergunta }),
      Dom.criar("div", { classe: "enquete-opcoes", role: "group", "aria-label": "Escolha uma opção para votar" },
        enquete.opcoes.map((opcao, i) => Dom.criar("button", { type: "button", classe: "chip", "aria-pressed": String(meuVoto === i), texto: opcao, onclick: () => votar(enquete, i) }))),
      grafico(enquete), rodape);
    return artigo;
  }

  function desenharCategorias() {
    const atual = usuario();
    const botoes = [Dom.criar("button", { type: "button", classe: "chip", "aria-pressed": String(filtro === "todas"), texto: "Todas (" + enquetes.length + ")", onclick: () => { filtro = "todas"; desenhar(); } })];
    categorias.forEach((categoria) => {
      const usadas = enquetes.filter((e) => e.categoriaId === categoria.id).length;
      const chip = Dom.criar("button", { type: "button", classe: "chip", "aria-pressed": String(filtro === categoria.id), texto: categoria.nome + " (" + usadas + ")", onclick: () => { filtro = categoria.id; desenhar(); } });
      aplicarCor(chip, categoria);
      const grupo = Dom.criar("span", { classe: "chip-grupo" }, chip);
      if (atual && usadas === 0) {
        grupo.append(Dom.criar("button", { type: "button", classe: "chip-x", "aria-label": "Excluir a categoria " + categoria.nome, texto: "×", onclick: () => {
          categorias = categorias.filter((c) => c.id !== categoria.id);
          if (filtro === categoria.id) filtro = "todas";
          salvar();
          desenhar();
        } }));
      }
      botoes.push(grupo);
    });
    el.categorias.replaceChildren(...botoes);
    el.selectCategoria.replaceChildren(...categorias.map((c) => Dom.criar("option", { value: c.id, texto: c.nome })));
  }

  function desenharResumo() {
    const pergunta = enquetes.find((e) => e.id === ID_PREFERENCIA);
    if (!pergunta) { el.resumo.textContent = ""; return; }
    const totais = contagem(pergunta);
    const soma = totais.reduce((a, b) => a + b, 0);
    if (!soma) { el.resumo.textContent = ""; return; }
    const lider = totais.indexOf(Math.max(...totais));
    const atual = usuario();
    const meu = atual ? pergunta.votos[atual.chave] : undefined;
    const frase = ["A torra preferida da comunidade é a ", Dom.criar("strong", { texto: pergunta.opcoes[lider].toLowerCase() }),
      " (" + Math.round((totais[lider] / soma) * 100) + "%)."];
    if (meu !== undefined) frase.push(" A sua é a ", Dom.criar("strong", { texto: pergunta.opcoes[meu].toLowerCase() }), ".");
    el.resumo.replaceChildren(...frase);
  }

  function desenhar() {
    desenharCategorias();
    desenharResumo();
    const visiveis = enquetes.filter((e) => filtro === "todas" || e.categoriaId === filtro);
    const categoria = categoriaDe(filtro);
    el.titulo.textContent = filtro === "todas" ? "Todas as enquetes" : "Categoria: " + (categoria ? categoria.nome : "");
    el.lista.replaceChildren(...(visiveis.length
      ? visiveis.map(cartao)
      : [Dom.criar("p", { classe: "vazio", texto: "Nenhuma enquete nessa categoria ainda. Que tal criar a primeira?" })]));
  }

  // ----- Formulários -----
  function campoOpcao(valor) {
    const entrada = Dom.criar("input", { type: "text", maxlength: 60, "aria-label": "Opção", value: valor || "" });
    const linha = Dom.criar("div", { classe: "opcao-form" }, entrada,
      Dom.criar("button", { type: "button", classe: "botao claro pequeno", "aria-label": "Remover opção", texto: "×", onclick: () => {
        if (el.opcoesForm.children.length > MIN_OPCOES) linha.remove();
      } }));
    return linha;
  }

  document.getElementById("mais-opcao").addEventListener("click", () => {
    if (el.opcoesForm.children.length < MAX_OPCOES) el.opcoesForm.append(campoOpcao());
  });

  el.formCategoria.addEventListener("submit", (evento) => {
    evento.preventDefault();
    el.erroCategoria.textContent = "";
    if (!window.DarkRoast.exigirLogin("Entre na sua conta para criar categorias.")) return;
    const nome = el.formCategoria.nome.value.trim();
    if (!nome) { el.erroCategoria.textContent = "Dê um nome para a categoria."; return; }
    if (categorias.some((c) => c.nome.toLowerCase() === nome.toLowerCase())) { el.erroCategoria.textContent = "Já existe uma categoria com esse nome."; return; }
    categorias.push({ id: Dados.criarId(), nome, cor: el.formCategoria.cor.value });
    salvar();
    el.formCategoria.reset();
    desenhar();
    window.DarkRoast.aviso("Categoria criada.");
  });

  el.formEnquete.addEventListener("submit", (evento) => {
    evento.preventDefault();
    el.erroEnquete.textContent = "";
    const atual = window.DarkRoast.exigirLogin("Entre na sua conta para criar enquetes.");
    if (!atual) return;
    const pergunta = el.formEnquete.pergunta.value.trim();
    const opcoes = Array.from(el.opcoesForm.querySelectorAll("input"), (i) => i.value.trim()).filter(Boolean);
    if (!pergunta) { el.erroEnquete.textContent = "Escreva a pergunta."; return; }
    if (new Set(opcoes.map((o) => o.toLowerCase())).size < MIN_OPCOES) { el.erroEnquete.textContent = "Coloque pelo menos duas opções diferentes."; return; }
    enquetes.unshift({ id: Dados.criarId(), pergunta, categoriaId: el.selectCategoria.value, opcoes, votos: {}, autor: atual.nome, criadaEm: Date.now() });
    salvar();
    el.formEnquete.reset();
    el.opcoesForm.replaceChildren(campoOpcao(), campoOpcao());
    filtro = "todas";
    desenhar();
    window.DarkRoast.aviso("Enquete publicada!");
  });

  el.opcoesForm.append(campoOpcao(), campoOpcao());
  document.addEventListener("conta:mudou", desenhar);
  importarDoLink();
  desenhar();
})();
