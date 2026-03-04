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

🔜 Prochaines étapes (Jour 4 — Dev 1) :
- [ ] Module Chat : historique conversations (restauration complète)
- [ ] Dashboard : fetch générations + affichage amélioré
- [ ] Dashboard : statistiques personnelles (outils utilisés, évolution)

---

### Jour 3 — 2026-02-25

**Dev 1 — Profil utilisateur + Module Chat IA complet**

✅ Tâches complétées :
- Page profil utilisateur (`app/(protected)/dashboard/profile/page.tsx`) :
  - Affichage : avatar, pseudo, email, plan, crédits, date inscription
  - Édition inline : pseudo (validation 3-20 chars alphanumeric), langue (FR/EN), avatar URL
  - Détails du plan : crédits/mois, HD, vidéo, watermark, comparatif
  - Zone dangereuse : suppression de compte avec double confirmation
  - Design glassmorphism + animations slide-up
- API profil (`app/api/profile/route.ts`) :
  - GET : profil + email du user authentifié
  - PATCH : mise à jour username, preferred_lang, avatar_url
  - Validation serveur : format username, unicité username, langue supportée
- Module Chat IA — Interface (`app/(protected)/studio/chat/page.tsx`) :
  - Interface modern style ChatGPT
  - Sidebar conversations avec historique (CRUD complet)
  - Bulles de messages user/assistant avec timestamps
  - Streaming SSE en temps réel (caractère par caractère)
  - Indicateur de typing animé (3 dots)
  - Auto-scroll vers le dernier message
  - 4 suggestions de prompts pour démarrer
  - Input auto-resize (textarea dynamique)
  - Raccourci Enter pour envoyer
  - Compteur de crédits en temps réel
  - Responsive mobile : sidebar toggle avec overlay
- Module Chat IA — Backend (`app/api/generate/chat/route.ts`) :
  - Intégration Groq API pour LLaMA 3.3 70B (Versatile)
  - System prompt JadaBot (assistant IA culturellement sensible)
  - Streaming SSE via ReadableStream
  - Historique de contexte (20 derniers messages)
  - Déduction 1 crédit par message
  - Validation : message non vide, max 4000 chars, crédits suffisants
  - Gestion erreurs : API key manquante, rate limiting, erreur Groq
  - Enregistrement dans table `generations` pour statistiques
- API Conversations (`app/api/chat/conversations/route.ts`) :
  - GET : liste conversations (max 50, tri updated_at DESC)
  - POST : créer conversation
  - PATCH : mettre à jour messages/titre
  - DELETE : supprimer conversation
- Migration SQL (`supabase/migrations/002_chat_conversations.sql`) :
  - Table `chat_conversations` (id, user_id, title, messages JSONB)
  - RLS policies (SELECT, INSERT, UPDATE, DELETE)
  - Index sur user_id et created_at
  - Trigger auto-update updated_at
- Types ajoutés dans `lib/types.ts` : `ChatMessage`, `ChatConversation`, `ProfileUpdateData`
- 7 nouvelles icônes dans `components/icons.tsx` : Send, Trash, Edit, Globe, Camera, Refresh, NewChat
- CSS : ~830 lignes ajoutées (profil + chat module complet)

📝 Notes :
- GROQ_API_KEY doit être ajouté dans `.env.local` pour activer le Chat IA
- Migration `002_chat_conversations.sql` doit être exécutée dans Supabase SQL Editor
- Le chat fonctionne en mode dégradé sans clé Groq (message d'erreur clair)
- Build réussi : 22 routes compilées, 0 erreurs TypeScript

### Jour 4 — 2026-02-26

**Dev 1 — Améliorations UX Chat & Statistiques Dashboard**

✅ Tâches complétées :
- Module Chat (`app/(protected)/studio/chat/page.tsx`) :
  - Restauration automatique de l'historique : la dernière conversation active est dorénavant chargée immédiatement à l'ouverture du chat.
- Dashboard (`app/(protected)/dashboard/page.tsx`) :
  - Fetch de toutes les générations de l'utilisateur.
  - Remplacement de l'indicateur "Générations récentes" (capé à 5) par le vrai compteur "Générations au total".
  - Ajout d'une nouvelle section `Outils favoris` (Statistiques personnelles) :
    - Calcul du pourcentage d'utilisation pour chaque outil (Image, Chat, Vidéo, etc.)
    - Barres de progression stylisées avec les couleurs globales de la plateforme (`terracotta`, `savanna`, `gold`).

🔜 Prochaines étapes (Jour 5 — Dev 1) :
- [x] Module Vidéo : interface UI (prompt, durée).
- [x] Système de crédits : affichage dashboard + warnings.
- [x] Partage social : boutons WhatsApp/FB/Twitter.

### Jour 5 — 2026-02-27

**Dev 1 — Module Vidéo, Partage Social et Alertes Crédits**

✅ Tâches complétées :
- Module Vidéo (`app/(protected)/studio/video/page.tsx`) :
  - Interface Premium dédiée avec fond animé.
  - Saisie de prompt vidéo avec options de durée (3s, 5s, 15s).
  - Validation du plan de l'utilisateur (le plan Free est bloqué, le plan Starter est limité à 5s).
  - État de chargement ("Magie en cours") avec lecteur vidéo final.
- API Vidéo (`app/api/generate/video/route.ts`) :
  - Simulation de la génération avec facturation de 5 crédits.
  - Vérification de la validité du plan et des crédits restants.
  - Enregistrement du résultat mocké dans la base `generations`.
- Partage Social (`components/share-buttons.tsx`) :
  - Composant réutilisable de boutons de partage.
  - Options pour WhatsApp, Facebook, X (Twitter) et "Copier le lien".
  - Intégration dans le résultat du Studio Vidéo.
- Alertes Crédits :
  - Dashboard (`app/(protected)/dashboard/page.tsx`) : Bannière d'alerte rouge si l'utilisateur possède moins de 5 crédits (et n'est pas pro).
  - Header (`components/header.tsx`) : Le badge de crédits devient clignotant rouge lorsque les crédits passent en dessous de 5 pour inciter à recharger.

🔜 Prochaines étapes (Jour 6 — Dev 1/Dev 2) :
- [ ] Refactoring / Optimisation des composants UI.
- [ ] Connecter le module vidéo à une vraie API (ex: Replicate/Runway).

### Jour 8 — 2026-03-02

**Dev 1 — Vérification Chat + Refactoring**

✅ Tâches complétées :
- Vérification intégration Chat front↔back (fonctionnel depuis J3-4)
- Refactoring/optimisation : structure CSS unifiée (Image Studio + Gallery)

**Dev 2 — Module Image IA + Galerie complète**

✅ Tâches complétées :
- Client Hugging Face (`lib/huggingface.ts`) :
  - Support 2 modèles : FLUX.1-schnell (rapide) et SDXL (haute qualité)
  - Gestion erreurs : modèle en chargement, rate limiting, clé invalide
  - Calcul crédits automatique (SD/HD par modèle)
- API Image (`app/api/generate/image/route.ts`) :
  - Auth check, vérification crédits et plan
  - Appel Hugging Face Inference API
  - Watermark automatique (plan Free) via Sharp
  - Upload Supabase Storage + fallback base64
  - Déduction crédits + enregistrement `generations`
  - Coûts : 1-2 cr. FLUX (SD/HD), 2-3 cr. SDXL (SD/HD)
- Studio Image (`app/(protected)/studio/image/page.tsx`) :
  - Interface premium avec fond animé (orbs)
  - Textarea prompt avec compteur caractères (max 2000)
  - 6 suggestions de prompts pré-remplis
  - Sélection modèle (FLUX.1 / SDXL) avec descriptions
  - Sélection taille (512, 768, 1024 HD) avec badge PRO
  - Prompt négatif (collapsible)
  - Animation de génération ("Magie en cours ✨")
  - Résultat : aperçu + téléchargement + partage social + régénérer
  - Métadonnées : modèle, taille, crédits utilisés
  - Compteur crédits en temps réel
- Galerie complète (`app/(protected)/gallery/page.tsx`) :
  - Données réelles depuis `generations` (Supabase)
  - Filtres par type : Tout, Images, Chat, Vidéos
  - Barre de recherche par prompt (filtrage local)
  - Grille responsive : 2 cols → 3 cols → 4 cols
  - Cards avec preview, badge type, date, crédits
  - Actions : télécharger, partager, supprimer
  - Modal confirmation suppression
  - État vide avec CTAs vers studio
  - Statistiques : total, images, chats, vidéos
  - Skeleton loading pendant chargement
- API Galerie (`app/api/gallery/route.ts`) :
  - DELETE : suppression génération + fichier Storage
  - Vérification propriétaire via RLS
- Types Dev 2 ajoutés dans `lib/types.ts` :
  - `ImageModel`, `ImageSize`, `ImageGenerationRequest`
  - `GalleryFilterType`, `GalleryItem`
- Icône `IconSearch` ajoutée dans `components/icons.tsx`
- CSS : ~1200 lignes ajoutées (Image Studio + Gallery complet)
- Build réussi : 29 routes compilées, 0 erreurs TypeScript

📝 Notes :
- `HUGGINGFACE_API_KEY` doit être ajouté dans `.env.local` pour activer la génération d'images
- Le bucket `generations` doit être créé dans Supabase Storage avec policies RLS
- Sans clé HF, le Studio Image fonctionne UI-only (erreur claire au clic)
- Le watermark utilise Sharp (déjà installé dans le projet)

🔜 Prochaines étapes (Jour 9-10) :
- [ ] Galerie : téléchargement HD/SD selon plan
- [ ] Galerie : watermark automatique sur créations gratuites
- [ ] Module Vidéo : intégration front ↔ back
- [ ] Système crédits : logique déduction avancée

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
    /dashboard/profile/page.tsx    # ★ Profil utilisateur (édition inline)
    /gallery/page.tsx              # Galerie personnelle (placeholder)
    /studio/[module]/page.tsx      # Studio IA dynamique (placeholder)
    /studio/chat/page.tsx          # ★ Module Chat IA (streaming)
  /api/
    /auth/route.ts                 # GET session, POST logout
    /profile/route.ts              # ★ GET/PATCH profil utilisateur
    /generate/image/route.ts       # API image (placeholder)
    /generate/chat/route.ts        # ★ API chat Groq LLaMA (streaming SSE)
    /generate/video/route.ts       # API vidéo (placeholder)
    /chat/conversations/route.ts   # ★ CRUD conversations chat
    /payment/route.ts              # Webhook CinetPay (placeholder)
  /legal/
    /terms/page.tsx                # CGU
    /privacy/page.tsx              # Politique confidentialité

/components
  /auth-form.tsx                   # Composants auth réutilisables
  /header.tsx                      # Header/Navbar dynamique
  /icons.tsx                       # ★ Icônes SVG custom (22 icônes)

/lib
  /types.ts                        # Types TypeScript partagés
  /supabase/
    /client.ts                     # Client Supabase (browser)
    /server.ts                     # Client Supabase (server)
    /middleware.ts                 # Helper middleware Supabase

/supabase
  /migrations/
    /001_initial_schema.sql        # Schéma DB complet
    /002_chat_conversations.sql    # ★ Table conversations chat

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
REMOVEBG_API_KEY (optionnel - fallback vers RMBG gratuit)
```

---

## 📅 Mise à jour Mars 2026 — Nouveaux modules IA gratuits

### Nouveaux modèles et fonctionnalités

1. **Stable Diffusion 3.5 Medium** — Ajouté au Studio Image
   - Meilleure adhérence au prompt
   - Licence communautaire permissive
   - Fichiers : `lib/huggingface.ts`, `app/(protected)/studio/image/page.tsx`

2. **Module Amélioration d'Images** (`/studio/enhance`)
   - Upscaling x4 avec Real-ESRGAN (HuggingFace)
   - Suppression d'arrière-plan avec RMBG-1.4 (gratuit) ou remove.bg
   - Fichiers : `lib/enhance.ts`, `lib/removebg.ts`, `app/api/enhance/*`

3. **Module Synthèse Vocale** (`/studio/audio`)
   - Bark (Suno AI) via HuggingFace — 100% gratuit
   - Support multilingue : FR, EN, DE, ES, IT, PT, ZH
   - Fichiers : `lib/bark.ts`, `app/api/generate/audio/route.ts`

### Architecture mise à jour

```
lib/
├── huggingface.ts      # FLUX, SDXL, SD 3.5 Medium
├── enhance.ts          # Real-ESRGAN, GFPGAN, CodeFormer
├── removebg.ts         # RMBG-1.4, remove.bg API
├── bark.ts             # Synthèse vocale multilingue
├── replicate.ts        # Vidéo (Wan 2.1)
└── cinetpay.ts         # Paiement Mobile Money

app/(protected)/studio/
├── image/              # Génération images (3 modèles)
├── chat/               # Chat IA (Groq LLaMA 3.3)
├── video/              # Génération vidéo
├── enhance/            # Upscaling + Remove BG
└── audio/              # Synthèse vocale Bark

app/api/
├── generate/
│   ├── image/          # POST génération image
│   ├── video/          # POST/GET/DELETE vidéo
│   └── audio/          # POST synthèse vocale
└── enhance/
    ├── upscale/        # POST upscaling x4
    └── remove-bg/      # POST suppression fond
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
