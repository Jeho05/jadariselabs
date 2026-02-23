# 🌍 JadaRiseLabs — Laboratoire IA Tout-en-1

> Plateforme web tout-en-un qui démocratise l'accès aux IA génératives pour le grand public africain.

**Jada** (sagesse en Haoussa) + **Rise** (élévation) + **Labs** (innovation)

## 🚀 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14+ (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes (serverless) |
| Base de données | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email + Google OAuth) |
| Stockage | Supabase Storage |
| Hébergement | Vercel |
| IA Images | Hugging Face (FLUX / SDXL) |
| IA Texte | Groq (LLaMA 3.3 70B) |
| IA Vidéo | Replicate (Wan 2.1) |
| Paiement | CinetPay (Mobile Money) |

## 📦 Installation

```bash
# Cloner le repo
git clone https://github.com/Jeho05/jadariselabs.git
cd jadariselabs

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local
# → Remplir les clés API dans .env.local

# Lancer en développement
npm run dev
```

## 🌿 Git Workflow

- `main` — branche de production (déployée sur Vercel)
- `develop` — branche de développement
- `feature/*` — une branche par fonctionnalité

```bash
# Créer une nouvelle feature
git checkout develop
git pull origin develop
git checkout -b feature/nom-feature

# Après développement
git add .
git commit -m "feat: description claire"
git push origin feature/nom-feature
# → Créer une Pull Request vers develop
```

## 👥 Équipe

- **Dev 1** : Auth, Dashboard, Chat IA, Vidéo, Crédits, Partage social
- **Dev 2** : Image IA, Galerie, Paiement CinetPay

## 📄 Licence

Confidentiel — Tous droits réservés © 2025 JadaRiseLabs
