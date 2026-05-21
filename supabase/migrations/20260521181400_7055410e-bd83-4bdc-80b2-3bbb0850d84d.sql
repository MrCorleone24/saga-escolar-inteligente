-- Tabela para histórico financeiro real
CREATE TABLE IF NOT EXISTS public.financial_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL, -- 'paid', 'pending', 'failed'
    payment_method TEXT NOT NULL, -- 'PIX', 'Credit Card', etc.
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.financial_history ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Users can view their own financial history"
ON public.financial_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all financial history"
ON public.financial_history
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
);

-- Index para performance
CREATE INDEX idx_financial_history_user_id ON public.financial_history(user_id);
