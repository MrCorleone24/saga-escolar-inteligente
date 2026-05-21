-- Fix security linter warning: ensure search_path is set
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
