-- Social Media Autopilot + Drafts

-- Allow Social generation type
ALTER TABLE public.generations DROP CONSTRAINT IF EXISTS generations_type_check;
ALTER TABLE public.generations
  ADD CONSTRAINT generations_type_check
  CHECK (type IN ('image', 'chat', 'video', 'audio', 'code', 'ocr', 'search', 'social'));

-- Drafts
CREATE TABLE IF NOT EXISTS public.social_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  schedule_id UUID,
  platform TEXT NOT NULL CHECK (platform IN ('tiktok', 'facebook', 'whatsapp', 'linkedin', 'instagram')),
  content_type TEXT NOT NULL DEFAULT 'promo',
  topic TEXT NOT NULL,
  context TEXT,
  tone TEXT NOT NULL DEFAULT 'professionnel',
  sector TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  planned_for TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_drafts_user_id ON public.social_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_drafts_status ON public.social_drafts(status);
CREATE INDEX IF NOT EXISTS idx_social_drafts_created_at ON public.social_drafts(created_at DESC);

-- Schedules
CREATE TABLE IF NOT EXISTS public.social_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  platforms TEXT[] NOT NULL DEFAULT ARRAY['tiktok','instagram','facebook','linkedin','whatsapp']::text[],
  posts_per_week INTEGER NOT NULL DEFAULT 3,
  credits_budget_weekly INTEGER NOT NULL DEFAULT 10,
  timezone TEXT NOT NULL DEFAULT 'Africa/Porto-Novo',
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  week_anchor_date DATE NOT NULL DEFAULT CURRENT_DATE,
  week_credits_used INTEGER NOT NULL DEFAULT 0,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_social_schedules_user_id ON public.social_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_social_schedules_next_run_at ON public.social_schedules(next_run_at);

-- Foreign key after schedule table exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'social_drafts_schedule_id_fkey'
      AND table_name = 'social_drafts'
      AND table_schema = 'public'
  ) THEN
    ALTER TABLE public.social_drafts
      ADD CONSTRAINT social_drafts_schedule_id_fkey
      FOREIGN KEY (schedule_id) REFERENCES public.social_schedules(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS
ALTER TABLE public.social_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social drafts"
  ON public.social_drafts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social drafts"
  ON public.social_drafts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social drafts"
  ON public.social_drafts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social drafts"
  ON public.social_drafts FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own social schedules"
  ON public.social_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social schedules"
  ON public.social_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social schedules"
  ON public.social_schedules FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own social schedules"
  ON public.social_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'social_drafts_updated_at'
  ) THEN
    CREATE TRIGGER social_drafts_updated_at
      BEFORE UPDATE ON public.social_drafts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'social_schedules_updated_at'
  ) THEN
    CREATE TRIGGER social_schedules_updated_at
      BEFORE UPDATE ON public.social_schedules
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;
