-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'feedback_updated', 'feedback_read', 'room_invite', etc.
  read BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Create classroom_moderation table
CREATE TABLE public.classroom_moderation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'participante', -- 'admin', 'moderador', 'participante'
  can_chat BOOLEAN DEFAULT true,
  can_audio BOOLEAN DEFAULT true,
  can_video BOOLEAN DEFAULT true,
  is_muted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS for classroom_moderation
ALTER TABLE public.classroom_moderation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can see room members"
ON public.classroom_moderation FOR SELECT
USING (true);

CREATE POLICY "Only admins/teachers can update moderation"
ON public.classroom_moderation FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'professor'
  ) OR 
  EXISTS (
    SELECT 1 FROM public.classroom_moderation 
    WHERE room_id = classroom_moderation.room_id AND user_id = auth.uid() AND role = 'admin'
  )
);

-- Create whiteboard_sessions table
CREATE TABLE public.whiteboard_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create whiteboard_strokes table for real-time syncing
CREATE TABLE public.whiteboard_strokes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.whiteboard_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stroke_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for whiteboard
ALTER TABLE public.whiteboard_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_strokes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Whiteboard sessions viewable by everyone" ON public.whiteboard_sessions FOR SELECT USING (true);
CREATE POLICY "Whiteboard strokes viewable by everyone" ON public.whiteboard_strokes FOR SELECT USING (true);
CREATE POLICY "Users can insert strokes" ON public.whiteboard_strokes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create ai_pedagogical_content table
CREATE TABLE public.ai_pedagogical_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES auth.users(id),
  student_id UUID REFERENCES auth.users(id), -- Optional for individual personalization
  class_id UUID,
  content_type TEXT NOT NULL, -- 'lesson_plan', 'exercise', 'intervention'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  bncc_codes TEXT[],
  learning_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for AI content
ALTER TABLE public.ai_pedagogical_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teachers can manage AI content" ON public.ai_pedagogical_content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'professor')
);

-- Update profiles for learning personalization
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS learning_style TEXT,
ADD COLUMN IF NOT EXISTS learning_pace TEXT, -- 'slow', 'medium', 'fast'
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Add file_urls to notebook_entries
ALTER TABLE public.notebook_entries
ADD COLUMN IF NOT EXISTS file_urls TEXT[];

-- Set up storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('notebook-assets', 'notebook-assets', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'notebook-assets');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'notebook-assets' AND auth.role() = 'authenticated');
