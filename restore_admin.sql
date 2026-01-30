-- Force set super admin for 9m2pju@hamradio.my
UPDATE public.profiles
SET is_super_admin = true
WHERE email = '9m2pju@hamradio.my';

-- Verify the update
SELECT id, email, is_super_admin FROM public.profiles WHERE email = '9m2pju@hamradio.my';
