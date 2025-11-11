-- FASE 1: Sistema de Parcelas Recorrentes
-- Criar tabela payment_installments para armazenar parcelas virtuais

CREATE TABLE payment_installments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  total_installments INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_installments_enrollment ON payment_installments(enrollment_id);
CREATE INDEX idx_installments_student ON payment_installments(student_id);
CREATE INDEX idx_installments_user ON payment_installments(user_id);
CREATE INDEX idx_installments_due_date ON payment_installments(due_date);
CREATE INDEX idx_installments_status ON payment_installments(status);

-- RLS Policies (isolamento por usuário)
ALTER TABLE payment_installments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own installments"
  ON payment_installments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own installments"
  ON payment_installments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own installments"
  ON payment_installments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own installments"
  ON payment_installments FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_installments_updated_at
  BEFORE UPDATE ON payment_installments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Modificar tabela enrollments para suportar parcelas
ALTER TABLE enrollments
  ADD COLUMN is_installment_plan BOOLEAN DEFAULT false,
  ADD COLUMN total_installments INTEGER,
  ADD COLUMN installment_amount NUMERIC,
  ADD COLUMN payment_day INTEGER;