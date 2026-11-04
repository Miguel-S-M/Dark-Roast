// Se o visitante veio de uma cena (mapa, armazém ou fornalha), a página do café mostra a imagem de entrada.
// Este arquivo roda antes de a página aparecer, para não piscar.
try {
  var hora = Number(sessionStorage.getItem("transicao"));
  if (hora && Date.now() - hora < 6000) document.documentElement.classList.add("vindo-do-mapa");
} catch (erro) { /* sem sessionStorage: segue sem a imagem de entrada */ }
