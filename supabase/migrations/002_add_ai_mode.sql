-- Adaugă coloana ai_mode în tabela devices
-- Valori acceptate: 'reaction', 'prediction', 'auto'
-- Default: 'auto'

ALTER TABLE devices
ADD COLUMN IF NOT EXISTS ai_mode TEXT DEFAULT 'auto'
CHECK (ai_mode IN ('reaction', 'prediction', 'auto'));
