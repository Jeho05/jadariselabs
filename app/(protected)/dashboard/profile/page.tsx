'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, SupportedLang } from '@/lib/types';
import { PLANS } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';
import {
    IconUser,
    IconEdit,
    IconGlobe,
    IconZap,
    IconCrown,
    IconCamera,
    IconUpload,
    IconClose,
    IconInfinity,
} from '@/components/icons';

// Constants
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Profile Page — View & Edit user profile
 * Features: drag & drop avatar, translations, username, language, plan info
 */
export default function ProfilePage() {
    const { t, lang, setLang } = useTranslation();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    const [isEditing, setIsEditing] = useState(false);

    // Avatar upload state
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const fetchProfile = useCallback(async () => {
        const res = await fetch('/api/profile');
        if (res.ok) {
            const data = await res.json();
            setProfile(data.profile);
            setEmail(data.email || '');
            setEditUsername(data.profile.username || '');
            setEditLang(data.profile.preferred_lang || 'fr');
            // Sync language with i18n provider
            if (data.profile.preferred_lang) {
                setLang(data.profile.preferred_lang);
            }
        }
        setLoading(false);
    }, [setLang]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    // Handle drag events for avatar
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    // Validate file
    const validateFile = useCallback((file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return t('profile.avatar.errorSize');
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            return t('profile.avatar.errorFormat');
        }
        return null;
    }, [t]);

    // Handle file drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const error = validateFile(files[0]);
            if (error) {
                setMessage({ type: 'error', text: error });
                return;
            }
            setAvatarFile(files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    }, [validateFile]);

    // Handle file input change
    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const error = validateFile(files[0]);
            if (error) {
                setMessage({ type: 'error', text: error });
                return;
            }
            setAvatarFile(files[0]);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(files[0]);
        }
    }, [validateFile]);

    // Upload avatar
    const uploadAvatar = useCallback(async (): Promise<string | null> => {
        if (!avatarFile) return profile?.avatar_url || null;

        setUploadingAvatar(true);
        try {
            const formData = new FormData();
            formData.append('file', avatarFile);

            const res = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) {
                setMessage({ type: 'error', text: data.error || t('profile.avatar.errorUpload') });
                return null;
            }
            return data.avatar_url;
        } catch {
            setMessage({ type: 'error', text: t('profile.avatar.errorUpload') });
            return null;
        } finally {
            setUploadingAvatar(false);
        }
    }, [avatarFile, profile?.avatar_url, t]);

    // Remove avatar
    const handleRemoveAvatar = useCallback(async () => {
        try {
            const res = await fetch('/api/profile/avatar', {
                method: 'DELETE',
            });
            if (res.ok) {
                setProfile((prev) => prev ? { ...prev, avatar_url: null } : null);
                setAvatarPreview(null);
                setAvatarFile(null);
                setMessage({ type: 'success', text: t('profile.success') });
            }
        } catch {
            setMessage({ type: 'error', text: t('profile.networkError') });
        }
    }, [t]);

    // Save profile
    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            // Upload avatar first if there's a new file
            let avatarUrl = profile?.avatar_url;
            if (avatarFile) {
                avatarUrl = await uploadAvatar();
                if (!avatarUrl && avatarFile) {
                    // Upload failed, don't continue
                    setSaving(false);
                    return;
                }
            }

            const res = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: editUsername,
                    preferred_lang: editLang,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessage({ type: 'error', text: data.error });
            } else {
                setProfile({ ...data.profile, avatar_url: avatarUrl || data.profile.avatar_url });
                setLang(editLang);
                setIsEditing(false);
                setAvatarFile(null);
                setAvatarPreview(null);
                setMessage({ type: 'success', text: t('profile.success') });
                setTimeout(() => setMessage(null), 3000);
            }
        } catch {
            setMessage({ type: 'error', text: t('profile.networkError') });
        }

        setSaving(false);
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(t('profile.danger.confirm1'));
        if (!confirmed) return;

        const doubleConfirm = window.confirm(t('profile.danger.confirm2'));
        if (!doubleConfirm) return;

        await supabase.auth.signOut();
        window.location.href = '/';
    };

    // Get plan label
    const getPlanLabel = useCallback((plan: string) => {
        switch (plan) {
            case 'free': return t('plan.free');
            case 'starter': return t('plan.starter');
            case 'pro': return t('plan.pro');
            default: return plan;
        }
    }, [t]);

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
    const displayAvatar = avatarPreview || profile?.avatar_url;

    return (
        <div className="profile-container">
            <div className="profile-header-section">
                <h1 style={{ fontFamily: 'var(--font-heading)' }}>{t('profile.title')}</h1>
                <p>{t('profile.subtitle')}</p>
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
                    {/* Avatar Section */}
                    <div className="profile-avatar-section">
                        {!isEditing ? (
                            // View mode - simple avatar display
                            <div className="profile-avatar-large">
                                {displayAvatar ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={displayAvatar} alt="Avatar" />
                                ) : (
                                    <span>{profile?.username?.[0]?.toUpperCase() || '?'}</span>
                                )}
                            </div>
                        ) : (
                            // Edit mode - drag & drop zone
                            <div
                                className={`avatar-dropzone ${dragActive ? 'active' : ''} ${displayAvatar ? 'has-preview' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !displayAvatar && fileInputRef.current?.click()}
                            >
                                {displayAvatar ? (
                                    <div className="avatar-preview-container">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={displayAvatar} alt="Avatar preview" className="avatar-preview-img" />
                                        <div className="avatar-preview-actions">
                                            <button
                                                type="button"
                                                className="avatar-action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                                title={t('profile.avatar.label')}
                                            >
                                                <IconCamera size={16} />
                                            </button>
                                            <button
                                                type="button"
                                                className="avatar-action-btn remove"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setAvatarPreview(null);
                                                    setAvatarFile(null);
                                                }}
                                                title={t('profile.avatar.remove')}
                                            >
                                                <IconClose size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="avatar-dropzone-content">
                                        <IconUpload size={32} />
                                        <p className="avatar-dropzone-text">{t('profile.avatar.dropzone')}</p>
                                        <p className="avatar-dropzone-subtext">{t('profile.avatar.dropzoneOr')}</p>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        )}
                        <div className="profile-identity">
                            <h2>@{profile?.username || 'utilisateur'}</h2>
                            <p className="profile-email">{email}</p>
                            <div className="profile-plan-badge">
                                {profile?.plan === 'pro' ? (
                                    <IconCrown size={14} />
                                ) : (
                                    <IconZap size={14} />
                                )}
                                {t('plan.free') === getPlanLabel(profile?.plan || 'free') ? '' : 'Plan '}
                                {getPlanLabel(profile?.plan || 'free')}
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
                            {t('profile.editBtn')}
                        </button>
                    ) : (
                        <div className="profile-form stagger-children">
                            {/* Username */}
                            <div className="input-group">
                                <label>
                                    <IconUser size={14} /> {t('profile.username.label')}
                                </label>
                                <div className="input-wrapper">
                                    <input
                                        type="text"
                                        className="input-field"
                                        style={{ paddingLeft: '1rem' }}
                                        value={editUsername}
                                        onChange={(e) => setEditUsername(e.target.value)}
                                        placeholder={t('profile.username.placeholder')}
                                        minLength={3}
                                        maxLength={20}
                                        pattern="[a-zA-Z0-9_]+"
                                    />
                                </div>
                                <span className="profile-field-hint">
                                    {t('profile.username.hint')}
                                </span>
                            </div>

                            {/* Language */}
                            <div className="input-group">
                                <label>
                                    <IconGlobe size={14} /> {t('profile.language.label')}
                                </label>
                                <div className="lang-selector">
                                    <button
                                        className={`lang-btn ${editLang === 'fr' ? 'active' : ''}`}
                                        onClick={() => setEditLang('fr')}
                                        type="button"
                                    >
                                        🇫🇷 {t('profile.language.french')}
                                    </button>
                                    <button
                                        className={`lang-btn ${editLang === 'en' ? 'active' : ''}`}
                                        onClick={() => setEditLang('en')}
                                        type="button"
                                    >
                                        🇬🇧 {t('profile.language.english')}
                                    </button>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="profile-actions">
                                <button
                                    className="btn-auth"
                                    onClick={handleSave}
                                    disabled={saving || uploadingAvatar}
                                >
                                    {uploadingAvatar
                                        ? t('profile.avatar.uploading')
                                        : saving
                                            ? t('profile.saving')
                                            : t('profile.saveBtn')}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditUsername(profile?.username || '');
                                        setEditLang(profile?.preferred_lang || 'fr');
                                        setAvatarPreview(null);
                                        setAvatarFile(null);
                                    }}
                                    style={{ width: '100%' }}
                                >
                                    {t('common.cancel')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Stats Card */}
                <div className="profile-stats-card glass-card">
                    <h3 style={{ fontFamily: 'var(--font-heading)' }}>{t('profile.account.title')}</h3>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.plan')}</span>
                        <span className="profile-stat-value capitalize">
                            {getPlanLabel(profile?.plan || 'free')}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.credits')}</span>
                        <span className="profile-stat-value">
                            {profile?.credits === -1 ? (
                                <>
                                    <IconInfinity size={14} /> {t('profile.account.unlimited')}
                                </>
                            ) : (
                                `${profile?.credits ?? 0} ${t('nav.credits')}`
                            )}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.creditsMonth')}</span>
                        <span className="profile-stat-value">
                            {currentPlan.credits_per_month === -1 ? (
                                <>
                                    <IconInfinity size={14} /> {t('profile.account.unlimited')}
                                </>
                            ) : (
                                `${currentPlan.credits_per_month} ${t('nav.credits')}`
                            )}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.imageHd')}</span>
                        <span className="profile-stat-value">
                            {currentPlan.image_hd ? `✓ ${t('profile.account.enabled')}` : `✕ ${t('profile.account.disabled')}`}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.video')}</span>
                        <span className="profile-stat-value">
                            {currentPlan.video
                                ? `✓ ${currentPlan.video_max_seconds}s`
                                : `✕ ${t('profile.account.disabled')}`}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.watermark')}</span>
                        <span className="profile-stat-value">
                            {currentPlan.watermark ? `✓ ${t('profile.account.yes')}` : `✕ ${t('profile.account.no')}`}
                        </span>
                    </div>

                    <div className="profile-stat-row">
                        <span className="profile-stat-label">{t('profile.account.memberSince')}</span>
                        <span className="profile-stat-value">
                            {profile?.created_at
                                ? new Date(profile.created_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })
                                : '—'}
                        </span>
                    </div>

                    {profile?.plan === 'free' && (
                        <div className="profile-upgrade-cta">
                            <p>💡 {t('plan.upgrade')}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Danger Zone */}
            <div className="profile-danger-zone">
                <h3>{t('profile.danger.title')}</h3>
                <p>{t('profile.danger.description')}</p>
                <button
                    className="profile-delete-btn"
                    onClick={handleDeleteAccount}
                >
                    {t('profile.danger.deleteBtn')}
                </button>
            </div>
        </div>
    );
}
