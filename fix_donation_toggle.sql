-- 1. Ensure the show_donation column exists in profiles
-- We use DO block to avoid errors if it already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'show_donation') THEN
        ALTER TABLE public.profiles ADD COLUMN show_donation boolean DEFAULT true;
    END IF;
END $$;

-- 2. Ensure Super Admins can update profiles
-- first enable RLS just in case
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop policy if exists to avoid conflicts/duplication (optional, but cleaner for a fix script)
DROP POLICY IF EXISTS "Enable update for super admins" ON public.profiles;

-- Create policy allowing Super Admins to update ANY profile
CREATE POLICY "Enable update for super admins"
ON public.profiles
FOR UPDATE
USING (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
)
WITH CHECK (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- 3. Also ensure they can SELECT (view) all profiles
DROP POLICY IF EXISTS "Enable read access for super admins" ON public.profiles;

CREATE POLICY "Enable read access for super admins"
ON public.profiles
FOR SELECT
USING (
  (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true
);

-- (Optional) If you want everyone to see basic profile info, you might have a public read policy already.
-- The above policy is specific to Super Admins to ensure they can definitely see everything.
