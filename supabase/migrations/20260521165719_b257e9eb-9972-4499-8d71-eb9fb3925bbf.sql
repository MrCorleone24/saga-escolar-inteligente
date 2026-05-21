-- Create an enum for roles
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'school', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Update profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS max_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_teachers INTEGER DEFAULT 0;

-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC NOT NULL,
    max_students INTEGER,
    max_teachers INTEGER,
    role_type TEXT NOT NULL, -- 'teacher' or 'school'
    features JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on plans
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone" ON public.plans FOR SELECT USING (true);

-- Insert default plans
INSERT INTO public.plans (name, description, price_monthly, max_students, max_teachers, role_type, features)
VALUES 
('Professor Individual', 'Para professores que trabalham sozinhos', 49.90, 30, 0, 'teacher', '["Suporte 24h", "Relatórios básicos"]'),
('Escola Essencial', 'Para pequenas escolas', 299.00, 200, 10, 'school', '["Gestão de professores", "Relatórios avançados"]'),
('Escola Premium', 'Para escolas completas', 599.00, 1000, 50, 'school', '["Gestão total", "IA Pedagógica ilimitada", "Dashboard customizado"]');

-- Update RLS for profiles to allow hierarchical access
-- 1. Admin can do anything
-- 2. School can see/manage their teachers and students
-- 3. Teacher can see/manage their students

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Admins have full access" 
ON public.profiles 
FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Schools can view their members" 
ON public.profiles 
FOR SELECT 
USING (
  parent_id = auth.uid() OR 
  id IN (SELECT id FROM public.profiles WHERE parent_id IN (SELECT id FROM public.profiles WHERE parent_id = auth.uid()))
);

CREATE POLICY "Teachers can view their students" 
ON public.profiles 
FOR SELECT 
USING (parent_id = auth.uid());

-- Function to handle new user profiles and set role based on certain criteria
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Default role is student, but can be overridden
  IF (SELECT count(*) FROM public.profiles) = 0 THEN
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the specific email is admin (this will be applied if the user exists)
-- We can't easily check email here without joining auth.users which is restricted in some contexts
-- But we can add a column for email in profiles for easier management
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- Create a function to sync email from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET email = NEW.email WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- We don't have direct access to create triggers on auth.users in all environments via this tool
-- but we can try. If it fails, we'll handle it in the app logic.

-- Set jrseguim@gmail.com as admin if it exists
DO $$ 
BEGIN
  -- We try to find the ID from auth.users if possible
  -- This is a bit of a hack since we might not have access to auth schema here
  -- But in Lovable/Supabase typical setup, we might.
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE email = 'jrseguim@gmail.com';
END $$;
