// ===== Contas de usuário (cadastro e login) guardadas no localStorage =====
// Sem back-end, tudo fica só neste navegador. A senha nunca é guardada: só um hash com sal.
const Contas = (function () {
  "use strict";
  const CHAVE_USUARIOS = "dr_usuarios";
  const CHAVE_SESSAO = "dr_sessao";
  const PADRAO_NOME = /^[\p{L}\p{N}_-]{3,20}$/u;

  function avisarMudanca() {
    document.dispatchEvent(new CustomEvent("conta:mudou"));
  }

  function gerarSal() {
    const bytes = new Uint8Array(8);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else bytes.forEach((_, i) => { bytes[i] = Math.floor(Math.random() * 256); });
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function gerarHash(sal, senha) {
    const texto = sal + ":" + senha;
    if (window.crypto && crypto.subtle) {
      const resumo = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(resumo), (b) => b.toString(16).padStart(2, "0")).join("");
    }
    let h = 5381; // plano B simples, para navegadores sem crypto.subtle
    for (const letra of texto) h = ((h << 5) + h + letra.codePointAt(0)) | 0;
    return "d" + (h >>> 0).toString(16);
  }

  function usuarioAtual() {
    const chave = Dados.ler(CHAVE_SESSAO, null);
    const conta = chave && Dados.ler(CHAVE_USUARIOS, {})[chave];
    return conta ? { chave, nome: conta.nome } : null;
  }

  async function cadastrar(nome, senha, confirmacao) {
    nome = String(nome).trim();
    if (!PADRAO_NOME.test(nome)) return { ok: false, erro: "O nome deve ter de 3 a 20 letras, números, _ ou -." };
    if (senha.length < 6) return { ok: false, erro: "A senha precisa de pelo menos 6 caracteres." };
    if (senha !== confirmacao) return { ok: false, erro: "As senhas não são iguais." };
    const usuarios = Dados.ler(CHAVE_USUARIOS, {});
    const chave = nome.toLowerCase();
    if (usuarios[chave]) return { ok: false, erro: "Esse nome já está em uso." };
    const sal = gerarSal();
    usuarios[chave] = { nome, sal, hash: await gerarHash(sal, senha), criadaEm: Date.now() };
    if (!Dados.gravar(CHAVE_USUARIOS, usuarios)) return { ok: false, erro: "Não foi possível salvar a conta neste navegador." };
    Dados.gravar(CHAVE_SESSAO, chave);
    avisarMudanca();
    return { ok: true };
  }

  async function entrar(nome, senha) {
    const chave = String(nome).trim().toLowerCase();
    const conta = Dados.ler(CHAVE_USUARIOS, {})[chave];
    if (!conta || (await gerarHash(conta.sal, senha)) !== conta.hash) {
      return { ok: false, erro: "Nome ou senha incorretos." };
    }
    Dados.gravar(CHAVE_SESSAO, chave);
    avisarMudanca();
    return { ok: true };
  }

  function sair() {
    try { localStorage.removeItem(CHAVE_SESSAO); } catch (erro) { /* sem armazenamento */ }
    avisarMudanca();
  }

  return { usuarioAtual, cadastrar, entrar, sair };
})();
