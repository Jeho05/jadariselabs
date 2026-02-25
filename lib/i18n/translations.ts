// ============================================
// JadaRiseLabs — Translations (FR/EN)
// ============================================

export type TranslationKey = keyof typeof translations.fr;

export const translations = {
  fr: {
    // === COMMON ===
    'common.loading': 'Chargement...',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.back': 'Retour',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    'common.confirm': 'Confirmer',
    'common.close': 'Fermer',
    'common.or': 'ou',

    // === NAVIGATION ===
    'nav.dashboard': 'Dashboard',
    'nav.studio': 'Studio IA',
    'nav.gallery': 'Galerie',
    'nav.profile': 'Mon profil',
    'nav.logout': 'Se déconnecter',
    'nav.login': 'Connexion',
    'nav.signup': "S'inscrire",
    'nav.credits': 'crédits',
    'nav.unlimited': 'Illimité',

    // === PROFILE PAGE ===
    'profile.title': 'Mon Profil',
    'profile.subtitle': 'Gérez vos informations personnelles',
    'profile.editBtn': 'Modifier mon profil',
    'profile.saveBtn': 'Enregistrer les modifications',
    'profile.saving': 'Sauvegarde...',
    'profile.success': 'Profil mis à jour avec succès !',
    'profile.networkError': 'Erreur réseau. Réessayez.',

    // Username
    'profile.username.label': 'Pseudo',
    'profile.username.placeholder': 'Votre pseudo',
    'profile.username.hint': '3-20 caractères, lettres, chiffres et underscores',
    'profile.username.errorLength': 'Le pseudo doit contenir entre 3 et 20 caractères',
    'profile.username.errorChars': 'Le pseudo ne peut contenir que des lettres, chiffres et underscores',
    'profile.username.errorTaken': 'Ce pseudo est déjà utilisé',

    // Language
    'profile.language.label': 'Langue préférée',
    'profile.language.french': 'Français',
    'profile.language.english': 'English',

    // Avatar
    'profile.avatar.label': 'Photo de profil',
    'profile.avatar.dropzone': 'Glissez une image ici',
    'profile.avatar.dropzoneOr': 'ou cliquez pour sélectionner',
    'profile.avatar.dropzoneActive': 'Déposez votre image',
    'profile.avatar.preview': 'Aperçu de votre nouvelle photo',
    'profile.avatar.uploading': 'Upload en cours...',
    'profile.avatar.remove': 'Supprimer la photo',
    'profile.avatar.errorSize': 'L\'image est trop lourde (max 2MB). Réduisez sa taille et réessayez.',
    'profile.avatar.errorFormat': 'Format non supporté. Utilisez JPG, PNG, WebP ou GIF.',
    'profile.avatar.errorUpload': 'Erreur lors de l\'upload. Réessayez.',

    // Account details
    'profile.account.title': 'Détails du compte',
    'profile.account.plan': 'Plan actuel',
    'profile.account.credits': 'Crédits restants',
    'profile.account.creditsMonth': 'Crédits/mois',
    'profile.account.imageHd': 'Images HD',
    'profile.account.video': 'Vidéo IA',
    'profile.account.watermark': 'Watermark',
    'profile.account.memberSince': 'Membre depuis',
    'profile.account.enabled': 'Activé',
    'profile.account.disabled': 'Non disponible',
    'profile.account.yes': 'Oui',
    'profile.account.no': 'Non',
    'profile.account.unlimited': 'Illimité',

    // Plans
    'plan.free': 'Gratuit',
    'plan.starter': 'Starter',
    'plan.pro': 'Pro',
    'plan.upgrade': 'Passez au plan Starter ou Pro pour débloquer toutes les fonctionnalités !',

    // Danger zone
    'profile.danger.title': 'Zone dangereuse',
    'profile.danger.description': 'La suppression de votre compte est irréversible. Toutes vos données seront perdues.',
    'profile.danger.deleteBtn': 'Supprimer mon compte',
    'profile.danger.confirm1': '⚠️ ATTENTION : Cette action est irréversible !\n\nToutes vos données, générations et conversations seront supprimées définitivement.\n\nVoulez-vous vraiment supprimer votre compte ?',
    'profile.danger.confirm2': 'Dernière confirmation : tapez OK pour supprimer définitivement votre compte.',

    // === AUTH ===
    'auth.login.title': 'Se connecter',
    'auth.login.subtitle': 'Accédez à votre compte JadaRiseLabs',
    'auth.login.btn': 'Se connecter',
    'auth.login.forgotPassword': 'Mot de passe oublié ?',
    'auth.login.noAccount': 'Pas encore de compte ?',
    'auth.login.createAccount': 'Créer un compte',

    'auth.signup.title': 'Créer un compte',
    'auth.signup.subtitle': 'Rejoignez JadaRiseLabs et accédez à l\'IA gratuitement',
    'auth.signup.btn': 'Créer mon compte gratuit',
    'auth.signup.haveAccount': 'Déjà un compte ?',
    'auth.signup.terms': 'J\'accepte les conditions d\'utilisation et la politique de confidentialité',
    'auth.signup.freeCredits': '50 crédits offerts • Aucune carte bancaire requise',

    'auth.email.label': 'Email',
    'auth.email.placeholder': 'vous@example.com',
    'auth.password.label': 'Mot de passe',
    'auth.password.placeholder': 'Votre mot de passe',
    'auth.password.create': 'Créer un mot de passe fort',
    'auth.password.confirm': 'Confirmer le mot de passe',
    'auth.password.confirmPlaceholder': 'Retapez votre mot de passe',
    'auth.password.strength.weak': 'Faible',
    'auth.password.strength.medium': 'Moyen',
    'auth.password.strength.good': 'Bon',
    'auth.password.strength.strong': 'Fort',
    'auth.password.mismatch': 'Les mots de passe ne correspondent pas',

    'auth.error.invalidCredentials': 'Email ou mot de passe incorrect',
    'auth.error.emailInUse': 'Cet email est déjà utilisé',
    'auth.error.weakPassword': 'Le mot de passe ne respecte pas les critères de sécurité',
    'auth.error.network': 'Une erreur réseau est survenue. Vérifiez votre connexion.',
    'auth.error.generic': 'Une erreur est survenue. Réessayez.',

    'auth.verify.title': 'Vérifiez votre email',
    'auth.verify.subtitle': 'Un lien de confirmation a été envoyé à',
    'auth.verify.info': 'Cliquez sur le lien dans l\'email pour activer votre compte.',
    'auth.verify.spam': 'Pensez à vérifier vos spams si vous ne trouvez pas l\'email.',

    // === DASHBOARD ===
    'dashboard.welcome': 'Bienvenue',
    'dashboard.subtitle': 'Que voulez-vous créer aujourd\'hui ?',
    'dashboard.stats.credits': 'Crédits',
    'dashboard.stats.generations': 'Générations',
    'dashboard.stats.plan': 'Plan',
    'dashboard.modules.title': 'Modules IA',
    'dashboard.modules.chat': 'Chat IA',
    'dashboard.modules.chatDesc': 'Conversez avec l\'IA en français ou anglais',
    'dashboard.modules.image': 'Image IA',
    'dashboard.modules.imageDesc': 'Générez des images uniques',
    'dashboard.modules.video': 'Vidéo IA',
    'dashboard.modules.videoDesc': 'Créez des vidéos courtes',
    'dashboard.generations.title': 'Générations récentes',
    'dashboard.generations.empty': 'Aucune génération pour le moment',
    'dashboard.generations.start': 'Commencez par créer quelque chose !',

    // === CHAT ===
    'chat.title': 'Chat IA',
    'chat.newChat': 'Nouvelle conversation',
    'chat.placeholder': 'Écrivez votre message...',
    'chat.send': 'Envoyer',
    'chat.empty.title': 'Démarrer une conversation',
    'chat.empty.subtitle': 'Posez une question ou demandez à l\'IA de créer quelque chose pour vous.',
    'chat.suggestions.write': 'Écris un poème sur l\'Afrique',
    'chat.suggestions.explain': 'Explique-moi le machine learning',
    'chat.suggestions.translate': 'Traduis ce texte en anglais',
    'chat.suggestions.code': 'Aide-moi à coder une fonction',
    'chat.error': 'Une erreur est survenue. Réessayez.',
    'chat.conversations': 'Conversations',
    'chat.noConversations': 'Aucune conversation',

    // === HEADER ===
    'header.logo': 'JadaRiseLabs',
  },

  en: {
    // === COMMON ===
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.confirm': 'Confirm',
    'common.close': 'Close',
    'common.or': 'or',

    // === NAVIGATION ===
    'nav.dashboard': 'Dashboard',
    'nav.studio': 'AI Studio',
    'nav.gallery': 'Gallery',
    'nav.profile': 'My profile',
    'nav.logout': 'Log out',
    'nav.login': 'Login',
    'nav.signup': 'Sign up',
    'nav.credits': 'credits',
    'nav.unlimited': 'Unlimited',

    // === PROFILE PAGE ===
    'profile.title': 'My Profile',
    'profile.subtitle': 'Manage your personal information',
    'profile.editBtn': 'Edit my profile',
    'profile.saveBtn': 'Save changes',
    'profile.saving': 'Saving...',
    'profile.success': 'Profile updated successfully!',
    'profile.networkError': 'Network error. Please try again.',

    // Username
    'profile.username.label': 'Username',
    'profile.username.placeholder': 'Your username',
    'profile.username.hint': '3-20 characters, letters, numbers and underscores',
    'profile.username.errorLength': 'Username must be between 3 and 20 characters',
    'profile.username.errorChars': 'Username can only contain letters, numbers and underscores',
    'profile.username.errorTaken': 'This username is already taken',

    // Language
    'profile.language.label': 'Preferred language',
    'profile.language.french': 'Français',
    'profile.language.english': 'English',

    // Avatar
    'profile.avatar.label': 'Profile picture',
    'profile.avatar.dropzone': 'Drag an image here',
    'profile.avatar.dropzoneOr': 'or click to select',
    'profile.avatar.dropzoneActive': 'Drop your image',
    'profile.avatar.preview': 'Preview of your new photo',
    'profile.avatar.uploading': 'Uploading...',
    'profile.avatar.remove': 'Remove photo',
    'profile.avatar.errorSize': 'Image is too large (max 2MB). Reduce its size and try again.',
    'profile.avatar.errorFormat': 'Unsupported format. Use JPG, PNG, WebP or GIF.',
    'profile.avatar.errorUpload': 'Upload error. Please try again.',

    // Account details
    'profile.account.title': 'Account details',
    'profile.account.plan': 'Current plan',
    'profile.account.credits': 'Remaining credits',
    'profile.account.creditsMonth': 'Credits/month',
    'profile.account.imageHd': 'HD Images',
    'profile.account.video': 'AI Video',
    'profile.account.watermark': 'Watermark',
    'profile.account.memberSince': 'Member since',
    'profile.account.enabled': 'Enabled',
    'profile.account.disabled': 'Not available',
    'profile.account.yes': 'Yes',
    'profile.account.no': 'No',
    'profile.account.unlimited': 'Unlimited',

    // Plans
    'plan.free': 'Free',
    'plan.starter': 'Starter',
    'plan.pro': 'Pro',
    'plan.upgrade': 'Upgrade to Starter or Pro to unlock all features!',

    // Danger zone
    'profile.danger.title': 'Danger zone',
    'profile.danger.description': 'Account deletion is irreversible. All your data will be lost.',
    'profile.danger.deleteBtn': 'Delete my account',
    'profile.danger.confirm1': '⚠️ WARNING: This action is irreversible!\n\nAll your data, generations and conversations will be permanently deleted.\n\nDo you really want to delete your account?',
    'profile.danger.confirm2': 'Final confirmation: type OK to permanently delete your account.',

    // === AUTH ===
    'auth.login.title': 'Login',
    'auth.login.subtitle': 'Access your JadaRiseLabs account',
    'auth.login.btn': 'Login',
    'auth.login.forgotPassword': 'Forgot password?',
    'auth.login.noAccount': 'No account yet?',
    'auth.login.createAccount': 'Create an account',

    'auth.signup.title': 'Create an account',
    'auth.signup.subtitle': 'Join JadaRiseLabs and access AI for free',
    'auth.signup.btn': 'Create my free account',
    'auth.signup.haveAccount': 'Already have an account?',
    'auth.signup.terms': 'I accept the terms of use and privacy policy',
    'auth.signup.freeCredits': '50 free credits • No credit card required',

    'auth.email.label': 'Email',
    'auth.email.placeholder': 'you@example.com',
    'auth.password.label': 'Password',
    'auth.password.placeholder': 'Your password',
    'auth.password.create': 'Create a strong password',
    'auth.password.confirm': 'Confirm password',
    'auth.password.confirmPlaceholder': 'Retype your password',
    'auth.password.strength.weak': 'Weak',
    'auth.password.strength.medium': 'Medium',
    'auth.password.strength.good': 'Good',
    'auth.password.strength.strong': 'Strong',
    'auth.password.mismatch': 'Passwords do not match',

    'auth.error.invalidCredentials': 'Invalid email or password',
    'auth.error.emailInUse': 'This email is already in use',
    'auth.error.weakPassword': 'Password does not meet security requirements',
    'auth.error.network': 'A network error occurred. Check your connection.',
    'auth.error.generic': 'An error occurred. Please try again.',

    'auth.verify.title': 'Verify your email',
    'auth.verify.subtitle': 'A confirmation link has been sent to',
    'auth.verify.info': 'Click the link in the email to activate your account.',
    'auth.verify.spam': 'Check your spam folder if you can\'t find the email.',

    // === DASHBOARD ===
    'dashboard.welcome': 'Welcome',
    'dashboard.subtitle': 'What do you want to create today?',
    'dashboard.stats.credits': 'Credits',
    'dashboard.stats.generations': 'Generations',
    'dashboard.stats.plan': 'Plan',
    'dashboard.modules.title': 'AI Modules',
    'dashboard.modules.chat': 'AI Chat',
    'dashboard.modules.chatDesc': 'Chat with AI in French or English',
    'dashboard.modules.image': 'AI Image',
    'dashboard.modules.imageDesc': 'Generate unique images',
    'dashboard.modules.video': 'AI Video',
    'dashboard.modules.videoDesc': 'Create short videos',
    'dashboard.generations.title': 'Recent generations',
    'dashboard.generations.empty': 'No generations yet',
    'dashboard.generations.start': 'Start by creating something!',

    // === CHAT ===
    'chat.title': 'AI Chat',
    'chat.newChat': 'New conversation',
    'chat.placeholder': 'Write your message...',
    'chat.send': 'Send',
    'chat.empty.title': 'Start a conversation',
    'chat.empty.subtitle': 'Ask a question or ask the AI to create something for you.',
    'chat.suggestions.write': 'Write a poem about Africa',
    'chat.suggestions.explain': 'Explain machine learning to me',
    'chat.suggestions.translate': 'Translate this text to French',
    'chat.suggestions.code': 'Help me code a function',
    'chat.error': 'An error occurred. Please try again.',
    'chat.conversations': 'Conversations',
    'chat.noConversations': 'No conversations',

    // === HEADER ===
    'header.logo': 'JadaRiseLabs',
  },
} as const;

export type Translations = typeof translations;
export type Language = keyof Translations;
