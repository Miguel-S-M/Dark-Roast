// Ajudas comuns às páginas: localStorage, criação de elementos e um par de atalhos
const Dados = {
  ler(chave, padrao) {
    try {
      const valor = JSON.parse(localStorage.getItem(chave));
      return valor === null ? padrao : valor;
    } catch {
      return padrao;
    }
  },
  gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch {
      return false;
    }
  },
  existe(chave) {
    try {
      return localStorage.getItem(chave) !== null;
    } catch {
      return false;
    }
  },
  criarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  },
};

const Dom = {
  // Dom.criar("button", { classe: "x", texto: "Oi", onclick: fn }, filho1, filho2)
  criar(tag, props, ...filhos) {
    return Dom.montar(document.createElement(tag), props, filhos);
  },
  svg(tag, props, ...filhos) {
    return Dom.montar(document.createElementNS("http://www.w3.org/2000/svg", tag), props, filhos);
  },
  montar(elemento, props, filhos) {
    Object.entries(props || {}).forEach(([nome, valor]) => {
      if (valor === undefined || valor === null || valor === false) return;
      if (nome === "classe") elemento.setAttribute("class", valor);
      else if (nome === "texto") elemento.textContent = valor;
      else if (nome.startsWith("on")) elemento.addEventListener(nome.slice(2), valor);
      else elemento.setAttribute(nome, valor === true ? "" : valor);
    });
    filhos.flat(Infinity).forEach((filho) => {
      if (filho !== undefined && filho !== null && filho !== false) elemento.append(filho);
    });
    return elemento;
  },
  campo(rotulo, id, controle) {
    controle.id = id;
    return Dom.criar("div", { classe: "campo" }, Dom.criar("label", { for: id, texto: rotulo }), controle);
  },
};

// clique "normal": botão esquerdo, sem Ctrl/Cmd/Shift/Alt (esses abrem em nova aba ou janela)
function cliqueComum(evento) {
  return evento.button === 0 && !(evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey);
}

// as animações de saída avisam a próxima página, que mostra a imagem de entrada
function marcarTransicao() {
  try { sessionStorage.setItem("transicao", String(Date.now())); } catch { /* sem sessionStorage, segue sem a imagem */ }
}
