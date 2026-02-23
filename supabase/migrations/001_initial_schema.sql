-- ============================================
-- JadaRiseLabs — Schéma Initial de Base de Données
-- ============================================
-- À exécuter dans Supabase SQL Editor ou via supabase db push
-- Dev 1 gère toutes les migrations pendant la Semaine 1

-- ============================================
-- TABLE : profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  preferred_lang TEXT NOT NULL DEFAULT 'fr' CHECK (preferred_lang IN ('fr', 'en')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro')),
  credits INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs JadaRiseLabs';

-- ============================================
-- TABLE : generations
-- ============================================
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'chat', 'video', 'audio', 'code')),
  prompt TEXT NOT NULL,
  result_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.generations IS 'Historique de toutes les générations IA';

CREATE INDEX idx_generations_user_id ON public.generations(user_id);
CREATE INDEX idx_generations_type ON public.generations(type);
CREATE INDEX idx_generations_created_at ON public.generations(created_at DESC);

-- ============================================
-- TABLE : subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('starter', 'pro')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  payment_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.subscriptions IS 'Abonnements payants des utilisateurs';

CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- ============================================
-- TABLE : payments
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  amount INTEGER NOT NULL, -- en centimes de F CFA
  provider TEXT NOT NULL CHECK (provider IN ('orange_money', 'wave', 'mtn', 'moov', 'card')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.payments IS 'Historique des paiements CinetPay';

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) — OBLIGATOIRE
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles : un user ne voit/modifie que son propre profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Generations : un user ne voit que ses propres générations
CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generations"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions : un user ne voit que ses propres abonnements
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Payments : un user ne voit que ses propres paiements
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGER : Créer profil automatiquement à l'inscription
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, preferred_lang, plan, credits)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'preferred_lang', 'fr'),
    'free',
    50
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER : Mettre à jour updated_at automatiquement
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
