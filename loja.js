// Loja: calculadora de preço por quilo, carrinho e histórico de pedidos da conta logada.
// Os dados ficam no "banco" (banco.js); aqui só se desenha a tela.
(function () {
  "use strict";
  const GRAMAS_POR_XICARA = 10;
  const dinheiro = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const numero = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 });

  const nomeDe = (id) => window.CAFES.find((c) => c.id === id).nome;
  const el = {
    form: document.getElementById("form-calculo"),
    erro: document.getElementById("erro-calculo"),
    qtd: document.getElementById("calc-qtd"),
    unidade: document.getElementById("calc-unid"),
    resultado: document.getElementById("resultado"),
    carrinho: document.getElementById("carrinho"),
    pedidos: document.getElementById("pedidos"),
  };

  const seletor = Dom.criar("select", {}, window.CAFES.map((c) => Dom.criar("option", { value: c.id, texto: c.nome + " · " + c.lugar })));
  document.getElementById("campo-cafe").append(Dom.campo("Café", "calc-cafe", seletor));
  const pedido = new URLSearchParams(location.search).get("c");
  if (window.CAFES_EXTRA[pedido]) seletor.value = pedido;

  function quilosDoForm() {
    const n = Number(el.qtd.value);
    return el.unidade.value === "g" ? n / 1000 : n;
  }

  function quilosValidos(kg) {
    return Number.isFinite(kg) && kg >= Carrinho.KG_MIN && kg <= Carrinho.KG_MAX;
  }

  function desenharCalculo() {
    const kg = quilosDoForm();
    const precoKg = Carrinho.precoKg(seletor.value);
    el.erro.textContent = "";
    if (!quilosValidos(kg)) {
      el.erro.textContent = "Use de 50 g até 50 kg.";
      el.resultado.replaceChildren();
      return;
    }
    const linhas = [
      ["Preço por quilo", dinheiro.format(precoKg)],
      ["Total", dinheiro.format(kg * precoKg)],
      ["Dá para fazer", "cerca de " + Math.floor(kg * 1000 / GRAMAS_POR_XICARA) + " xícaras"],
      ["Cada xícara", dinheiro.format(precoKg * GRAMAS_POR_XICARA / 1000)],
    ];
    el.resultado.replaceChildren(...linhas.map(([nome, valor]) =>
      Dom.criar("div", {}, Dom.criar("dt", { texto: nome }), Dom.criar("dd", { texto: valor }))));
  }

  function linhaDoCarrinho(item) {
    const campo = Dom.criar("input", { type: "number", "aria-label": "Quilos de " + nomeDe(item.cafeId), min: Carrinho.KG_MIN, max: Carrinho.KG_MAX, step: "0.05", value: item.kg });
    campo.addEventListener("change", () => {
      const kg = Number(campo.value);
      if (quilosValidos(kg)) Carrinho.mudar(item.id, kg);
      else window.DarkRoast.aviso("Use de 0,05 kg até 50 kg.");
      desenhar();
    });
    return Dom.criar("div", { classe: "carrinho-linha" },
      Dom.criar("strong", { texto: nomeDe(item.cafeId) }),
      Dom.criar("label", { classe: "carrinho-kg" }, campo, " kg"),
      Dom.criar("span", { texto: dinheiro.format(item.kg * Carrinho.precoKg(item.cafeId)) }),
      Dom.criar("button", { type: "button", classe: "botao claro pequeno", "aria-label": "Remover " + nomeDe(item.cafeId), texto: "×", onclick: () => { Carrinho.remover(item.id); desenhar(); } }));
  }

  function desenharCarrinho() {
    if (!Contas.usuarioAtual()) {
      el.carrinho.replaceChildren(
        Dom.criar("p", { classe: "vazio", texto: "Entre na sua conta para ter um carrinho." }),
        Dom.criar("button", { type: "button", classe: "botao", texto: "Entrar", onclick: () => window.DarkRoast.abrirLogin("Entre para usar o carrinho.") }));
      return;
    }
    const itens = Carrinho.itens();
    if (!itens.length) {
      el.carrinho.replaceChildren(Dom.criar("p", { classe: "vazio", texto: "Carrinho vazio. Calcule um café e adicione." }));
      return;
    }
    el.carrinho.replaceChildren(
      ...itens.map(linhaDoCarrinho),
      Dom.criar("p", { classe: "carrinho-total" }, "Total ", Dom.criar("strong", { texto: dinheiro.format(Carrinho.total()) })),
      Dom.criar("div", { classe: "carrinho-acoes" },
        Dom.criar("button", { type: "button", classe: "botao claro", texto: "Esvaziar", onclick: () => { Carrinho.esvaziar(); desenhar(); } }),
        Dom.criar("button", { type: "button", classe: "botao", texto: "Finalizar pedido", onclick: finalizar })));
  }

  function finalizar() {
    const feito = Carrinho.finalizar();
    window.DarkRoast.aviso(feito ? "Pedido registrado." : "Não foi possível registrar o pedido neste navegador.");
    desenhar();
  }

  function desenharPedidos() {
    const lista = Carrinho.pedidos();
    if (!lista.length) {
      el.pedidos.replaceChildren(Dom.criar("p", { classe: "vazio", texto: Contas.usuarioAtual() ? "Nenhum pedido ainda." : "Entre na sua conta para ver seus pedidos." }));
      return;
    }
    el.pedidos.replaceChildren(...lista.map((p) =>
      Dom.criar("article", { classe: "pedido" },
        Dom.criar("header", {}, Dom.criar("strong", { texto: new Date(p.criadaEm).toLocaleDateString("pt-BR") }), Dom.criar("span", { texto: dinheiro.format(p.total) })),
        Dom.criar("ul", {}, p.itens.map((i) => Dom.criar("li", { texto: nomeDe(i.cafeId) + " · " + numero.format(i.kg) + " kg" }))))));
  }

  function desenhar() {
    desenharCarrinho();
    desenharPedidos();
  }

  el.form.addEventListener("input", desenharCalculo);
  el.form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const kg = quilosDoForm();
    if (!quilosValidos(kg)) { desenharCalculo(); return; }
    if (!window.DarkRoast.exigirLogin("Entre na sua conta para usar o carrinho.")) return;
    Carrinho.adicionar(seletor.value, kg);
    window.DarkRoast.aviso(nomeDe(seletor.value) + " entrou no carrinho.");
    desenhar();
  });

  document.addEventListener("conta:mudou", desenhar);
  desenharCalculo();
  desenhar();
})();
