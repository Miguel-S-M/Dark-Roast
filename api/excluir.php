<?php
// POST: apaga um preparo da vitrine. Só apaga se ele for do usuário informado.
// Corpo (JSON): { usuario, id }
require __DIR__ . '/conexao.php';
exigirMetodo('POST');

$dados = lerJson();
$usuario = usuarioValido($dados['usuario'] ?? null);
$id = filter_var($dados['id'] ?? null, FILTER_VALIDATE_INT);
if ($id === false || $id < 1) {
    responder(['ok' => false, 'erro' => 'Preparo inválido.'], 400);
}

$apaga = conectar()->prepare('DELETE FROM preparos WHERE id = ? AND usuario = ?');
$apaga->execute([$id, $usuario]);

if ($apaga->rowCount() === 0) {
    responder(['ok' => false, 'erro' => 'Preparo não encontrado.'], 404);
}
responder(['ok' => true]);
