-- Social accounts + publishing metadata

-- Extend social_drafts status and publishing fields
ALTER TABLE public.social_drafts
  DROP CONSTRAINT IF EXISTS social_drafts_status_check;

ALTER TABLE public.social_drafts
  ADD CONSTRAINT social_drafts_status_check
  CHECK (status IN ('draft', 'approved', 'published', 'archived', 'failed'));

ALTER TABLE public.social_drafts
  ADD COLUMN IF NOT EXISTS provider_post_id TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS publish_error TEXT,
  ADD COLUMN IF NOT EXISTS publish_attempts INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_social_drafts_status_planned
  ON public.social_drafts(status, planned_for);

-- Social accounts table (tokens are stored encrypted)
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'x', 'tiktok', 'facebook', 'instagram', 'whatsapp')),
  account_id TEXT NOT NULL,
  account_name TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  is_default BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_accounts_user_platform
  ON public.social_accounts(user_id, platform);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;

-- No RLS policies: access is server-side only using service role

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'social_accounts_updated_at'
  ) THEN
    CREATE TRIGGER social_accounts_updated_at
      BEFORE UPDATE ON public.social_accounts
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
  END IF;
END $$;
