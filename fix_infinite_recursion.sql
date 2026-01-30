-- The infinite recursion happens because the policy checks "is_super_admin" on the "profiles" table
-- while trying to access the "profiles" table.

-- To fix this, we can use a "security definer" function to check admin status
-- which bypasses RLS for that specific check.

-- 1. Create a function to check is_super_admin without triggering RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND is_super_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic policies
DROP POLICY IF EXISTS "Enable update for super admins" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for super admins" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for own profile" ON public.profiles;

-- 3. Re-create policies using the secure function
-- Policy: Users can read their own profile
CREATE POLICY "Enable read access for own profile"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = id
);

-- Policy: Super Admins can read ALL profiles
-- (The function is_super_admin() is secure, but using it in a policy might still trigger recursion?
-- Actually, querying inside the function logic should be safe if it's SECURITY DEFINER)
CREATE POLICY "Enable read access for super admins"
ON public.profiles
FOR SELECT
USING (
  public.is_super_admin() = true
);

-- Policy: Super Admins can update ANY profile
CREATE POLICY "Enable update for super admins"
ON public.profiles
FOR UPDATE
USING (
  public.is_super_admin() = true
)
WITH CHECK (
  public.is_super_admin() = true
);
