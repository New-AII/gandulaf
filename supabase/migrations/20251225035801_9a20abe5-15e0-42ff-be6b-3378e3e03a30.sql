-- Create table for character high scores
CREATE TABLE public.character_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id INTEGER NOT NULL,
  character_name TEXT NOT NULL,
  high_score INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.character_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read scores (public leaderboard)
CREATE POLICY "Anyone can view scores" 
ON public.character_scores 
FOR SELECT 
USING (true);

-- Allow anyone to insert scores (since game is public)
CREATE POLICY "Anyone can insert scores" 
ON public.character_scores 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to update scores
CREATE POLICY "Anyone can update scores" 
ON public.character_scores 
FOR UPDATE 
USING (true);

-- Create unique index on character_id
CREATE UNIQUE INDEX idx_character_scores_character_id ON public.character_scores(character_id);

-- Create app_role enum and user_roles table for admin access
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default scores for 6 characters
INSERT INTO public.character_scores (character_id, character_name, high_score)
VALUES 
  (1, 'Player 1', 0),
  (2, 'Player 2', 0),
  (3, 'Player 3', 0),
  (4, 'Player 4', 0),
  (5, 'Player 5', 0),
  (6, 'Player 6', 0)
ON CONFLICT (character_id) DO NOTHING;