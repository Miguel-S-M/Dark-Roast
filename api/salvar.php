<?php
// POST: guarda um preparo na vitrine do usuário.
// Corpo (JSON): { usuario, cafeId, torra, torrado, coado, base, extras: [] }
require __DIR__ . '/conexao.php';
exigirMetodo('POST');

$dados = lerJson();
$usuario = usuarioValido($dados['usuario'] ?? null);
$cafe = escolha($dados['cafeId'] ?? null, 'cafe');
$torra = escolha($dados['torra'] ?? null, 'torra');
$torrado = escolha($dados['torrado'] ?? null, 'torrado');
$coado = escolha($dados['coado'] ?? null, 'coado');
$base = escolha($dados['base'] ?? null, 'base');

$extras = $dados['extras'] ?? [];
if (!is_array($extras)) {
    responder(['ok' => false, 'erro' => 'Valor inválido em extras.'], 400);
}
foreach ($extras as $extra) {
    escolha($extra, 'extras');
}
$extras = array_values(array_unique($extras));

$pdo = conectar();

$conta = $pdo->prepare('SELECT COUNT(*) FROM preparos WHERE usuario = ?');
$conta->execute([$usuario]);
if ((int) $conta->fetchColumn() >= MAX_PREPAROS_POR_USUARIO) {
    responder(['ok' => false, 'erro' => 'Você já guardou ' . MAX_PREPAROS_POR_USUARIO . ' preparos. Exclua algum na vitrine para guardar outro.'], 409);
}

$insere = $pdo->prepare(
    'INSERT INTO preparos (usuario, cafe_id, torra, torrado, coado, base, extras) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
$insere->execute([$usuario, $cafe, $torra, $torrado, $coado, $base, implode(',', $extras)]);

responder(['ok' => true, 'id' => (int) $pdo->lastInsertId()], 201);
