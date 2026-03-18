-- O usuário deve copiar e colar este código no SQL Editor do Supabase (SQL Editor > New Query > RUN) e executá-lo.

-- Habilitar a extensão para gerenciar UUIDs (geralmente habilitada por padrão)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Criação da tabela de Procedimentos
CREATE TABLE procedures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL
);

-- 2. Criação da tabela de Especialistas do CRM
CREATE TABLE crm_specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL
);

-- 3. Criação da tabela de Leads/Clientes (CRM)
CREATE TABLE crm_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL CHECK (status IN ('new', 'in-progress', 'scheduled', 'completed')),
  last_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  specialist_id UUID REFERENCES crm_specialists(id) ON DELETE SET NULL,
  treatments TEXT[] DEFAULT '{}'
);

-- 4. Criação da tabela de Histórico do CRM
CREATE TABLE crm_history_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL,
  note TEXT
);

-- 5. Criação da tabela de Agendamentos (Calendário)
CREATE TABLE agenda_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  specialist_name TEXT NOT NULL,
  procedure TEXT NOT NULL,
  value TEXT,
  whatsapp TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT FALSE,
  lead_id UUID REFERENCES crm_leads(id) ON DELETE SET NULL
);

-- Configurações Básicas de Segurança (Public para desenvolvimento - depois pode ajustar RLS)
-- Recomendado ligar as políticas RLS depois no futuro, para agilizar agora os testes vamos deixá-las desabilitadas.

-- === DADOS DE DEMONSTRAÇÃO (Opcional) ===
-- Inserindo alguns procedimentos padrão
INSERT INTO procedures (name, duration_minutes) VALUES 
('Avaliação Inicial', 30),
('Limpeza', 40),
('Botox', 45),
('Facetas / Lentes', 180),
('Implante', 120);

-- Inserindo especialistas no CRM
INSERT INTO crm_specialists (name, role) VALUES 
('Dra. Kátia Fragoso', 'Doutora'),
('Dra. Victória Berenice', 'Doutora');
