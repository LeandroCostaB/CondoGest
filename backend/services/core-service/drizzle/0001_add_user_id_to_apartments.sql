ALTER TABLE apartment
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS apartment_user_id_unique ON apartment (user_id)
  WHERE user_id IS NOT NULL;
