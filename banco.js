// "Banco de dados" do site. O site é estático (GitHub Pages) e não tem servidor, então as tabelas
// ficam no localStorage deste navegador. Cada linha guarda o dono (usuario), e o carrinho só mostra
// o que é da conta logada. Se um dia entrar um servidor de verdade, só este arquivo muda.
const Banco = (function () {
  const PREFIXO = "dr_bd_";

  function tabela(nome) {
    const chave = PREFIXO + nome;
    const ler = () => Dados.ler(chave, []);

    function gravar(linhas) {
      const ok = Dados.gravar(chave, linhas);
      if (ok) document.dispatchEvent(new CustomEvent("banco:mudou", { detail: { tabela: nome } }));
      return ok;
    }

    return {
      listar: (filtro) => (filtro ? ler().filter(filtro) : ler()),
      achar: (filtro) => ler().find(filtro) || null,
      inserir(dados) {
        const linha = { id: Dados.criarId(), criadaEm: Date.now(), ...dados };
        return gravar(ler().concat(linha)) ? linha : null;
      },
      atualizar(id, mudancas) {
        let nova = null;
        const linhas = ler().map((l) => (l.id === id ? (nova = { ...l, ...mudancas }) : l));
        return nova && gravar(linhas) ? nova : null;
      },
      // apaga todas as linhas que passam no filtro e devolve quantas foram
      remover(filtro) {
        const linhas = ler();
        const sobra = linhas.filter((l) => !filtro(l));
        if (sobra.length === linhas.length || !gravar(sobra)) return 0;
        return linhas.length - sobra.length;
      },
    };
  }

  return { tabela };
})();

const Carrinho = (function () {
  const KG_MIN = 0.05;
  const KG_MAX = 50;
  const carrinho = () => Banco.tabela("carrinho");
  const dono = () => { const u = Contas.usuarioAtual(); return u ? u.chave : null; };
  const limitar = (kg) => Math.min(KG_MAX, Math.max(KG_MIN, Math.round(kg * 1000) / 1000));
  const precoKg = (cafeId) => window.CAFES_EXTRA[cafeId].preco;

  function itens() {
    const d = dono();
    return d ? carrinho().listar((i) => i.usuario === d) : [];
  }

  function adicionar(cafeId, kg) {
    const d = dono();
    if (!d || !window.CAFES_EXTRA[cafeId]) return null;
    const atual = carrinho().achar((i) => i.usuario === d && i.cafeId === cafeId);
    return atual
      ? carrinho().atualizar(atual.id, { kg: limitar(atual.kg + kg) })
      : carrinho().inserir({ usuario: d, cafeId, kg: limitar(kg) });
  }

  function mudar(id, kg) {
    const d = dono();
    if (!d || !carrinho().achar((i) => i.id === id && i.usuario === d)) return null;
    return carrinho().atualizar(id, { kg: limitar(kg) });
  }

  function remover(id) {
    const d = dono();
    return d ? carrinho().remover((i) => i.id === id && i.usuario === d) : 0;
  }

  function esvaziar() {
    const d = dono();
    return d ? carrinho().remover((i) => i.usuario === d) : 0;
  }

  function total() {
    return itens().reduce((soma, i) => soma + i.kg * precoKg(i.cafeId), 0);
  }

  // não existe pagamento: o pedido só fica registrado no histórico da conta
  function finalizar() {
    const d = dono();
    const lista = itens();
    if (!d || !lista.length) return null;
    const pedido = Banco.tabela("pedidos").inserir({
      usuario: d,
      itens: lista.map((i) => ({ cafeId: i.cafeId, kg: i.kg, precoKg: precoKg(i.cafeId) })),
      total: total(),
    });
    if (pedido) esvaziar();
    return pedido;
  }

  function pedidos() {
    const d = dono();
    return d ? Banco.tabela("pedidos").listar((p) => p.usuario === d).reverse() : [];
  }

  return { KG_MIN, KG_MAX, precoKg, itens, quantidade: () => itens().length, adicionar, mudar, remover, esvaziar, total, finalizar, pedidos };
})();
