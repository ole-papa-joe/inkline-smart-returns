-- Fix missing profiles for existing users
INSERT INTO public.profiles (user_id, email, created_at)
SELECT u.id, u.email, u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Fix missing user roles for existing users
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT u.id, 'user', u.created_at
FROM auth.users u
LEFT JOIN public.user_roles r ON u.id = r.user_id
WHERE r.user_id IS NULL;