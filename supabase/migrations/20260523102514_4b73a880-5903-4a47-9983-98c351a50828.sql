ALTER TABLE public.rooms ADD COLUMN school_id UUID REFERENCES public.profiles(id);

-- Update existing rooms with creator's school_id if they are teachers/schools
UPDATE public.rooms r
SET school_id = p.school_id
FROM public.profiles p
WHERE r.created_by = p.id AND p.school_id IS NOT NULL;

-- Also handle creators who ARE schools
UPDATE public.rooms r
SET school_id = p.id
FROM public.profiles p
WHERE r.created_by = p.id AND p.role = 'school';