-- Fix: evitar recursion infinita en la politica admin de profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() ->> 'role') = 'admin'
  );
