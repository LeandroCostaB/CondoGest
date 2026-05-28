-- Senha: "senha123" — hash bcrypt cost=10
-- sindico@condogest.com / senha123
-- joao@condogest.com / senha123
-- maria@condogest.com / senha123

INSERT INTO "users" ("id", "nome", "email", "senha", "role", "created_at", "updated_at")
VALUES
  ('f9714ea4-6c37-434f-87b3-1bacab49002e', 'Admin Síndico',  'sindico@condogest.com', '$2b$10$ee3qjOOFb2ItCGW1jPWDKu.nARfjIlPCUA2rWupisKq.PJsklbmfa', 'SINDICO', NOW(), NOW()),
  ('24b8e62f-4c7a-4481-b07c-329664c9e194', 'João Morador',   'joao@condogest.com',    '$2b$10$wvAjPb/1NIbi2DiYXTMEI.KEZQNN2EelX.B.ru8NvajmvLchEdCTu', 'MORADOR', NOW(), NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Maria Moradora', 'maria@condogest.com',   '$2b$10$wvAjPb/1NIbi2DiYXTMEI.KEZQNN2EelX.B.ru8NvajmvLchEdCTu', 'MORADOR', NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;
--> statement-breakpoint
INSERT INTO "condominium" ("id", "name", "address", "user_id", "status", "created_at", "updated_at")
VALUES
  ('fe8692cb-8a62-4d2a-909b-124d60dac753', 'Residencial Aurora', 'Rua das Flores, 100 - Vila Madalena - São Paulo/SP', 'f9714ea4-6c37-434f-87b3-1bacab49002e', 'active', NOW(), NOW())
ON CONFLICT DO NOTHING;
--> statement-breakpoint
INSERT INTO "apartment" ("id", "number", "block", "floor", "condominium_id", "user_id", "created_at", "updated_at")
VALUES
  ('a9dd0e45-dbfb-4b34-a41e-3d12cfb1f1ce', '101', 'A', 1, 'fe8692cb-8a62-4d2a-909b-124d60dac753', '24b8e62f-4c7a-4481-b07c-329664c9e194', NOW(), NOW()),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', '201', 'A', 2, 'fe8692cb-8a62-4d2a-909b-124d60dac753', NULL,                                    NOW(), NOW()),
  ('c3d4e5f6-a7b8-9012-cdef-012345678902', '102', 'B', 1, 'fe8692cb-8a62-4d2a-909b-124d60dac753', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', NOW(), NOW()),
  ('d4e5f6a7-b8c9-0123-def0-123456789012', '202', 'B', 2, 'fe8692cb-8a62-4d2a-909b-124d60dac753', NULL,                                    NOW(), NOW())
ON CONFLICT DO NOTHING;
