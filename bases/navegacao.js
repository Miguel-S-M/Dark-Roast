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

    function identificarTexto(link) {
        const pagina = link.split("/").pop().split("?")[0].toLowerCase();
        const parametros = link.includes("?") ? link.split("?")[1] : "";

        // Páginas simples
        if (!parametros) {
            const nomesPaginas = {
                "cultivo.html": "Volte ao mapa",
                "colheita.html": "Volte ao armazém",
                "torra.html": "Volte à fornalha",
                "exportacao.html": "Volte ao porto",
                "monte.html": "Volte a preparar seu próprio café"
            };

            if (nomesPaginas[pagina]) {
                return nomesPaginas[pagina];
            }
        }

        // Página de café
        if (pagina === "cafe.html") {
            const etapa = parametros.split("&").find(p => p.startsWith("e="))?.split("=")[1];
            const cafe = parametros.split("&").find(p => p.startsWith("c="))?.split("=")[1];

            const nomesCafes = {
                "black-ivory": "Black Ivory",
                "blue-mountain": "Blue Mountain",
                "jacu-bird": "Jacu Bird"
            };

            const nomesEtapas = {
                "cultivo": "cultivo",
                "colheita": "colheita",
                "torra": "torra"
            };

            if (nomesCafes[cafe] && nomesEtapas[etapa]) {
                return `Voltar ao ${nomesEtapas[etapa]} de ${nomesCafes[cafe]}`;
            }
        }

        // Página de sugestões
        if (pagina === "sugestoes.html") {
            const tipo = parametros.split("&").find(p => p.startsWith("t="))?.split("=")[1];

            if (tipo === "caf%C3%A9s" || tipo === "cafés") {
                return "Voltar às sugestões de cafés";
            }

            if (tipo === "pa%C3%ADses" || tipo === "países") {
                return "Voltar às sugestões de países para exportar";
            }
        }

        return "Voltar à página anterior";
    }

    // Páginas especiais: configura o retorno.
    function configurarRetorno() {
        const linkRetorno = document.querySelector("a#voltar-variavel");

        if (!linkRetorno) {
            console.warn("Link de retorno não encontrado.");
            return;
        }

        const destino = obterPaginaAnterior();

        if (destino && destino.includes("index.html#origem")) {
            linkRetorno.hidden = true;
            return;
        } else if (destino) {
            linkRetorno.href = destino;
            linkRetorno.textContent = identificarTexto(linkRetorno.href);
            linkRetorno.hidden = false;   
        } else {
            linkRetorno.hidden = true; 
        }
        
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