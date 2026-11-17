
// Comentários da página inicial: criar e excluir, salvos no localStorage
(function () {
  "use strict";

  const form = document.getElementById("form-comentario");
  const lista = document.getElementById("lista-comentarios");

  // Elementos que exibem a quantidade de caracteres
  const contadorNome = document.getElementById("contador-nome");
  const contadorTexto = document.getElementById("contador-texto");

  const chave = "comentarios" + location.pathname;
  let comentarios = Dados.ler(chave, []);

  // Conta quantos caracteres existem em cada campo
  function atualizarContadores() {
    contadorNome.textContent =
      `${form.nome.value.length} / 60 caracteres`;

    contadorTexto.textContent =
      `${form.texto.value.length} / 600 caracteres`;
  }

  function mostrar() {
    lista.replaceChildren(...comentarios.map((comentario, posicao) =>
      Dom.criar("li", {},
        Dom.criar("strong", { texto: comentario.nome }),
        Dom.criar("p", { texto: comentario.texto }),
        Dom.criar("button", {
          type: "button",
          texto: "Excluir",
          onclick: () => {
            comentarios.splice(posicao, 1);
            Dados.gravar(chave, comentarios);
            mostrar();
          }
        })
      )
    ));
  }

  // Se a pessoa estiver logada, o nome já vem preenchido
  function preencherNome() {
    const atual = Contas.usuarioAtual();

    if (atual) form.nome.value = atual.nome;

    // Atualiza o contador caso o nome seja preenchido automaticamente
    atualizarContadores();
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = form.nome.value.trim();
    const texto = form.texto.value.trim();
    if (!nome || !texto) {
      form.nome.classList.toggle("campo-invalido", !nome);
      form.texto.classList.toggle("campo-invalido", !texto);

      form.nome.setAttribute("aria-invalid", String(!nome));
      form.texto.setAttribute("aria-invalid", String(!texto));

      if (!nome) form.nome.focus();
      else form.texto.focus();

      return;
    }
    form.nome.classList.remove("campo-invalido");
    form.texto.classList.remove("campo-invalido");

    form.nome.setAttribute("aria-invalid", "false");
    form.texto.setAttribute("aria-invalid", "false");

    form.nome.value = nome;
    form.texto.value = texto;

    comentarios.unshift({ nome, texto });
    Dados.gravar(chave, comentarios);

    form.texto.value = "";
    atualizarContadores();

    mostrar();
  });

  [form.nome, form.texto].forEach((campo) => {
    campo.addEventListener("input", () => {
      if (campo.value.trim()) {
        campo.classList.remove("campo-invalido");
        campo.setAttribute("aria-invalid", "false");
      }
    });
  });

  form.nome.addEventListener("input", atualizarContadores);
  form.texto.addEventListener("input", atualizarContadores);

  document.addEventListener("conta:mudou", preencherNome);

  preencherNome();
  mostrar();

})();
