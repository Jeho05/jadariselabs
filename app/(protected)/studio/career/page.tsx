'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconBriefcase,
    IconZap,
    IconLoader2,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
    IconFileText,
    IconFile,
    IconCheck,
    IconChevronDown,
    IconSparkles,
    IconBuilding,
    IconMail,
    IconPhone,
    IconMapPin,
    IconUser,
    IconGraduationCap,
    IconAward,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import {
    SECTOR_CONFIG,
    CAREER_TEMPLATES,
    CV_ACTION_VERBS,
    COVER_OPENINGS,
    COVER_CLOSINGS,
    type DocumentType,
    type SectorType,
} from '@/lib/prompts/career-templates';

type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'executive';
type CareerDocumentType = DocumentType | 'both';

const DOCUMENT_TYPES: Array<{ id: CareerDocumentType; name: string; credits: number; description: string }> = [
    { id: 'cv', name: 'CV seul', credits: 3, description: 'Curriculum Vitae professionnel' },
    { id: 'cover-letter', name: 'Lettre seule', credits: 2, description: 'Lettre de motivation' },
    { id: 'both', name: 'CV + Lettre', credits: 4, description: 'Pack complet' },
];

const EXPERIENCE_LEVELS: Array<{ id: ExperienceLevel; label: string; years: string }> = [
    { id: 'junior', label: 'Junior', years: '0-2 ans' },
    { id: 'mid', label: 'Confirmé', years: '3-5 ans' },
    { id: 'senior', label: 'Senior', years: '6-10 ans' },
    { id: 'executive', label: 'Expert/Manager', years: '10+ ans' },
];

export default function CareerStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Document type
    const [documentType, setDocumentType] = useState<DocumentType | 'both'>('cv');
    
    // Personal info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [linkedin, setLinkedin] = useState('');
    
    // Professional info
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [sector, setSector] = useState<SectorType>('tech');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
    
    // Content
    const [experiences, setExperiences] = useState('');
    const [education, setEducation] = useState('');
    const [skills, setSkills] = useState('');
    const [achievements, setAchievements] = useState('');
    const [motivation, setMotivation] = useState('');
    const [strengths, setStrengths] = useState('');
    
    // Generation state
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) {
                    setProfile(data);
                    // Pre-fill with profile data if available
                    if (data.username) setName(data.username);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    // Auto-fill skills based on sector
    useEffect(() => {
        const sectorSkills = SECTOR_CONFIG[sector].skills;
        setSkills(sectorSkills.join(', '));
    }, [sector]);

    const calculateCredits = () => {
        const option = DOCUMENT_TYPES.find(t => t.id === documentType);
        return option?.credits || 3;
    };

    const validateForm = (): string | null => {
        if (!name.trim()) return 'Le nom est requis';
        if (!email.trim() || !email.includes('@')) return 'Un email valide est requis';
        if (!jobTitle.trim()) return 'Le poste visé est requis';
        if (documentType !== 'cv' && !companyName.trim()) return 'Le nom de l&apos;entreprise est requis pour une lettre';
        return null;
    };

    const handleGenerate = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Il vous faut ${creditsNeeded} crédits.`);
            return;
        }

        setIsStreaming(true);
        setError(null);
        setOutput('');
        setCopied(false);

        const formData = {
            name,
            email,
            phone,
            address,
            linkedin,
            jobTitle,
            companyName,
            companyAddress,
            sector,
            experienceLevel,
            experiences,
            education,
            skills,
            achievements,
            motivation,
            strengths,
        };

        try {
            const res = await fetch('/api/generate/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentType: documentType === 'both' ? 'cv' : documentType,
                    templateId: 'default',
                    formData,
                    generateBoth: documentType === 'both',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.details || data.error || 'Une erreur est survenue');
                setIsStreaming(false);
                return;
            }

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6).trim();
                            if (data === '[DONE]') continue;

                            try {
                                const parsed = JSON.parse(data);
                                if (parsed.meta) {
                                    if (profile && parsed.meta.remaining_credits !== undefined) {
                                        setProfile({ ...profile, credits: parsed.meta.remaining_credits });
                                    }
                                }
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setOutput(fullContent);
                                }
                            } catch {
                                // ignore malformed chunk
                            }
                        }
                    }
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setIsStreaming(false);
        }
    };

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // no-op
        }
    };

    const clearAll = () => {
        setOutput('');
        setCopied(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="skeleton h-16 w-16 rounded-full mb-4" />
                    <div className="skeleton h-6 w-48 mb-2 rounded-lg" />
                    <div className="skeleton h-4 w-64 rounded-lg" />
                </div>
            </div>
        );
    }

    const creditsNeeded = calculateCredits();
    const hasBothOutputs = documentType === 'both' && output.includes('---');

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[15%] right-[-10%] w-[35%] h-[40%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium gold shadow-lg">
                            <IconBriefcase size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Carrière
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                CV et lettres de motivation professionnels
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-gold)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                {/* Document Type Selector */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {DOCUMENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => { setDocumentType(type.id); setOutput(''); }}
                            disabled={isStreaming}
                            className={`p-4 rounded-xl border-2 text-center transition-all ${
                                documentType === type.id
                                    ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                                    : 'border-gray-200 bg-white/50 hover:border-gray-300'
                            }`}
                        >
                            <p className="font-bold text-gray-800">{type.name}</p>
                            <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                documentType === type.id
                                    ? 'bg-[var(--color-gold)] text-white'
                                    : 'bg-gray-100 text-gray-600'
                            }`}>
                                {type.credits} crédits
                            </span>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Panel - Form */}
                    <div className="space-y-5">
                        {/* Personal Info */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconUser size={18} className="text-[var(--color-gold)]" />
                                Informations personnelles
                            </h3>
                            
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Nom complet *</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Prénom NOM"
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-gold)] transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Email *</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="email@exemple.com"
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-gold)] transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+229 00 00 00 00"
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-gold)] transition-all text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Adresse</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Cotonou, Bénin"
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-gold)] transition-all text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Info */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconBuilding size={18} className="text-[var(--color-earth)]" />
                                Informations professionnelles
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Poste visé *</label>
                                        <input
                                            type="text"
                                            value={jobTitle}
                                            onChange={(e) => setJobTitle(e.target.value)}
                                            placeholder="Développeur Full Stack"
                                            disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">
                                            Entreprise {documentType !== 'cv' && '*'}
                                        </label>
                                        <input
                                            type="text"
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder="Nom de l'entreprise"
                                            disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] transition-all text-sm"
                                        />
                                    </div>
                                </div>

                                {documentType !== 'cv' && (
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Adresse de l&apos;entreprise</label>
                                        <input
                                            type="text"
                                            value={companyAddress}
                                            onChange={(e) => setCompanyAddress(e.target.value)}
                                            placeholder="Quartier, Ville, Pays"
                                            disabled={isStreaming}
                                            className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-earth)] transition-all text-sm"
                                        />
                                    </div>
                                )}

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Secteur d&apos;activité</label>
                                        <div className="relative">
                                            <select
                                                value={sector}
                                                onChange={(e) => setSector(e.target.value as SectorType)}
                                                disabled={isStreaming}
                                                className="w-full p-3 pr-8 rounded-xl border-2 border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[var(--color-earth)]"
                                            >
                                                {Object.entries(SECTOR_CONFIG).map(([key, config]) => (
                                                    <option key={key} value={key}>{config.name}</option>
                                                ))}
                                            </select>
                                            <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 mb-1 block">Niveau d&apos;expérience</label>
                                        <div className="relative">
                                            <select
                                                value={experienceLevel}
                                                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                                                disabled={isStreaming}
                                                className="w-full p-3 pr-8 rounded-xl border-2 border-gray-200 bg-white text-sm appearance-none focus:outline-none focus:border-[var(--color-earth)]"
                                            >
                                                {EXPERIENCE_LEVELS.map((level) => (
                                                    <option key={level.id} value={level.id}>
                                                        {level.label} ({level.years})
                                                    </option>
                                                ))}
                                            </select>
                                            <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <IconFileText size={18} className="text-[var(--color-savanna)]" />
                                Contenu du document
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">
                                        Expériences professionnelles
                                        <span className="text-[10px] font-normal ml-1 text-gray-400">(postes, entreprises, dates)</span>
                                    </label>
                                    <textarea
                                        value={experiences}
                                        onChange={(e) => setExperiences(e.target.value)}
                                        placeholder="Développeur Web chez TechAfrique (2022-2024)\nStagiaire Marketing chez XYZ (2021)"
                                        rows={3}
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-all text-sm resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Formation</label>
                                    <textarea
                                        value={education}
                                        onChange={(e) => setEducation(e.target.value)}
                                        placeholder="Licence Informatique - Université d'Abomey-Calavi (2022)"
                                        rows={2}
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-all text-sm resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-gray-500 mb-1 block">Compétences clés</label>
                                    <input
                                        type="text"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        placeholder="JavaScript, React, Gestion de projet, ..."
                                        disabled={isStreaming}
                                        className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-all text-sm"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        Suggérés pour {SECTOR_CONFIG[sector].name}: {SECTOR_CONFIG[sector].skills.slice(0, 4).join(', ')}...
                                    </p>
                                </div>

                                {documentType !== 'cv' && (
                                    <>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Motivation pour le poste</label>
                                            <textarea
                                                value={motivation}
                                                onChange={(e) => setMotivation(e.target.value)}
                                                placeholder="Pourquoi ce poste m'intéresse particulièrement..."
                                                rows={2}
                                                disabled={isStreaming}
                                                className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-all text-sm resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 mb-1 block">Points forts à mettre en avant</label>
                                            <input
                                                type="text"
                                                value={strengths}
                                                onChange={(e) => setStrengths(e.target.value)}
                                                placeholder="Adaptabilité, créativité, expertise technique..."
                                                disabled={isStreaming}
                                                className="w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-all text-sm"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="p-4 bg-[var(--color-gold)]/10 rounded-xl">
                            <p className="text-xs font-bold text-[var(--color-gold-dark)] mb-2 uppercase tracking-wider">
                                Conseils de rédaction
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Utilisez des verbes d&apos;action: {CV_ACTION_VERBS.slice(0, 5).join(', ')}...</li>
                                <li>• Quantifiez vos réalisations quand possible</li>
                                <li>• Adaptez au contexte africain (langues, diplômes reconnus)</li>
                            </ul>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={isStreaming}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-gold) 0%, var(--color-gold-dark) 100%)',
                                boxShadow: '0 8px 16px -4px rgba(201, 168, 76, 0.4)',
                            }}
                        >
                            {isStreaming ? (
                                <>
                                    <IconLoader2 size={20} className="animate-spin" />
                                    <span>Génération en cours...</span>
                                </>
                            ) : (
                                <>
                                    <IconFileText size={20} />
                                    <span>Générer {documentType === 'both' ? 'CV + Lettre' : DOCUMENT_TYPES.find(t => t.id === documentType)?.name} ({creditsNeeded} crédits)</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl">
                                <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Output */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconFile size={18} className="text-gray-400" />
                                <span className="text-gray-700 font-medium text-sm">
                                    {output ? 'Document généré' : 'Aperçu'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {hasBothOutputs && (
                                    <div className="flex bg-gray-200 rounded-lg p-1">
                                        <button
                                            onClick={() => setActiveTab('cv')}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                                activeTab === 'cv' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                                            }`}
                                        >
                                            CV
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('letter')}
                                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                                                activeTab === 'letter' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                                            }`}
                                        >
                                            Lettre
                                        </button>
                                    </div>
                                )}
                                {output && (
                                    <button
                                        onClick={handleCopy}
                                        className={`p-2 rounded-lg transition-colors ${
                                            copied 
                                                ? 'text-green-600 bg-green-100' 
                                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                        }`}
                                        title="Copier"
                                    >
                                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    </button>
                                )}
                                <button
                                    onClick={clearAll}
                                    disabled={!output}
                                    className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                    title="Effacer"
                                >
                                    <IconRefresh size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !output ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <IconLoader2 size={32} className="animate-spin text-[var(--color-gold)]" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">Rédaction professionnelle en cours...</p>
                                        <p className="text-xs text-gray-400 mt-1">Adaptation au contexte africain</p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed whitespace-pre-wrap font-mono">
                                    {hasBothOutputs ? (
                                        <>
                                            {activeTab === 'cv' ? (
                                                <ChatMessageContent content={output.split('---')[0] || output} />
                                            ) : (
                                                <ChatMessageContent content={output.split('---')[1] || ''} />
                                            )}
                                        </>
                                    ) : (
                                        <ChatMessageContent content={output} />
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="w-16 h-16 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center">
                                        <IconBriefcase size={28} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Votre document apparaîtra ici</p>
                                    <p className="text-xs text-gray-400 max-w-xs text-center">
                                        Remplissez le formulaire et cliquez sur Générer
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
