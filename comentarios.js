var form = document.getElementById("form-comentario");
var lista = document.getElementById("lista-comentarios");
var chave = "comentarios" + location.pathname;
var comentarios = JSON.parse(localStorage.getItem(chave)) || [];

function salvar() {
  localStorage.setItem(chave, JSON.stringify(comentarios));
}

function mostrar() {
  lista.innerHTML = "";
  comentarios.forEach(function (comentario, posicao) {
    var item = document.createElement("li");
    item.innerHTML = "<b></b><p></p><button>Excluir</button>";
    item.querySelector("b").textContent = comentario.nome;
    item.querySelector("p").textContent = comentario.texto;
    item.querySelector("button").onclick = function () {
      comentarios.splice(posicao, 1);
      salvar();
      mostrar();
    };
    lista.appendChild(item);
  });
}

form.onsubmit = function (evento) {
  evento.preventDefault();
  comentarios.unshift({ nome: form.nome.value, texto: form.texto.value });
  salvar();
  form.texto.value = "";
  mostrar();
};

mostrar();