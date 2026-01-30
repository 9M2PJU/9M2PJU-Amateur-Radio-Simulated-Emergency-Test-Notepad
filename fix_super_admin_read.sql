-- Ensure users can read their OWN profile data, including is_super_admin
-- The previous script might have restricted read access only to super admins?

-- Drop existing read policy to be safe
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;

-- Create policy allowing users to read their OWN profile
CREATE POLICY "Enable read access for own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- Ensure Super Admins can read ALL profiles (re-applying this just in case)
DROP POLICY IF EXISTS "Enable read access for super admins" ON public.profiles;

CREATE POLICY "Enable read access for super admins"
ON public.profiles
FOR SELECT
USING (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);
