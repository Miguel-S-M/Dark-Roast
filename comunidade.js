const CHAVE_PUBLICACOES = "dr_comunidade_publicacoes";

const formulario = document.getElementById("form-publicacao");
const campoTitulo = document.getElementById("titulo-publicacao");
const campoTexto = document.getElementById("texto-publicacao");
const campoCategoria = document.getElementById("categoria-publicacao");
const listaPublicacoes = document.getElementById("lista-publicacoes");
const areaCategorias = document.getElementById("categorias");
const resumo = document.getElementById("resumo");
const mensagemErro = document.getElementById("erro-publicacao");
const contadorCaracteres = document.getElementById("contador-caracteres");

function atualizarContador() {
  contadorCaracteres.textContent =
    `${campoTexto.value.length}/1000 caracteres`;
}

campoTexto.addEventListener("input", atualizarContador);
atualizarContador();

const categorias = [
  "Todas",
  "Geral",
  "Cafés",
  "Cultivo",
  "Torra",
  "Dicas"
];

let publicacoes = [];
let categoriaAtual = "Todas";

function usuarioAtual() {
  return Contas.usuarioAtual();
}

function exigirUsuario() {
  const usuario = usuarioAtual();

  if (!usuario) {
    window.DarkRoast.abrirLogin(
      "Entre ou crie uma conta para participar da comunidade."
    );
    return null;
  }

  return usuario;
}

function salvarPublicacoes() {
  try {
    const salvou = Dados.gravar(CHAVE_PUBLICACOES, publicacoes);

    if (!salvou) {
      window.DarkRoast.aviso(
        "Não foi possível salvar as alterações."
      );
    }

    return salvou;
  } catch (erro) {
    console.error("Erro ao salvar publicações:", erro);

    window.DarkRoast.aviso(
      "Ocorreu um erro ao salvar as publicações."
    );

    return false;
  }
}

function formatarData(data) {
  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Data não disponível";
  }

  return dataFormatada.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function criarElemento(tag, propriedades, ...filhos) {
  return Dom.criar(tag, propriedades, ...filhos);
}

async function carregarPublicacoes() {
  const salvas = Dados.ler(CHAVE_PUBLICACOES, null);

  if (Array.isArray(salvas)) {
  publicacoes = salvas.map(normalizarPublicacao);
  renderizar();
  return;
}

  try {
    const resposta = await fetch("publicacoes.json");

    if (!resposta.ok) {
      throw new Error("Não foi possível carregar o arquivo JSON.");
    }

    const dados = await resposta.json();

    publicacoes = Array.isArray(dados)
      ? dados.map(normalizarPublicacao)
      : [];

    salvarPublicacoes();
  } catch (erro) {
    console.error("Erro ao carregar publicações:", erro);
    publicacoes = [];
  }

  renderizar();
}

function normalizarPublicacao(post) {
  if (!post || typeof post !== "object" || Array.isArray(post)) {
    post = {};
  }

  return {
    id: post.id || Dados.criarId(),
    titulo: post.titulo || "Sem título",
    texto: post.texto || "",
    categoria: post.categoria || "Geral",
    usuario: post.usuario || "visitante",
    autor: post.autor || "Visitante",
    criadaEm: post.criadaEm || Date.now(),
    curtidas: Array.isArray(post.curtidas)
      ? post.curtidas
      : [],
    comentarios: Array.isArray(post.comentarios)
      ? post.comentarios
      : []
  };
}

function renderizarCategorias() {
  areaCategorias.replaceChildren();

  categorias.forEach(categoria => {
    const botao = criarElemento("button", {
      type: "button",
      classe: "chip",
      "aria-pressed": categoriaAtual === categoria,
      texto: categoria,
      onclick: () => {
        categoriaAtual = categoria;
        renderizar();
      }
    });

    areaCategorias.append(botao);
  });
}

formulario.addEventListener("submit", evento => {
  evento.preventDefault();

  mensagemErro.textContent = "";

  const usuario = exigirUsuario();

  if (!usuario) return;

  const titulo = campoTitulo.value.trim();
  const texto = campoTexto.value.trim();
  const categoria = campoCategoria.value;

  if (!titulo || !texto) {
    mensagemErro.textContent =
      "Preencha o título e o texto da publicação.";
    return;
  }

  const novaPublicacao = {
    id: Dados.criarId(),
    titulo,
    texto,
    categoria,
    usuario: usuario.chave,
    autor: usuario.nome,
    criadaEm: Date.now(),
    curtidas: [],
    comentarios: []
  };

  publicacoes.unshift(novaPublicacao);

  if (!salvarPublicacoes()) {
    publicacoes.shift();
    return;
  }

 formulario.reset();
atualizarContador();
categoriaAtual = "Todas";

  renderizar();

  window.DarkRoast.aviso("Publicação criada com sucesso!");
});

function alternarCurtida(id) {
  const usuario = exigirUsuario();

  if (!usuario) return;

  const post = publicacoes.find(item => item.id === id);

  if (!post) return;

  if (!Array.isArray(post.curtidas)) {
    post.curtidas = [];
  }

  const indice = post.curtidas.indexOf(usuario.chave);

  if (indice >= 0) {
    post.curtidas.splice(indice, 1);
  } else {
    post.curtidas.push(usuario.chave);
  }

  if (!salvarPublicacoes()) {
    if (indice >= 0) {
      post.curtidas.push(usuario.chave);
    } else {
      post.curtidas.pop();
    }

    return;
  }

  renderizar();
}

renderizar();

function excluirPublicacao(id) {
  const usuario = exigirUsuario();

  if (!usuario) return;

  const indice = publicacoes.findIndex(post => post.id === id);

  if (indice < 0) return;

  const post = publicacoes[indice];

  if (post.usuario !== usuario.chave) {
    window.DarkRoast.aviso(
      "Você só pode excluir suas próprias publicações."
    );
    return;
  }

  const confirmou = window.confirm(
    "Tem certeza de que deseja excluir esta publicação?"
  );

  if (!confirmou) return;

  const removida = publicacoes.splice(indice, 1)[0];

  if (!salvarPublicacoes()) {
    publicacoes.splice(indice, 0, removida);
    return;
  }

  renderizar();

  window.DarkRoast.aviso("Publicação excluída.");
}

function adicionarComentario(id, campo) {
  const usuario = exigirUsuario();

  if (!usuario) return;

  const texto = campo.value.trim();

  if (!texto) return;

  const post = publicacoes.find(item => item.id === id);

  if (!post) return;

  if (!Array.isArray(post.comentarios)) {
    post.comentarios = [];
  }

  post.comentarios.push({
    id: Dados.criarId(),
    usuario: usuario.chave,
    autor: usuario.nome,
    texto,
    criadaEm: Date.now()
  });

 if (!salvarPublicacoes()) {
  post.comentarios.pop();
  return;
}

campo.value = "";
renderizar();

function criarPublicacao(post) {
  const usuario = usuarioAtual();

  const curtidas = Array.isArray(post.curtidas)
    ? post.curtidas
    : [];

  const comentarios = Array.isArray(post.comentarios)
    ? post.comentarios
    : [];

  const curtiu = usuario
    ? curtidas.includes(usuario.chave)
    : false;

  const cartao = criarElemento("article", {
    classe: "publicacao"
  });

  const titulo = criarElemento("h3", {
    texto: post.titulo
  });

  const texto = criarElemento("p", {
    texto: post.texto
  });

  const meta = criarElemento("p", {
    classe: "publicacao-meta",
    texto: `${post.autor} · ${post.categoria} · ${formatarData(post.criadaEm)}`
  });

  const acoes = criarElemento("div", {
    classe: "publicacao-acoes"
  });

  const botaoCurtir = criarElemento("button", {
    type: "button",
    texto: `${curtiu ? "♥ Curtido" : "♡ Curtir"} (${curtidas.length})`,
    onclick: () => alternarCurtida(post.id)
  });

  acoes.append(botaoCurtir);

  if (usuario && post.usuario === usuario.chave) {
    const botaoExcluir = criarElemento("button", {
      type: "button",
      texto: "Excluir",
      onclick: () => excluirPublicacao(post.id)
    });

    acoes.append(botaoExcluir);
  }

  cartao.append(titulo, meta, texto, acoes);

  const areaComentarios = criarElemento("div", {
    classe: "comentarios"
  });

  const tituloComentarios = criarElemento("h4", {
    texto: `Comentários (${comentarios.length})`
  });

  areaComentarios.append(tituloComentarios);

 comentarios
  .filter(comentario =>
    comentario && typeof comentario === "object"
  )
  .forEach(comentario => {
    const item = criarElemento("div", {
      classe: "comentario"
    });

    const autor = criarElemento("strong", {
      texto: comentario.autor || "Visitante"
    });

    const mensagem = criarElemento("p", {
      texto: comentario.texto || ""
    });

    item.append(autor, mensagem);
    areaComentarios.append(item);
  });

  const formularioComentario = criarElemento("form", {
    classe: "form-comentario",
    onsubmit: evento => {
      evento.preventDefault();
      adicionarComentario(post.id, campoComentario);
    }
  });

  const campoComentario = criarElemento("input", {
    type: "text",
    maxlength: "300",
    placeholder: "Escreva um comentário...",
    required: true,
    "aria-label": "Escreva um comentário"
  });

  const botaoComentar = criarElemento("button", {
    type: "submit",
    texto: "Comentar"
  });

  formularioComentario.append(campoComentario, botaoComentar);
  areaComentarios.append(formularioComentario);
  cartao.append(areaComentarios);

  return cartao;
}

function renderizar() {
  listaPublicacoes.replaceChildren();

  renderizarCategorias();

  const filtradas = publicacoes
    .filter(post => {
      return categoriaAtual === "Todas" ||
        post.categoria === categoriaAtual;
    })
    .sort((a, b) => {
      return new Date(b.criadaEm) - new Date(a.criadaEm);
    });

  resumo.textContent =
    `${filtradas.length} publicação(ões) encontrada(s).`;

  if (filtradas.length === 0) {
    const vazio = criarElemento("p", {
      classe: "vazio",
      texto: "Ainda não há publicações nesta categoria. Que tal começar?"
    });

    listaPublicacoes.append(vazio);
    return;
  }

  filtradas.forEach(post => {
    listaPublicacoes.append(criarPublicacao(post));
  });
}

carregarPublicacoes();
