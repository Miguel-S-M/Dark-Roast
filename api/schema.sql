-- Tabela da vitrine. A API cria sozinha na primeira chamada; este arquivo serve para conferir ou
-- para criar na mão. Versão MySQL (no SQLite, troque a primeira linha de colunas por
-- "id INTEGER PRIMARY KEY AUTOINCREMENT").
CREATE TABLE IF NOT EXISTS preparos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(40) NOT NULL,
    cafe_id VARCHAR(20) NOT NULL,
    torra VARCHAR(10) NOT NULL,
    torrado VARCHAR(20) NOT NULL,
    coado VARCHAR(20) NOT NULL,
    base VARCHAR(20) NOT NULL,
    extras VARCHAR(100) NOT NULL DEFAULT '',
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_preparos_usuario ON preparos (usuario);
