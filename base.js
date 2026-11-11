// Parte comum a todas as páginas: barra da conta, janela "Sobre" e avisos
(function () {
  "use strict";
  // Troque pelos nomes do grupo
  const AUTORES = ["Nome do integrante 1", "Nome do integrante 2"];

  let dialogoLogin = null;
  let dialogoSobre = null;
  let aviso = null;
  let temporizador = null;
  let modo = "entrar";
  let resolverLogin = null;

  function criarDialogo(titulo, ...conteudo) {
    const dialogo = Dom.criar("dialog", { classe: "dr-dialogo", "aria-label": titulo },
      Dom.criar("div", { classe: "dr-dialogo-cab" },
        Dom.criar("h2", { texto: titulo }),
        Dom.criar("button", { type: "button", classe: "dr-fechar", "aria-label": "Fechar", texto: "×", onclick: () => dialogo.close() })),
      ...conteudo);
    dialogo.addEventListener("click", (evento) => { if (evento.target === dialogo) dialogo.close(); });
    document.body.append(dialogo);
    return dialogo;
  }

  function mostrarAviso(texto) {
    if (!aviso) {
      aviso = Dom.criar("div", { classe: "dr-aviso", role: "status" });
      document.body.append(aviso);
    }
    aviso.textContent = texto;
    aviso.classList.add("visivel");
    clearTimeout(temporizador);
    temporizador = setTimeout(() => aviso.classList.remove("visivel"), 3200);
  }

  function montarLogin() {
    const mensagem = Dom.criar("p", { classe: "dr-msg" });
    const erro = Dom.criar("p", { classe: "dr-erro", role: "alert" });
    const usuario = Dom.criar("input", { type: "text", name: "usuario", required: true, minlength: 3, maxlength: 20, autocomplete: "username" });
    const senha = Dom.criar("input", { type: "password", name: "senha", required: true, minlength: 6, autocomplete: "current-password" });
    const confirma = Dom.criar("input", { type: "password", name: "confirma", autocomplete: "new-password" });
    const blocoConfirma = Dom.campo("Repita a senha", "dr-confirma", confirma);
    const envio = Dom.criar("button", { type: "submit", classe: "botao", texto: "Entrar" });
    const abaEntrar = Dom.criar("button", { type: "button", role: "tab", classe: "dr-aba", texto: "Entrar" });
    const abaCriar = Dom.criar("button", { type: "button", role: "tab", classe: "dr-aba", texto: "Criar conta" });
    const form = Dom.criar("form", { classe: "dr-form", novalidate: true },
      Dom.campo("Nome de usuário", "dr-usuario", usuario),
      Dom.campo("Senha", "dr-senha", senha),
      blocoConfirma, erro, envio);

    function trocarModo(novo) {
      modo = novo;
      const criando = novo === "criar";
      abaEntrar.setAttribute("aria-selected", String(!criando));
      abaCriar.setAttribute("aria-selected", String(criando));
      blocoConfirma.hidden = !criando;
      confirma.required = criando;
      senha.autocomplete = criando ? "new-password" : "current-password";
      envio.textContent = criando ? "Criar conta" : "Entrar";
      erro.textContent = "";
    }
    abaEntrar.addEventListener("click", () => trocarModo("entrar"));
    abaCriar.addEventListener("click", () => trocarModo("criar"));

    form.addEventListener("submit", async (evento) => {
      evento.preventDefault();
      erro.textContent = "";
      const resultado = modo === "entrar"
        ? await Contas.entrar(usuario.value, senha.value)
        : await Contas.cadastrar(usuario.value, senha.value, confirma.value);
      if (!resultado.ok) { erro.textContent = resultado.erro; return; }
      const atual = Contas.usuarioAtual();
      form.reset();
      dialogoLogin.close();
      mostrarAviso(modo === "entrar" ? "Olá, " + atual.nome + "!" : "Conta criada. Você já está dentro, " + atual.nome + ".");
    });

    dialogoLogin = criarDialogo("Sua conta", mensagem,
      Dom.criar("div", { classe: "dr-abas", role: "tablist" }, abaEntrar, abaCriar), form);
    dialogoLogin.addEventListener("close", () => {
      if (resolverLogin) { resolverLogin(Contas.usuarioAtual()); resolverLogin = null; }
    });
    dialogoLogin.trocarModo = trocarModo;
    dialogoLogin.mensagem = mensagem;
  }

  function abrirLogin(texto, modoInicial) {
    if (!dialogoLogin) montarLogin();
    dialogoLogin.mensagem.textContent = texto || "";
    dialogoLogin.trocarModo(modoInicial || "entrar");
    dialogoLogin.showModal();
    return new Promise((resolver) => { resolverLogin = resolver; });
  }

  function abrirSobre() {
    if (!dialogoSobre) {
      dialogoSobre = criarDialogo("Sobre o Dark Roast",
        Dom.criar("p", { texto: "Dark Roast é uma aplicação web sobre cafés exóticos: do cultivo à xícara, passando pela colheita, pela torra e pela exportação." }),
        Dom.criar("p", { texto: "Você pode criar uma conta, votar e criar enquetes sobre a torra, e sugerir países para exportar e novos cafés para cultivar. Tudo fica salvo no seu navegador (web storage)." }),
        Dom.criar("h3", { texto: "Autores" }),
        Dom.criar("ul", { classe: "dr-autores" }, AUTORES.map((nome) => Dom.criar("li", { texto: nome }))),
        Dom.criar("p", { classe: "dr-nota", texto: "Trabalho Prático 2 de Web. Feito com HTML, CSS e JavaScript." }));
    }
    dialogoSobre.showModal();
  }

  function desenharBarras() {
    const usuario = Contas.usuarioAtual();
    const noCarrinho = typeof Carrinho === "undefined" ? 0 : Carrinho.quantidade();
    document.querySelectorAll("[data-conta]").forEach((caixa) => {
      const itens = [
        Dom.criar("a", { classe: "barra-link", href: "enquetes.html", "aria-current": location.pathname.endsWith("enquetes.html") ? "page" : null, texto: "Enquetes" }),
        Dom.criar("a", { classe: "barra-link", href: "loja.html", "aria-current": location.pathname.endsWith("loja.html") ? "page" : null, texto: noCarrinho ? "Loja (" + noCarrinho + ")" : "Loja" }),
        Dom.criar("button", { type: "button", classe: "barra-botao", texto: "Sobre", onclick: abrirSobre }),
      ];
      if (usuario) {
        itens.push(
          Dom.criar("span", { classe: "barra-usuario" }, "Olá, ", Dom.criar("strong", { texto: usuario.nome })),
          Dom.criar("button", { type: "button", classe: "barra-botao", texto: "Sair", onclick: () => { Contas.sair(); mostrarAviso("Você saiu da conta."); } }));
      } else {
        itens.push(Dom.criar("button", { type: "button", classe: "barra-botao destaque", texto: "Entrar", onclick: () => abrirLogin() }));
      }
      caixa.replaceChildren(...itens);
    });
  }

  document.addEventListener("conta:mudou", desenharBarras);
  document.addEventListener("banco:mudou", desenharBarras);
  desenharBarras();

  window.DarkRoast = {
    abrirLogin,
    aviso: mostrarAviso,
    // devolve o usuário logado; se não houver, abre a janela de login e devolve null
    exigirLogin(texto) {
      const usuario = Contas.usuarioAtual();
      if (!usuario) abrirLogin(texto);
      return usuario;
    },
  };
})();
