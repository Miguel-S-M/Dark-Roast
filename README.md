# Dark Roast

Site sobre cafés exóticos: cultivo, colheita, torra, exportação, loja e o "Monte do seu jeito".

## Como rodar

O site é HTML, CSS e JS puros, **exceto a vitrine do "Monte do seu jeito"**, que guarda os preparos num banco SQL por meio de uma pequena API em PHP (pasta `api/`). Por isso é preciso abrir o site por um servidor PHP:

```
php -S localhost:8000
```

e acessar http://localhost:8000. Precisa do PHP 7 ou mais novo com a extensão `pdo_sqlite` (vem ativa na maioria das instalações).

Sem PHP (abrindo o `index.html` direto ou pelo GitHub Pages) tudo funciona, menos "Salvar preparo" e "Vitrine", que avisam que o servidor não executa PHP.

## Banco de dados

- Padrão: SQLite, no arquivo `dados/darkroast.sqlite`, criado sozinho na primeira vez. A tabela `preparos` está descrita em `api/schema.sql`.
- Para usar MySQL, troque o `DB_DSN` (e preencha usuário e senha) em `api/conexao.php`.
- A pasta `dados/` tem um `.htaccess` que bloqueia o download do banco no Apache. Em outros servidores (Nginx, ou o `php -S` de desenvolvimento) bloqueie o acesso a essa pasta por conta própria antes de publicar.

## API (pasta `api/`)

| Arquivo | Método | O que faz |
| --- | --- | --- |
| `salvar.php` | POST | guarda um preparo do usuário |
| `vitrine.php?usuario=...` | GET | lista os preparos guardados pelo usuário |
| `excluir.php` | POST | apaga um preparo do próprio usuário |

O `js` que chama a API está em `preparos.js` (usa `fetch`, ou seja, AJAX).

## Limites que vale conhecer

- As contas (login e senha) continuam guardadas no navegador, não no servidor. A API confia no nome de usuário que o site envia, então a vitrine **não é protegida contra quem forjar requisições**. Para algo além de um trabalho de faculdade, o login precisa ir para o servidor (sessão em PHP).
- O carrinho da loja continua no `localStorage`

