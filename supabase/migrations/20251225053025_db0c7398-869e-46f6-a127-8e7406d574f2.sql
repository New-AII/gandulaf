-- Create storage bucket for character assets
INSERT INTO storage.buckets (id, name, public) VALUES ('characters', 'characters', true);

-- Create policies for character storage
CREATE POLICY "Anyone can view character assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'characters');

CREATE POLICY "Authenticated users can upload character assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'characters');

CREATE POLICY "Authenticated users can delete character assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'characters');

-- Create characters table
CREATE TABLE public.characters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Custom Character',
  image_url TEXT NOT NULL,
  run_audio_url TEXT,
  death_audio_url TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Anyone can view characters
CREATE POLICY "Anyone can view characters"
ON public.characters FOR SELECT
USING (true);

-- Anyone can insert characters (admin-only enforced in app)
CREATE POLICY "Anyone can insert characters"
ON public.characters FOR INSERT
WITH CHECK (true);

-- Anyone can delete non-default characters (admin-only enforced in app)
CREATE POLICY "Anyone can delete custom characters"
ON public.characters FOR DELETE
USING (is_default = false);

-- Insert default characters
INSERT INTO public.characters (id, name, image_url, is_default, run_audio_url, death_audio_url) VALUES
(1, 'Character 1', '/src/assets/char1.jpg', true, '/audio/run-main.mp3', '/audio/death-char1.mp3'),
(2, 'Character 2', '/src/assets/char2.jpg', true, '/audio/run-main.mp3', '/audio/death-char2.mp3'),
(3, 'Character 3', '/src/assets/char3.jpg', true, '/audio/run-main.mp3', '/audio/death-char3.mp3'),
(4, 'Character 4', '/src/assets/char4.jpg', true, '/audio/run-char4.mp3', '/audio/death-char4.mp3'),
(5, 'Character 5', '/src/assets/char5.jpg', true, '/audio/run-main.mp3', '/audio/death-char5.mp3'),
(6, 'Character 6', '/src/assets/char6.jpg', true, '/audio/run-char6.mp3', '/audio/death-char6.mp3');