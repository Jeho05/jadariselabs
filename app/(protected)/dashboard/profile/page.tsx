'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, SupportedLang } from '@/lib/types';
import { PLANS } from '@/lib/types';
import {
    IconUser,
    IconEdit,
    IconGlobe,
    IconZap,
    IconCrown,
    IconCamera,
} from '@/components/icons';

/**
 * Profile Page — View & Edit user profile
 * Includes: username, language, avatar, plan info, account deletion
 */
export default function ProfilePage() {
    const supabase = createClient();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    // Editable fields
    const [editUsername, setEditUsername] = useState('');
    const [editLang, setEditLang] = useState<SupportedLang>('fr');
    const [editAvatarUrl, setEditAvatarUrl] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    const fetchProfile = useCallback(async () => {
        const res = await fetch('/api/profile');
        if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
            setEmail(data.email || '');
            setEditUsername(data.profile.username || '');
            setEditLang(data.profile.preferred_lang || 'fr');
            setEditAvatarUrl(data.profile.avatar_url || '');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: editUsername,
                    preferred_lang: editLang,
                    avatar_url: editAvatarUrl || null,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
            } else {
                setProfile(data.profile);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch {
            setMessage({ type: 'error', text: 'Erreur réseau. Réessayez.' });
        }

        setSaving(false);
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            '⚠️ ATTENTION : Cette action est irréversible !\n\nToutes vos données, générations et conversations seront supprimées définitivement.\n\nVoulez-vous vraiment supprimer votre compte ?'
        );

        if (!confirmed) return;

        const doubleConfirm = window.confirm(
            'Dernière confirmation : tapez OK pour supprimer définitivement votre compte.'
        );

        if (!doubleConfirm) return;

        await supabase.auth.signOut();
        window.location.href = '/';
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="profile-card glass-card">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-32 mb-6 rounded-lg" />
                    <div className="skeleton h-10 w-full mb-3 rounded-lg" />
                    <div className="skeleton h-10 w-full mb-3 rounded-lg" />
                    <div className="skeleton h-10 w-full rounded-lg" />
                </div>
            </div>
        );
    }

    const currentPlan = PLANS[profile?.plan || 'free'];

    return (
        <div className="profile-container">
            <div className="profile-header-section">
                <h1 style={{ fontFamily: 'var(--font-heading)' }}>Mon Profil</h1>
                <p>Gérez vos informations personnelles</p>
            </div>

            {/* Message feedback */}
            {message && (
                <div className={`profile-message ${message.type}`}>
                    {message.type === 'success' ? '✓' : '✕'} {message.text}
                </div>
            )}

            <div className="profile-grid">
                {/* Main Profile Card */}
                <div className="profile-card glass-card">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">
                            {profile?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.avatar_url} alt="Avatar" />
                            ) : (
                                <span>{profile?.username?.[0]?.toUpperCase() || '?'}</span>
                            )}
                            {isEditing && (
                                <div className="profile-avatar-overlay">
                                    <IconCamera size={20} />
                                </div>
                            )}
                        </div>
                        <div className="profile-identity">
                            <h2>@{profile?.username || 'utilisateur'}</h2>
                            <p className="profile-email">{email}</p>
                            <div className="profile-plan-badge">
                                {profile?.plan === 'pro' ? (
                                    <IconCrown size={14} />
                                ) : (
                                    <IconZap size={14} />
                                )}
                                Plan{' '}
                                {profile?.plan === 'free'
                                    ? 'Gratuit'
                                    : profile?.plan === 'starter'
                                        ? 'Starter'
                                        : 'Pro'}
                            </div>
                        </div>
                    </div>

                    {/* Edit button */}
                    {!isEditing ? (
                        <button
                            className="profile-edit-btn"
                            onClick={() => setIsEditing(true)}
                        >
                            <IconEdit size={16} />
                            Modifier mon profil
                        </button>
                    ) : (
                        <div className="profile-form stagger-children">
                            {/* Username */}
                            <div className="input-group">
                                <label>
                                    <IconUser size={14} /> Pseudo
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '1rem' }}
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        placeholder="Votre pseudo"
                                        minLength={3}
                                        maxLength={20}
                                        pattern="[a-zA-Z0-9_]+"
                                    />
                                </div>
                                <span className="profile-field-hint">
                                    3-20 caractères, lettres, chiffres et underscores
                                </span>
                            </div>

                            {/* Language */}
                            <div className="input-group">
                                <label>
                                    <IconGlobe size={14} /> Langue préférée
                                </label>
                                <div className="lang-selector">
                                    <button
                                        className={`lang-btn ${editLang === 'fr' ? 'active' : ''}`}
                                        onClick={() => setEditLang('fr')}
                                        type="button"
                                    >
                                        🇫🇷 Français
                                    </button>
                                    <button
                                        className={`lang-btn ${editLang === 'en' ? 'active' : ''}`}
                                        onClick={() => setEditLang('en')}
                                        type="button"
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>

                            {/* Avatar URL */}
                            <div className="input-group">
                                <label>
                                    <IconCamera size={14} /> URL Avatar (optionnel)
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="url"
                                        className="input-field"
                                        style={{ paddingLeft: '1rem' }}
                                        value={editAvatarUrl}
                                        onChange={(e) => setEditAvatarUrl(e.target.value)}
                                        placeholder="https://example.com/avatar.jpg"
                                    />
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="profile-actions">
                                <button
                                    className="btn-auth"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditUsername(profile?.username || '');
                                        setEditLang(profile?.preferred_lang || 'fr');
                                        setEditAvatarUrl(profile?.avatar_url || '');
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div className="profile-stats-card glass-card">
                    <h3 style={{ fontFamily: 'var(--font-heading)' }}>Détails du compte</h3>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Plan actuel</span>
                        <span className="profile-stat-value capitalize">
                            {profile?.plan === 'free'
                                ? 'Gratuit'
                                : profile?.plan === 'starter'
                                    ? 'Starter'
                                    : 'Pro'}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Crédits restants</span>
                        <span className="profile-stat-value">
                            {profile?.credits === -1 ? '∞ Illimité' : `${profile?.credits ?? 0} crédits`}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Crédits/mois</span>
                        <span className="profile-stat-value">
                            {currentPlan.credits_per_month === -1
                                ? '∞ Illimité'
                                : `${currentPlan.credits_per_month} crédits`}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Images HD</span>
                        <span className="profile-stat-value">
                            {currentPlan.image_hd ? '✓ Activé' : '✕ Non disponible'}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Vidéo IA</span>
                        <span className="profile-stat-value">
                            {currentPlan.video
                                ? `✓ Jusqu'à ${currentPlan.video_max_seconds}s`
                                : '✕ Non disponible'}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Watermark</span>
                        <span className="profile-stat-value">
                            {currentPlan.watermark ? '✓ Oui' : '✕ Non'}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">Membre depuis</span>
                        <span className="profile-stat-value">
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })
                                : '—'}
                        </span>
                    </div>

                    {profile?.plan === 'free' && (
                        <div className="profile-upgrade-cta">
                            <p>💡 Passez au plan Starter ou Pro pour débloquer toutes les fonctionnalités !</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="profile-danger-zone">
                <h3>Zone dangereuse</h3>
                <p>
                    La suppression de votre compte est irréversible. Toutes vos données seront
                    perdues.
                </p>
                <button
                    className="profile-delete-btn"
                    onClick={handleDeleteAccount}
                >
                    Supprimer mon compte
                </button>
            </div>
        </div>
    );
}
