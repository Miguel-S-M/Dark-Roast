<?php
// Conexão com o banco e funções comuns da API do Dark Roast (PHP 7.0 ou mais novo).
// Por padrão usa SQLite: o banco é um arquivo só, sem instalar nada (precisa da extensão pdo_sqlite,
// que na maioria das instalações já vem ativa). Para usar MySQL, troque o DB_DSN e preencha usuário e senha.
define('DB_DSN', 'sqlite:' . __DIR__ . '/../dados/darkroast.sqlite');
// define('DB_DSN', 'mysql:host=localhost;dbname=darkroast;charset=utf8mb4');
define('DB_USUARIO', null);
define('DB_SENHA', null);
define('MAX_PREPAROS_POR_USUARIO', 50);

// o que cada campo pode valer; qualquer coisa fora dessas listas é recusada
const OPCOES = [
    'cafe' => ['kopi-luwak', 'black-ivory', 'jacu-bird', 'geisha', 'santa-helena', 'blue-mountain'],
    'torra' => ['clara', 'media', 'escura'],
    'torrado' => ['ponto', 'faltou-pouco', 'crua', 'passou-pouco', 'queimou'],
    'coado' => ['equilibrada', 'fraca', 'forte'],
    'base' => ['agua', 'leite', 'achocolatado', 'energetico'],
    'extras' => ['acucar', 'caramelo', 'chantilly', 'canela', 'sorvete', 'limao'],
];

function responder(array $dados, $codigo = 200)
{
    http_response_code($codigo);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

// qualquer erro inesperado (banco fora do ar, arquivo sem permissão...) vira uma resposta JSON,
// e o detalhe vai só para o log do servidor
set_exception_handler(function ($erro) {
    error_log('Dark Roast API: ' . $erro->getMessage());
    responder(['ok' => false, 'erro' => 'Erro no servidor. Tente de novo.'], 500);
});

function conectar()
{
    static $pdo = null;
    if ($pdo !== null) {
        return $pdo;
    }

    $pasta = __DIR__ . '/../dados';
    if (strpos(DB_DSN, 'sqlite:') === 0 && !is_dir($pasta)) {
        mkdir($pasta, 0775, true);
    }

    $pdo = new PDO(DB_DSN, DB_USUARIO, DB_SENHA, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // a única diferença entre SQLite e MySQL aqui é como se declara a chave que se numera sozinha
    $chave = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite'
        ? 'INTEGER PRIMARY KEY AUTOINCREMENT'
        : 'INT AUTO_INCREMENT PRIMARY KEY';

    $pdo->exec(
        'CREATE TABLE IF NOT EXISTS preparos (
            id ' . $chave . ',
            usuario VARCHAR(40) NOT NULL,
            cafe_id VARCHAR(20) NOT NULL,
            torra VARCHAR(10) NOT NULL,
            torrado VARCHAR(20) NOT NULL,
            coado VARCHAR(20) NOT NULL,
            base VARCHAR(20) NOT NULL,
            extras VARCHAR(100) NOT NULL DEFAULT \'\',
            criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )'
    );
    return $pdo;
}

function exigirMetodo($metodo)
{
    if ($_SERVER['REQUEST_METHOD'] !== $metodo) {
        header('Allow: ' . $metodo);
        responder(['ok' => false, 'erro' => 'Método não permitido.'], 405);
    }
}

function lerJson()
{
    $dados = json_decode(file_get_contents('php://input'), true);
    if (!is_array($dados)) {
        responder(['ok' => false, 'erro' => 'Dados inválidos.'], 400);
    }
    return $dados;
}

// mesma regra do cadastro (contas.js): de 3 a 20 letras, números, _ ou -
function usuarioValido($valor)
{
    if (!is_string($valor) || !preg_match('/^[\p{L}\p{N}_-]{3,20}$/uD', $valor)) {
        responder(['ok' => false, 'erro' => 'Usuário inválido.'], 400);
    }
    return function_exists('mb_strtolower') ? mb_strtolower($valor, 'UTF-8') : strtolower($valor);
}

function escolha($valor, $campo)
{
    if (!is_string($valor) || !in_array($valor, OPCOES[$campo], true)) {
        responder(['ok' => false, 'erro' => 'Valor inválido em ' . $campo . '.'], 400);
    }
    return $valor;
}
