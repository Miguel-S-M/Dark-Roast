// ===== Comentários da página inicial: criar e excluir, salvos no localStorage =====
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
  function preencherNome() {
    const atual = Contas.usuarioAtual();
    if (atual) form.nome.value = atual.nome;
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    comentarios.unshift({ nome: form.nome.value.trim(), texto: form.texto.value.trim() });
    Dados.gravar(chave, comentarios);
    form.texto.value = "";
    mostrar();
  });

  document.addEventListener("conta:mudou", preencherNome);
  preencherNome();
  mostrar();
})();
