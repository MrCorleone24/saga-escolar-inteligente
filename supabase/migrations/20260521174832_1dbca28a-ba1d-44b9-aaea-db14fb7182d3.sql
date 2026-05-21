-- Add room_type to distinguish between standard classrooms and administrative rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS room_type TEXT DEFAULT 'classroom';

-- Create table for room invitations if it doesn't exist
CREATE TABLE IF NOT EXISTS public.room_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    invited_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(room_id, invited_user_id)
);

-- Enable RLS on invitations
ALTER TABLE public.room_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for invitations
CREATE POLICY "Users can view their own invitations" 
ON public.room_invitations FOR SELECT 
USING (auth.uid() = invited_user_id);

CREATE POLICY "Room owners can manage invitations" 
ON public.room_invitations FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM public.rooms 
        WHERE id = room_id AND created_by = auth.uid()
    )
);

-- Update RLS for classroom_moderation to allow professors to mute all
-- (Policies are already quite open, but let's ensure the professor/admin can update anyone in the room)
CREATE POLICY "Admins can update anyone in the room"
ON public.classroom_moderation FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.classroom_moderation
        WHERE room_id = public.classroom_moderation.room_id 
        AND user_id = auth.uid() 
        AND role = 'admin'
    )
);