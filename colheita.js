// Armazém da colheita: a saca escolhida sobe e então abre a página do café
(function () {
  const pilha = document.querySelector(".pilha");
  if (!pilha) return;
  const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  pilha.addEventListener("click", (e) => {
    const saca = e.target.closest("a.saca");
    if (!saca || e.defaultPrevented || !cliqueComum(e)) return;
    marcarTransicao();
    if (reduz) return;
    e.preventDefault();
    pilha.classList.add("escolheu");
    saca.classList.add("escolhida");
    setTimeout(() => { location.href = saca.href; }, 420);
  });

  // voltando pelo botão "voltar" do navegador, as sacas voltam ao lugar
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    pilha.classList.remove("escolheu");
    pilha.querySelectorAll(".escolhida").forEach((s) => s.classList.remove("escolhida"));
  });
})();
