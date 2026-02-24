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

---

### Jour 2 — 2026-02-24

**Dev 1 — Système d'authentification complet**

✅ Tâches complétées :
- Page de connexion (`app/login/page.tsx`) :
  - Formulaire email/mot de passe avec Supabase `signInWithPassword`
  - Google OAuth (`signInWithOAuth`)
  - Toggle visibilité mot de passe
  - Mapping erreurs Supabase → messages français
  - Loading states & anti double-soumission
  - Redirection vers `/dashboard` après succès
- Page d'inscription (`app/signup/page.tsx`) :
  - Champs : pseudo, email, mot de passe, confirmation, langue
  - Indicateur de force mot de passe (4 critères : longueur, majuscule, chiffre, spécial)
  - Validation regex pseudo (lettres, chiffres, underscore, min 3 chars)
  - Vérification match mots de passe
  - Sélecteur de langue (FR/EN)
  - Checkbox CGU obligatoire
  - Google OAuth
  - Redirection vers page de vérification email
- Page de vérification email (`app/auth/verify/page.tsx`)
- Route callback OAuth (`app/auth/callback/route.ts`)
- Composants auth réutilisables (`components/auth-form.tsx`) :
  - `OAuthButtons`, `PasswordInput`, `PasswordStrengthMeter`
  - `AuthError`, `AuthDivider`, `Spinner`
  - `getAuthErrorMessage` — mapping erreurs Supabase
  - `usePasswordStrength` — hook d'analyse force mot de passe
- Header/Navbar dynamique (`components/header.tsx`) :
  - État authentifié : nav links, badge crédits, dropdown profil, logout
  - État non-authentifié : boutons Connexion/Inscription
  - Menu hamburger mobile responsive
  - Listener `onAuthStateChange` pour réactivité
- Middleware protection des routes (`middleware.ts`) :
  - Routes protégées → redirect `/login` si non connecté
  - Routes auth → redirect `/dashboard` si déjà connecté
  - Paramètre `next` pour retour après login
- Layout protégé (`app/(protected)/layout.tsx`) avec Header automatique
- Dashboard amélioré (`app/(protected)/dashboard/page.tsx`) :
  - Section bienvenue avec nom utilisateur
  - Cards stats : crédits, générations, plan
  - Cartes modules IA (Image, Chat, Vidéo)
  - Liste générations récentes
  - État vide avec CTA
- API Auth (`app/api/auth/route.ts`) :
  - GET : session + profil
  - POST : déconnexion serveur
- Configuration Google Auth complétée :
  - URIs Google Cloud (`jadariselabs.vercel.app` et `jadariselabs-git-develop-jada.vercel.app`)
  - Redirections Supabase (`/auth/v1/callback` et `/**`)
- Types Dev 1 ajoutés dans `lib/types.ts` : `LoginFormData`, `SignupFormData`, `PasswordStrength`

📝 Notes :
- Pages protégées (dashboard, gallery, studio) déplacées dans `app/(protected)/`
- Le route group `(protected)` ne modifie pas les URLs (invisible dans l'URL)
- Build réussi : 18 routes compilées, 0 erreurs TypeScript
- Warning lockfile SWC ignorable (n'affecte pas le fonctionnement)

🔜 Prochaines étapes (Jour 3 — Dev 1) :
- [ ] Auth : profil utilisateur (page + édition)
- [ ] Auth : gestion de session avancée
- [ ] Module Chat : UI chat interface
- [ ] Module Chat : API route + Groq LLaMA

---

## 📁 Structure Actuelle du Projet

```
/app
  /page.tsx                        # Landing page
  /layout.tsx                      # Layout racine (polices, metadata)
  /globals.css                     # Design system JadaRiseLabs
  /login/page.tsx                  # Page connexion (Supabase Auth)
  /signup/page.tsx                 # Page inscription (validation avancée)
  /auth/
    /callback/route.ts             # Callback OAuth & email confirm
    /verify/page.tsx               # Page vérification email
  /(protected)/
    /layout.tsx                    # Layout avec Header (toutes pages auth)
    /dashboard/page.tsx            # Dashboard utilisateur (stats, modules)
    /gallery/page.tsx              # Galerie personnelle (placeholder)
    /studio/[module]/page.tsx      # Studio IA dynamique (placeholder)
  /api/
    /auth/route.ts                 # GET session, POST logout
    /generate/image/route.ts       # API image (placeholder)
    /generate/chat/route.ts        # API chat (placeholder)
    /generate/video/route.ts       # API vidéo (placeholder)
    /payment/route.ts              # Webhook CinetPay (placeholder)
  /legal/
    /terms/page.tsx                # CGU
    /privacy/page.tsx              # Politique confidentialité

/components
  /auth-form.tsx                   # Composants auth réutilisables
  /header.tsx                      # Header/Navbar dynamique

/lib
  /types.ts                        # Types TypeScript partagés
  /supabase/
    /client.ts                     # Client Supabase (browser)
    /server.ts                     # Client Supabase (server)
    /middleware.ts                 # Helper middleware Supabase

/supabase
  /migrations/
    /001_initial_schema.sql        # Schéma DB complet

/public                            # Assets statiques

middleware.ts                      # Middleware Next.js (session + protection routes)
.prettierrc                        # Config Prettier
.env.example                       # Template variables d'environnement
next.config.js                     # Config Next.js (images, etc.)
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
6. **Route protection** : Middleware redirige automatiquement — ne pas dupliquer la logique côté composant
7. **Pages protégées** dans `app/(protected)/` — le route group est invisible dans l'URL
