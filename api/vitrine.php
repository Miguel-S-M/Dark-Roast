<?php
// GET: devolve todos os preparos guardados pelo usuário, do mais novo para o mais antigo.
// Exemplo: api/vitrine.php?usuario=maria
require __DIR__ . '/conexao.php';
exigirMetodo('GET');

$usuario = usuarioValido($_GET['usuario'] ?? null);

$busca = conectar()->prepare(
    'SELECT id, cafe_id, torra, torrado, coado, base, extras, criado_em FROM preparos WHERE usuario = ? ORDER BY id DESC'
);
$busca->execute([$usuario]);

$preparos = [];
foreach ($busca->fetchAll() as $linha) {
    $preparos[] = [
        'id' => (int) $linha['id'],
        'cafeId' => $linha['cafe_id'],
        'torra' => $linha['torra'],
        'torrado' => $linha['torrado'],
        'coado' => $linha['coado'],
        'base' => $linha['base'],
        'extras' => $linha['extras'] === '' ? [] : explode(',', $linha['extras']),
        'criadoEm' => $linha['criado_em'],
    ];
}

responder(['ok' => true, 'preparos' => $preparos]);
