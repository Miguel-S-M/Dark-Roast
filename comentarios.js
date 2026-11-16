// Comentários da página inicial: criar e excluir, salvos no localStorage
(function () {
  "use strict";
  const form = document.getElementById("form-comentario");
  const lista = document.getElementById("lista-comentarios");
  const chave = "comentarios" + location.pathname;
  let comentarios = Dados.ler(chave, []);

  function mostrar() {
    lista.replaceChildren(...comentarios.map((comentario, posicao) =>
      Dom.criar("li", {},
        Dom.criar("strong", { texto: comentario.nome }),
        Dom.criar("p", { texto: comentario.texto }),
        Dom.criar("button", { type: "button", texto: "Excluir", onclick: () => {
          comentarios.splice(posicao, 1);
          Dados.gravar(chave, comentarios);
          mostrar();
        } }))));
  }

  // se a pessoa estiver logada, o nome já vem preenchido
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

  document.addEventListener("conta:mudou", preencherNome);
  preencherNome();
  mostrar();
})();
