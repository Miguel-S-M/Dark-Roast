// Fala com a API em PHP (pasta api/) por AJAX: guardar, listar e excluir os preparos da conta.
// O usuário vem do login do site; a API só aceita os valores previstos para cada escolha.
const Preparos = (function () {
  const PASTA = "api/";

  async function chamar(arquivo, opcoes) {
    let resposta;
    try {
      resposta = await fetch(PASTA + arquivo, opcoes);
    } catch {
      throw new Error("Não consegui falar com o servidor. Abra o site por um servidor PHP (por exemplo: php -S localhost:8000).");
    }
    let dados;
    try {
      dados = await resposta.json();
    } catch {
      throw new Error("Este servidor não executa PHP. Abra o site com php -S localhost:8000 (o GitHub Pages não roda PHP).");
    }
    if (!dados.ok) throw new Error(dados.erro || "Erro no servidor.");
    return dados;
  }

  function usuario() {
    const conta = Contas.usuarioAtual();
    if (!conta) throw new Error("Entre na sua conta para usar a vitrine.");
    return conta.chave;
  }

  const enviar = (corpo) => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

  return {
    salvar(est) {
      return chamar("salvar.php", enviar({
        usuario: usuario(), cafeId: est.cafeId, torra: est.torra, torrado: est.torrado.id, coado: est.coado.id, base: est.base, extras: est.extras,
      }));
    },
    async listar() {
      return (await chamar("vitrine.php?usuario=" + encodeURIComponent(usuario()))).preparos;
    },
    excluir(id) {
      return chamar("excluir.php", enviar({ usuario: usuario(), id }));
    },
  };
})();
