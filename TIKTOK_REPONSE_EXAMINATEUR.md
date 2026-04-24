# Guide de Réponse pour l'Examen TikTok

Ce document contient tout ce dont vous avez besoin pour répondre à l'examinateur TikTok et pour réaliser votre vidéo de démonstration.

## 1. Réponse Écrite à l'Examinateur

Voici un modèle de réponse à copier-coller (ou à adapter) pour l'examinateur de l'application TikTok :

---

**Bonjour l'équipe d'examen TikTok,**

Merci pour vos retours. Voici les explications demandées concernant le fonctionnement de chaque produit et scope dans notre application JadaRiseLabs, ainsi que les modifications apportées :

**1. Politique de confidentialité :**
Nous avons mis à jour notre Politique de Confidentialité pour y inclure explicitement notre utilisation de l'API TikTok. La politique de confidentialité est désormais facilement et directement accessible depuis le pied de page (Footer) de notre page d'accueil (Homepage) ainsi que dans le menu de navigation principal : `https://[VOTRE_DOMAINE_OU_VERCEL_URL]/legal/privacy`

**2. Explication des Produits et Scopes (Portées) demandés :**
Notre application "JadaRiseLabs" utilise l'API TikTok pour les fonctionnalités suivantes :

*   **Login Kit (scope : `user.info.basic`) :**
    *   **Comment ça fonctionne :** Nous utilisons le Login Kit pour permettre à nos utilisateurs de s'authentifier de manière sécurisée et de lier leur compte TikTok à leur tableau de bord JadaRiseLabs. Nous récupérons uniquement les informations basiques (comme l'avatar et le nom d'utilisateur) pour confirmer visuellement à l'utilisateur que le bon compte est connecté dans notre interface.
*   **Content Posting API / Direct Post (scope : `video.publish`) :**
    *   **Comment ça fonctionne :** Notre plateforme permet aux utilisateurs de générer des images et des vidéos grâce à l'Intelligence Artificielle. Une fois la création terminée, l'utilisateur a la possibilité d'utiliser le bouton "Publier" pour envoyer directement le contenu généré sur son compte personnel TikTok. L'API est appelée via `https://open.tiktokapis.com/v2/post/publish/content/init/`. Aucune publication n'est effectuée de manière automatique sans le déclenchement explicite de l'utilisateur.

**3. Démonstration Vidéo (Bac à sable / Sandbox) :**
J'ai enregistré une nouvelle vidéo de démonstration utilisant le **TikTok Sandbox** (Bac à sable). Dans cette vidéo, je démontre clairement :
1. Le flux d'authentification complet via le Login Kit.
2. Le processus de création d'un contenu et sa publication directe via l'API (Video/Photo Publish).
Vous trouverez le lien de la vidéo jointe à cette soumission.

Merci d'avance pour la révision de notre application.

Cordialement,
L'équipe JadaRiseLabs

---

## 2. Guide pour la Vidéo de Démonstration (À Faire !)

L'examinateur a été très clair : **"Tous les produits et portées sélectionnés doivent être clairement démontrés dans la vidéo. Vous devez utiliser le bac à sable pour démontrer l'intégration."**

Voici le script étape par étape pour enregistrer votre vidéo de démonstration :

**Préparation :**
1. Utilisez un logiciel d'enregistrement d'écran (comme OBS, Loom, ou l'outil natif de votre ordinateur).
2. Assurez-vous que l'URL de votre site JadaRiseLabs (même si c'est localhost ou une URL de test) est bien visible dans la barre d'adresse du navigateur.
3. **IMPORTANT :** Connectez-vous à un compte TikTok de test qui a été ajouté à votre **Sandbox** (Bac à sable) dans la console développeur TikTok.

**Action à filmer (Le Scénario) :**

1. **Montrer la page d'accueil et la Politique de Confidentialité (10 secondes) :**
   * Allez sur la page d'accueil de JadaRiseLabs.
   * Scrollez vers le bas ou regardez le menu en haut, cliquez sur le lien "Politique de confidentialité" (Confidentialité).
   * Montrez que la page s'ouvre bien, et scrollez jusqu'à la section "5. Intégration des Réseaux Sociaux et TikTok".

2. **Démonstration du Login Kit (`user.info.basic`) (20 secondes) :**
   * Allez dans le tableau de bord de l'utilisateur sur JadaRiseLabs, dans la section "Réseaux Sociaux" ou "Paramètres de compte".
   * Cliquez sur le bouton "Connecter TikTok".
   * Montrez la page d'autorisation de TikTok (l'URL TikTok doit être visible) qui demande la permission de se connecter à JadaRiseLabs.
   * Acceptez et montrez le retour sur JadaRiseLabs où le compte est désormais indiqué comme "Connecté" (montrant l'avatar ou le pseudo si disponible).

3. **Démonstration de la publication (`video.publish`) (30 secondes) :**
   * Allez dans la section de l'application où l'on génère/visualise une image ou vidéo (par exemple, le Studio IA).
   * Sélectionnez un média ou écrivez un petit texte pour l'accompagner.
   * Cliquez sur le bouton "Publier sur TikTok" (ou équivalent dans votre interface).
   * Montrez un message de succès confirmant que le contenu a bien été envoyé.
   * (Optionnel mais très recommandé) : Ouvrez l'application TikTok sur mobile ou web (avec le compte Sandbox) et montrez que la vidéo/photo est bien arrivée dans les brouillons ou a été publiée.

**Conseil final :** Ne parlez pas forcément, mais bougez la souris lentement pour que l'examinateur puisse bien lire les textes et voir vos clics. Si votre vidéo montre exactement le Login puis le Publish, elle sera approuvée sans problème.
