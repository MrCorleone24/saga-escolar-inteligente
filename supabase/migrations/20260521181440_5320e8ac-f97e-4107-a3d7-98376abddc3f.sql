CREATE OR REPLACE FUNCTION public.get_monthly_revenue()
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(amount), 0)
    FROM public.financial_history
    WHERE status = 'paid'
      AND created_at >= date_trunc('month', now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
