-- Drop the existing restrictive DELETE policy
DROP POLICY IF EXISTS "Anyone can delete custom characters" ON public.characters;

-- Create a new policy that allows deleting ALL characters
CREATE POLICY "Anyone can delete any character"
ON public.characters
FOR DELETE
USING (true);