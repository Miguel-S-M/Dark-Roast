# Dark Roast

Site de cafés exóticos. Tema: cafeteria minimalista japonesa (kissaten).

## Como abrir
Publique a pasta inteira no GitHub Pages (ou abra com um servidor local, por exemplo `python -m http.server`).
O mapa do cultivo e as fontes usam bibliotecas da internet (jsDelivr e Google Fonts), então precisa de conexão.

## Arquivos
- `index.html`, `index.css`, `index.js`: página inicial (seção Origem com os 4 portões).
- `animacoes.js`, `animacoes.css`: animação ao clicar num portão (o portão vai ao centro, a cena do portal entra e espera o clique).
- `desenhos.js`: desenhos em traço fino usados no mapa.
- `cultivo.html`, `cultivo.css`, `cultivo.js`: mapa-múndi em tela cheia com os pontos dos cafés.
- `colheita.html`, `torra.html`, `exportacao.html`, `etapa.css`: páginas das outras etapas (ainda em preparo).
- `KopiLuwak.html`, `BlackIvory.html`, `JacuBird.html`, `Geisha.html`, `SantaHelena.html`, `BlueMountain.html`: páginas dos cafés (ainda vazias).
- `ilustracoes/cena/`: as 4 cenas do portal (troque pelas versões em alta resolução mantendo os nomes).
- `ilustracoes/png/`: imagens usadas nas animações.
- `ilustracoes/fontes-svg/`: desenhos originais em SVG (só para edição).

## Ajustes rápidos
- `animacoes.js`: `ESPERAR_CLIQUE = false` faz a página abrir sozinha depois da animação.
- `cultivo.js`: lista `CAFES` (lugar, textos de produção e ambiente, desenho de cada café).
