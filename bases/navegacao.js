// Navegação compartilhada do Dark Roast
// Registra a última página comum visitada.
// Loja, Enquetes e Comunidade preservam essa referência.

(function () {
    "use strict";

    const CHAVE_ORIGEM = "dr_pagina_anterior";

    const PAGINAS_ESPECIAIS = [
        "loja.html",
        "enquetes.html",
        "comunidade.html"
    ];

    const paginaAtual = new URL(window.location.href);

    const nomeArquivo = paginaAtual.pathname
        .split("/")
        .pop()
        .toLowerCase();

    const paginaEspecial = PAGINAS_ESPECIAIS.includes(nomeArquivo);

    function mesmaOrigem(url) {
        return url.protocol === paginaAtual.protocol &&
            url.host === paginaAtual.host;
    }

    function obterPaginaAnterior() {
        try {
            const salva = sessionStorage.getItem(CHAVE_ORIGEM);

            if (salva) {
                const url = new URL(salva);

                if (mesmaOrigem(url)) {
                    return url.href;
                }
            }
        } catch (erro) {
            console.warn("Erro ao recuperar página anterior:", erro);
        }

        // Alternativa caso não exista registro na sessão.
        if (document.referrer) {
            try {
                const anterior = new URL(document.referrer);

                const nomeAnterior = anterior.pathname
                    .split("/")
                    .pop()
                    .toLowerCase();

                if (
                    mesmaOrigem(anterior) &&
                    !PAGINAS_ESPECIAIS.includes(nomeAnterior)
                ) {
                    return anterior.href;
                }
            } catch (erro) {
                console.warn("Erro ao verificar página de origem:", erro);
            }
        }

        return null;
    }

    // Páginas comuns: registra a página atual.
    if (!paginaEspecial) {
        try {
            sessionStorage.setItem(
                CHAVE_ORIGEM,
                paginaAtual.href
            );
        } catch (erro) {
            console.warn("Erro ao salvar página atual:", erro);
        }

        return;
    }

    // Páginas especiais: configura o retorno.
    function configurarRetorno() {
        const linkRetorno = document.querySelector("a#voltar-variavel");

        if (!linkRetorno) {
            console.warn("Link de retorno não encontrado.");
            return;
        }

        const destino = obterPaginaAnterior();

        if (destino) {
            linkRetorno.href = destino;
            linkRetorno.textContent = "Voltar à página anterior";
            linkRetorno.hidden = false;
            console.log(document.querySelector("a#voltar-variavel"));
            
        } else {
            linkRetorno.hidden = true;
            console.log(document.querySelector("a#voltar-variavel"));
        }
        console.log(document.querySelector("a#voltar-variavel"));
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            configurarRetorno,
            { once: true }
        );
    } else {
        configurarRetorno();
    }
})();