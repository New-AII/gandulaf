-- Add UPDATE policy for characters table
CREATE POLICY "Anyone can update characters" 
ON public.characters 
FOR UPDATE 
USING (true)
WITH CHECK (true);