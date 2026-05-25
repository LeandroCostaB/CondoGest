-- =============================================================================
-- CondoGest — Seed Script
-- Execução: após os serviços subirem (tabelas criadas pelo Drizzle)
--   docker exec -i condogest-postgres psql -U condogest -d condogest_core < docker/postgres/seed.sql
--
-- Para ambiente limpo (recria tudo do zero):
--   docker compose down -v && docker compose up -d
--   # aguardar serviços subirem (~15s)
--   docker exec -i condogest-postgres psql -U condogest -d condogest_core < docker/postgres/seed.sql
--
-- Todos os usuários têm senha: senha123
-- Senhas hashadas com bcrypt (cost=10)
-- =============================================================================

-- =============================================================================
-- condogest_core
-- =============================================================================
\c condogest_core

-- ----------------------------------------------------------------------------
-- Usuários
-- SINDICO  : sindico@condogest.com  / senha123
-- MORADOR 1: joao@condogest.com     / senha123
-- MORADOR 2: maria@condogest.com    / senha123
-- ----------------------------------------------------------------------------
INSERT INTO users (id, nome, email, senha, role) VALUES
  (
    'f9714ea4-6c37-434f-87b3-1bacab49002e',
    'Admin Síndico',
    'sindico@condogest.com',
    '$2b$10$ee3qjOOFb2ItCGW1jPWDKu.nARfjIlPCUA2rWupisKq.PJsklbmfa',
    'SINDICO'
  ),
  (
    '24b8e62f-4c7a-4481-b07c-329664c9e194',
    'João Morador',
    'joao@condogest.com',
    '$2b$10$wvAjPb/1NIbi2DiYXTMEI.KEZQNN2EelX.B.ru8NvajmvLchEdCTu',
    'MORADOR'
  ),
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Maria Moradora',
    'maria@condogest.com',
    '$2b$10$wvAjPb/1NIbi2DiYXTMEI.KEZQNN2EelX.B.ru8NvajmvLchEdCTu',
    'MORADOR'
  )
ON CONFLICT (id) DO UPDATE SET
  nome  = EXCLUDED.nome,
  email = EXCLUDED.email,
  senha = EXCLUDED.senha,
  role  = EXCLUDED.role;

-- ----------------------------------------------------------------------------
-- Condomínio
-- ----------------------------------------------------------------------------
INSERT INTO condominium (id, name, address, user_id, status) VALUES
  (
    'fe8692cb-8a62-4d2a-909b-124d60dac753',
    'Residencial Aurora',
    'Rua das Flores, 100 - Vila Madalena - São Paulo/SP',
    'f9714ea4-6c37-434f-87b3-1bacab49002e',
    'active'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Apartamentos
-- ----------------------------------------------------------------------------
INSERT INTO apartment (id, number, block, floor, condominium_id) VALUES
  (
    'a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce',
    '101', 'A', 1,
    'fe8692cb-8a62-4d2a-909b-124d60dac753'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    '201', 'A', 2,
    'fe8692cb-8a62-4d2a-909b-124d60dac753'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-012345678902',
    '102', 'B', 1,
    'fe8692cb-8a62-4d2a-909b-124d60dac753'
  ),
  (
    'd4e5f6a7-b8c9-0123-def0-123456789012',
    '202', 'B', 2,
    'fe8692cb-8a62-4d2a-909b-124d60dac753'
  )
ON CONFLICT (id) DO UPDATE SET
  number         = EXCLUDED.number,
  block          = EXCLUDED.block,
  floor          = EXCLUDED.floor,
  condominium_id = EXCLUDED.condominium_id;


-- =============================================================================
-- condogest_tickets
-- =============================================================================
\c condogest_tickets

-- ----------------------------------------------------------------------------
-- Snapshots (espelho dos dados do core-service)
-- ----------------------------------------------------------------------------
INSERT INTO residents_snapshot (id, nome, email, role) VALUES
  ('f9714ea4-6c37-434f-87b3-1bacab49002e', 'Admin Síndico',   'sindico@condogest.com', 'SINDICO'),
  ('24b8e62f-4c7a-4481-b07c-329664c9e194', 'João Morador',    'joao@condogest.com',    'MORADOR'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maria Moradora',  'maria@condogest.com',   'MORADOR')
ON CONFLICT (id) DO UPDATE SET
  nome      = EXCLUDED.nome,
  email     = EXCLUDED.email,
  role      = EXCLUDED.role,
  synced_at = now();

INSERT INTO condominiums_snapshot (id, name, address, status) VALUES
  (
    'fe8692cb-8a62-4d2a-909b-124d60dac753',
    'Residencial Aurora',
    'Rua das Flores, 100 - Vila Madalena - São Paulo/SP',
    'active'
  )
ON CONFLICT (id) DO UPDATE SET
  name      = EXCLUDED.name,
  address   = EXCLUDED.address,
  status    = EXCLUDED.status,
  synced_at = now();

INSERT INTO apartments_snapshot (id, number, block, floor, condominium_id) VALUES
  ('a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce', '101', 'A', 1, 'fe8692cb-8a62-4d2a-909b-124d60dac753'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '201', 'A', 2, 'fe8692cb-8a62-4d2a-909b-124d60dac753'),
  ('c3d4e5f6-a7b8-9012-cdef-012345678902', '102', 'B', 1, 'fe8692cb-8a62-4d2a-909b-124d60dac753'),
  ('d4e5f6a7-b8c9-0123-def0-123456789012', '202', 'B', 2, 'fe8692cb-8a62-4d2a-909b-124d60dac753')
ON CONFLICT (id) DO UPDATE SET
  number         = EXCLUDED.number,
  block          = EXCLUDED.block,
  floor          = EXCLUDED.floor,
  condominium_id = EXCLUDED.condominium_id,
  synced_at      = now();

-- ----------------------------------------------------------------------------
-- Prestadores de serviço
-- ----------------------------------------------------------------------------
INSERT INTO providers (id, name, phone, specialty) VALUES
  (
    'e5f6a7b8-c9d0-1234-ef01-234567890123',
    'Encanamentos Total',
    '(11) 98888-0001',
    'PLUMBER'
  ),
  (
    'f6a7b8c9-d0e1-2345-f012-345678901234',
    'Elétrica Rápida',
    '(11) 98888-0002',
    'ELECTRICIAN'
  ),
  (
    'a7b8c9d0-e1f2-3456-0123-456789012345',
    'Pintura & Arte',
    '(11) 98888-0003',
    'PAINTER'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Tickets
-- João  → apt 101A → Vazamento na cozinha  (OPEN)
-- João  → apt 201A → Curto circuito        (IN_PROGRESS)
-- Maria → apt 102B → Infiltração no teto   (RESOLVED)
-- ----------------------------------------------------------------------------
INSERT INTO tickets (id, title, description, location, status, resident_id, apartment_id) VALUES
  (
    'b8c9d0e1-f2a3-4567-1234-567890123456',
    'Vazamento na cozinha',
    'Torneira com vazamento constante, água escorrendo pelo armário.',
    'Cozinha',
    'OPEN',
    '24b8e62f-4c7a-4481-b07c-329664c9e194',
    'a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce'
  ),
  (
    'c9d0e1f2-a3b4-5678-2345-678901234567',
    'Curto circuito no quarto',
    'Tomada do quarto está faiscando ao ligar qualquer aparelho.',
    'Quarto principal',
    'IN_PROGRESS',
    '24b8e62f-4c7a-4481-b07c-329664c9e194',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'
  ),
  (
    'd0e1f2a3-b4c5-6789-3456-789012345678',
    'Infiltração no teto da sala',
    'Mancha de umidade crescendo após as chuvas da semana passada.',
    'Sala de estar',
    'RESOLVED',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'c3d4e5f6-a7b8-9012-cdef-012345678902'
  )
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Manutenções
-- M1 → ticket do vazamento   + encanador    → SCHEDULED
-- M2 → ticket do curto       + eletricista  → IN_PROGRESS
-- M3 → ticket da infiltração + eletricista  → COMPLETED
-- ----------------------------------------------------------------------------
INSERT INTO maintenances (id, ticket_id, provider_id, status, value, execution_date) VALUES
  (
    'e1f2a3b4-c5d6-7890-4567-890123456789',
    'b8c9d0e1-f2a3-4567-1234-567890123456',
    'e5f6a7b8-c9d0-1234-ef01-234567890123',
    'SCHEDULED',
    350.00,
    now() + interval '7 days'
  ),
  (
    'f2a3b4c5-d6e7-8901-5678-901234567890',
    'c9d0e1f2-a3b4-5678-2345-678901234567',
    'f6a7b8c9-d0e1-2345-f012-345678901234',
    'IN_PROGRESS',
    480.00,
    now() + interval '2 days'
  ),
  (
    'a3b4c5d6-e7f8-9012-6789-012345678901',
    'd0e1f2a3-b4c5-6789-3456-789012345678',
    'f6a7b8c9-d0e1-2345-f012-345678901234',
    'COMPLETED',
    1200.50,
    now() - interval '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- Sumário
-- =============================================================================
\c condogest_core
SELECT 'users'        AS tabela, count(*) AS total FROM users
UNION ALL
SELECT 'condominium',            count(*)          FROM condominium
UNION ALL
SELECT 'apartment',              count(*)          FROM apartment;

\c condogest_tickets
SELECT 'providers'            AS tabela, count(*) AS total FROM providers
UNION ALL
SELECT 'tickets',                         count(*)          FROM tickets
UNION ALL
SELECT 'maintenances',                    count(*)          FROM maintenances
UNION ALL
SELECT 'residents_snapshot',              count(*)          FROM residents_snapshot
UNION ALL
SELECT 'condominiums_snapshot',           count(*)          FROM condominiums_snapshot
UNION ALL
SELECT 'apartments_snapshot',             count(*)          FROM apartments_snapshot;
