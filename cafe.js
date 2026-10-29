// ===== Páginas de cada café: limpa o aviso da transição que veio do mapa =====
(function () {
  try { sessionStorage.removeItem("transicao"); } catch (e) {}
  const entrada = document.querySelector(".entrada");
  if (entrada) entrada.addEventListener("animationend", () => entrada.remove());
})();
