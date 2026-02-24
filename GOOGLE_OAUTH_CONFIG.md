# Google OAuth Configuration — JadaRiseLabs

## Identifiants Google OAuth

| Champ | Valeur |
|-------|--------|
| **Client ID** | `220402192894-qvkkc92cbg99vggg9ac01jves4e72cvu.apps.googleusercontent.com` |
| **Client Secret** | `⚠️ Voir dans Supabase Dashboard ou Google Cloud Console` |
| **Project ID** | `jadariselabs` |

---

## Configuration Google Cloud Console

**APIs & Services → Credentials → OAuth 2.0 Client IDs**

### Redirect URIs autorisés :
```
https://alkgpgyvrpomezcueich.supabase.co/auth/v1/callback
https://jadariselabs-git-develop-jada.vercel.app/auth/callback
```

---

## Configuration Supabase Dashboard

### 1. Authentication → URL Configuration

| Champ | Valeur |
|-------|--------|
| **Site URL** | `https://jadariselabs-git-develop-jada.vercel.app` |
| **Redirect URLs** | `https://jadariselabs-git-develop-jada.vercel.app/auth/callback` |

### 2. Authentication → Providers → Google

| Champ | Valeur |
|-------|--------|
| **Enable Google** | ✅ Activé |
| **Client ID** | `220402192894-qvkkc92cbg99vggg9ac01jves4e72cvu.apps.googleusercontent.com` |
| **Client Secret** | `⚠️ Récupérer depuis Google Cloud Console` |

---

## URLs de l'application

| Environnement | URL |
|---------------|-----|
| **Production** | `https://jadariselabs-git-develop-jada.vercel.app` |
| **Login** | `https://jadariselabs-git-develop-jada.vercel.app/login` |
| **Callback** | `https://jadariselabs-git-develop-jada.vercel.app/auth/callback` |

---

## Checklist

- [ ] Google Cloud Console : Redirect URIs configurés
- [ ] Supabase : Site URL configuré
- [ ] Supabase : Redirect URLs configuré
- [ ] Supabase : Google provider activé avec Client ID/Secret
- [ ] Supabase : Google provider "Save" cliqué

---

## Sécurité

⚠️ **Ne jamais commit** le fichier `client_secret_*.json` dans le repository.
Ce fichier doit rester en local uniquement.
