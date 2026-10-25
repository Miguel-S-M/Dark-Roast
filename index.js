
(function () {
  const portoes = document.querySelectorAll("button.portao");
  portoes.forEach((portao) => {
    portao.addEventListener("click", () => {
      portoes.forEach((outro) => {
        const ativo = outro === portao;
        outro.setAttribute("aria-pressed", ativo);
        document.getElementById(outro.dataset.painel).hidden = !ativo;
      });
    });
  });
})();
