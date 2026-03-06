-- ============================================
-- Migration: Video Generation Support
-- ============================================
-- Ajoute les colonnes manquantes pour le support vidéo
-- et les statuts de génération

-- Ajouter colonne status pour suivre l'état des générations
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'completed' 
CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'cancelled'));

-- Ajouter colonne error pour stocker les messages d'erreur
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS error TEXT;

-- Ajouter colonne completed_at pour la date de fin
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Ajouter colonne updated_at pour les mises à jour
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Créer un index sur le statut pour les requêtes de polling
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);

-- Mettre à jour les générations existantes avec le statut par défaut
UPDATE public.generations 
SET status = 'completed', completed_at = created_at 
WHERE status IS NULL OR status = 'completed';

-- ============================================
-- STORAGE BUCKET: generations
-- ============================================
-- Créer le bucket de stockage pour les fichiers générés
INSERT INTO storage.buckets (id, name, public)
VALUES ('generations', 'generations', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS pour le bucket generations
CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (bucket_id = 'generations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view public files"
ON storage.objects FOR SELECT
USING (bucket_id = 'generations');

-- ============================================
-- Fonction pour mettre à jour updated_at
-- ============================================
CREATE OR REPLACE TRIGGER generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

COMMENT ON COLUMN public.generations.status IS 'Statut de la génération: queued, processing, completed, failed, cancelled';
COMMENT ON COLUMN public.generations.error IS 'Message d''erreur si la génération a échoué';
COMMENT ON COLUMN public.generations.completed_at IS 'Date de fin de génération';
