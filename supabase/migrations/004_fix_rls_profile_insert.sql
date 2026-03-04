-- ============================================
-- Fix RLS: Supprimer politique INSERT sur profiles
-- ============================================
-- Le trigger handle_new_user utilise SECURITY DEFINER et gère l'insertion
-- La politique INSERT avec auth.uid() = id bloque le trigger car l'utilisateur
-- n'a pas encore de session au moment de la création

-- Supprimer la politique INSERT qui bloque le trigger
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Le trigger handle_new_user (SECURITY DEFINER) bypass RLS pour l'insertion
-- Les utilisateurs peuvent toujours UPDATE leur propre profil via la politique UPDATE
