# 📊 JadaRiseLabs — Évolution du Projet

> Ce fichier est le **journal de bord** du projet. Il permet de reprendre le travail
> dans une nouvelle conversation sans perdre le contexte.
> **Mise à jour obligatoire à chaque fin de session de travail.**

---

## 🏗️ Architecture

- **Stack** : Next.js (App Router) + Tailwind CSS v4 + Supabase + Vercel
- **Repo** : https://github.com/Jeho05/jadariselabs.git
- **Branches** : `main` → `develop` → `feature/*`

## 👥 Répartition

| Dev | Modules |
|-----|---------|
| Dev 1 | Setup, Auth, Dashboard, Chat IA, Vidéo, Crédits, Partage social |
| Dev 2 | Image IA, Galerie, Paiement CinetPay |

---

## 📅 Journal des Jours

### Jour 1 — 2026-02-23

**Dev 1 — Setup projet complet**

✅ Tâches complétées :
- Initialisation Next.js (App Router, TypeScript, Tailwind CSS v4, ESLint)
- Configuration `.prettierrc` (semi, singleQuote, trailingComma es5, printWidth 100)
- Configuration `.env.example` (Supabase, Groq, HuggingFace, Replicate, CinetPay)
- Configuration `next.config.ts` (WebP, device sizes mobile, remote patterns)
- Design system JadaRiseLabs dans `globals.css` (Tailwind v4 @theme tokens)
  - Couleurs : earth `#7B4F2E`, gold `#C9A84C`, savanna `#2D6A4F`, terracotta `#E76F51`
  - Fond crème `#FDF6E3`, boutons, cards, skeleton animations
- Polices Google : Plus Jakarta Sans (titres) + Inter (corps)
- SEO metadata + Open Graph dans `layout.tsx`
- `lib/types.ts` — tous les types partagés (Profile, Generation, Subscription, Payment, Plans)
- `lib/supabase/` — clients browser + server + middleware helper
- `middleware.ts` — refresh session automatique Supabase Auth
- `supabase/migrations/001_initial_schema.sql` — schéma complet :
  - Tables : profiles, generations, subscriptions, payments
  - RLS policies (chaque user voit uniquement ses données)
  - Trigger auto-création profil à l'inscription
  - Trigger auto-update `updated_at`
  - Index sur user_id, type, created_at, status
- Landing page complète (`app/page.tsx`) :
  - Header avec nav + boutons connexion/inscription
  - Hero section avec gradient text + CTA
  - Grille 6 modules IA avec icônes et tags
  - Pricing 3 plans (Gratuit / Starter / Pro)
  - FAQ accordion (5 questions)
  - Footer avec liens légaux
- `README.md` mis à jour avec instructions d'installation
- `EVOLUTION.md` (ce fichier) créé pour suivi inter-conversations
- Git : branches `main` + `develop` + première feature branch
- Packages installés : `@supabase/supabase-js`, `@supabase/ssr`

📝 Notes :
- Tailwind v4 utilise la syntaxe `@theme inline` (pas de tailwind.config.ts classique)
- Next.js version 16.1.6 (dernière version)
- Le fichier SQL de migration doit être exécuté manuellement dans Supabase SQL Editor

🔜 Prochaines étapes (Jour 2 — Dev 1) :
- [ ] Configurer le projet Supabase (créer projet, exécuter migration SQL)
- [ ] Auth : UI signup/login avec Supabase Auth
- [ ] Auth : page de profil utilisateur
- [ ] Auth : gestion de session (redirect si non connecté)

---

## 📁 Structure Actuelle du Projet

```
/app
  /page.tsx                    # Landing page
  /layout.tsx                  # Layout racine (polices, metadata)
  /globals.css                 # Design system JadaRiseLabs
  /favicon.ico

/lib
  /types.ts                    # Types TypeScript partagés
  /supabase/
    /client.ts                 # Client Supabase (browser)
    /server.ts                 # Client Supabase (server)
    /middleware.ts             # Helper middleware Supabase

/supabase
  /migrations/
    /001_initial_schema.sql    # Schéma DB complet

/public                        # Assets statiques

middleware.ts                  # Middleware Next.js (session refresh)
.prettierrc                    # Config Prettier
.env.example                   # Template variables d'environnement
next.config.ts                 # Config Next.js (images, etc.)
```

---

## 🔧 Variables d'Environnement Requises

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GROQ_API_KEY
HUGGINGFACE_API_KEY
REPLICATE_API_TOKEN
CINETPAY_API_KEY
CINETPAY_SITE_ID
CINETPAY_SECRET_KEY
NEXT_PUBLIC_APP_URL
```

---

## 🚨 Points d'Attention

1. **RLS Supabase** : Toujours actif. Sans lui, données visibles par tous.
2. **Fichiers partagés** à coordonner entre devs : `lib/types.ts`, `lib/supabase/`, `components/ui/`
3. **Convention nommage** : fichiers kebab-case, composants PascalCase, variables camelCase
4. **Commits** : messages clairs format `feat:`, `fix:`, `refactor:`, etc.
5. **PR obligatoire** pour merger dans develop — l'autre dev review
