-- Seed: providers iniciais

INSERT INTO "providers" ("id", "name", "phone", "specialty") VALUES
  ('a1b2c3d4-e5f6-4789-ab01-234567890011', 'Encanamentos Total', '(11) 98888-0001', 'PLUMBER'),
  ('a1b2c3d4-e5f6-4789-ab01-234567890012', 'Elétrica Express', '(11) 98888-0002', 'ELECTRICIAN'),
  ('a1b2c3d4-e5f6-4789-ab01-234567890013', 'Pinturas & Acabamentos', '(11) 98888-0003', 'PAINTER')
ON CONFLICT DO NOTHING;
