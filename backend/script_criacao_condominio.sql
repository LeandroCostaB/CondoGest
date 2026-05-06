-- Script SQL para PostgreSQL
-- Baseado no Diagrama de Entidade-Relacionamento e na estrutura fornecida

-- 1. Tabela de Usuários (Base para moradores e gestores)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo VARCHAR(50),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Condomínios
CREATE TABLE condominios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    endereco TEXT,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabela de Apartamentos
CREATE TABLE apartamentos (
    id SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    bloco VARCHAR(50),
    andar VARCHAR(50),
    condominio_id INTEGER NOT NULL REFERENCES condominios(id) ON DELETE CASCADE
);

-- 4. Tabela de Moradores
CREATE TABLE moradores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    apartamento_id INTEGER REFERENCES apartamentos(id) ON DELETE SET NULL,
    telefone VARCHAR(20),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabela de Prestadores de Serviço
CREATE TABLE prestadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    especialidade VARCHAR(100)
);

-- 6. Tabela de Tickets (Chamados/Ocorrências)
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    local VARCHAR(100),
    tipo VARCHAR(50),
    prioridade VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Aberto',
    apartamento_id INTEGER REFERENCES apartamentos(id) ON DELETE SET NULL,
    condominio_id INTEGER NOT NULL REFERENCES condominios(id) ON DELETE CASCADE,
    morador_id INTEGER REFERENCES moradores(id) ON DELETE SET NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Manutenções (Relacionada aos Tickets)
CREATE TABLE manutencoes (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    prestador_id INTEGER REFERENCES prestadores(id) ON DELETE SET NULL,
    status VARCHAR(50),
    valor DECIMAL(10, 2),
    data_execucao TIMESTAMP,
    observacao TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Manutenções Recorrentes (Calendário Preventivo)
CREATE TABLE manutencoes_recorrentes (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    periodicidade VARCHAR(50),
    proxima_execucao TIMESTAMP,
    condominio_id INTEGER NOT NULL REFERENCES condominios(id) ON DELETE CASCADE
);

-- 9. Tabela de Histórico de Status (Log de Auditoria)
CREATE TABLE historico_status (
    id SERIAL PRIMARY KEY,
    entidade VARCHAR(100) NOT NULL,
    entidade_id INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    alterado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criação de Índices para Otimização de Consultas
CREATE INDEX idx_tickets_condominio ON tickets(condominio_id);
CREATE INDEX idx_apartamentos_condominio ON apartamentos(condominio_id);
CREATE INDEX idx_manutencoes_ticket ON manutencoes(ticket_id);
CREATE INDEX idx_moradores_usuario ON moradores(usuario_id);
