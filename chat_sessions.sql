-- Copie e cole este código no SQL Editor do seu Supabase para criar a persistência do chat

CREATE TABLE IF NOT EXISTS chat_sessions (
  pin TEXT PRIMARY KEY,
  client_name TEXT,
  phone TEXT,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Permite que usuários anônimos (do front-end) acessem, insiram e modifiquem o chat_sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for anon on chat_sessions" 
  ON chat_sessions FOR ALL 
  USING (true) WITH CHECK (true);
