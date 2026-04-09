'use client';

import { useState, useEffect, useRef } from 'react';
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
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CVTemplateProfessional, type CVData } from '@/components/cv-templates/CVTemplateProfessional';

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

/* ─── Reusable Form Field ─── */
function FormField({ label, required, hint, example, children }: {
    label: string;
    required?: boolean;
    hint?: string;
    example?: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="text-xs font-bold text-gray-500 mb-1 block">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {(hint || example) && (
                <div className="mt-1 space-y-0.5">
                    {hint && <p className="text-[11px] text-gray-400 leading-tight">💡 {hint}</p>}
                    {example && <p className="text-[11px] text-blue-400/70 leading-tight italic">Ex: {example}</p>}
                </div>
            )}
        </div>
    );
}

/* ─── Collapsible Section ─── */
function FormSection({ title, icon, children, defaultOpen = true, accentColor = 'var(--color-gold)' }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    accentColor?: string;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="glass-card-premium rounded-[20px] shadow-sm overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
            >
                <span className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                    <span style={{ color: accentColor }}>{icon}</span>
                    {title}
                </span>
                <IconChevronDown size={16} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
        </div>
    );
}

/* ─── Input styling ─── */
const inputClass = "w-full p-3 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-gold)] transition-all text-sm";
const textareaClass = `${inputClass} resize-none`;

export default function CareerStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [documentType, setDocumentType] = useState<DocumentType | 'both'>('cv');

    // ── Personal info ──
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [linkedin, setLinkedin] = useState('');
    const [website, setWebsite] = useState('');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // ── Professional info ──
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [sector, setSector] = useState<SectorType>('tech');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');

    // ── Content ──
    const [experiences, setExperiences] = useState('');
    const [education, setEducation] = useState('');
    const [skills, setSkills] = useState('');
    const [achievements, setAchievements] = useState('');
    const [languages, setLanguages] = useState('Français: Langue maternelle');
    const [certifications, setCertifications] = useState('');
    const [interests, setInterests] = useState('');
    const [references, setReferences] = useState('');
    const [motivation, setMotivation] = useState('');
    const [strengths, setStrengths] = useState('');

    // ── Generation state ──
    const [isStreaming, setIsStreaming] = useState(false);
    const [output, setOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [parsedCV, setParsedCV] = useState<CVData | null>(null);
    const [parsedLetter, setParsedLetter] = useState<string | null>(null);

    // ── Photo handler ──
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPhotoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    // ── Parse output when streaming ends ──
    useEffect(() => {
        if (!isStreaming && output) {
            try {
                if (documentType === 'cover-letter') {
                    setParsedLetter(output);
                    setParsedCV(null);
                } else if (documentType === 'cv') {
                    // Try to extract JSON from potential markdown code fence
                    let jsonStr = output.trim();
                    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (fenceMatch) jsonStr = fenceMatch[1].trim();
                    // Also try to find first { to last }
                    const firstBrace = jsonStr.indexOf('{');
                    const lastBrace = jsonStr.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && firstBrace < lastBrace) {
                        jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
                    }
                    const parsed = JSON.parse(jsonStr);
                    setParsedCV(parsed);
                    setParsedLetter(null);
                } else {
                    let jsonStr = output.trim();
                    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
                    if (fenceMatch) jsonStr = fenceMatch[1].trim();
                    const firstBrace = jsonStr.indexOf('{');
                    const lastBrace = jsonStr.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1) jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
                    const parsed = JSON.parse(jsonStr);
                    setParsedCV(parsed.cv || parsed);
                    setParsedLetter(parsed.coverLetter || null);
                }
            } catch {
                // JSON parse failed — show raw output  
            }
        }
    }, [output, isStreaming, documentType]);

    // ── PDF Download ──
    const handleDownloadPDF = async () => {
        const cvElement = document.getElementById('cv-export-wrapper');
        if (!cvElement) return;

        try {
            setIsGeneratingPDF(true);
            const canvas = await html2canvas(cvElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            // Handle multi-page if content overflows
            if (imgHeight <= pdfHeight) {
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            } else {
                let remainingHeight = imgHeight;
                let position = 0;
                while (remainingHeight > 0) {
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    remainingHeight -= pdfHeight;
                    if (remainingHeight > 0) {
                        pdf.addPage();
                        position -= pdfHeight;
                    }
                }
            }
            const safeName = name.replace(/\s+/g, '_') || 'CV';
            pdf.save(`CV_${safeName}_JadaRise.pdf`);
        } catch (err) {
            console.error('PDF Error:', err);
            setError('Erreur lors de la génération du PDF. Réessayez.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ── Fetch profile ──
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setProfile(data);
                    if (data.username) setName(data.username);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    // ── Auto-fill skills ──
    useEffect(() => {
        const sectorSkills = SECTOR_CONFIG[sector].skills;
        setSkills(sectorSkills.join(', '));
    }, [sector]);

    const calculateCredits = () => DOCUMENT_TYPES.find(t => t.id === documentType)?.credits || 3;

    const validateForm = (): string | null => {
        if (!name.trim()) return 'Le nom complet est requis';
        if (!email.trim() || !email.includes('@')) return 'Un email valide est requis';
        if (!jobTitle.trim()) return 'Le poste visé est requis';
        if (documentType !== 'cv' && !companyName.trim()) return 'Le nom de l\'entreprise est requis pour une lettre';
        return null;
    };

    const handleGenerate = async () => {
        const validationError = validateForm();
        if (validationError) { setError(validationError); return; }

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Il vous faut ${creditsNeeded} crédits.`);
            return;
        }

        setIsStreaming(true);
        setError(null);
        setOutput('');
        setParsedCV(null);
        setParsedLetter(null);
        setCopied(false);

        const formData: Record<string, string> = {
            name, email, phone, address, linkedin, website,
            jobTitle, companyName, companyAddress, sector, experienceLevel,
            experiences, education, skills, achievements,
            languages, certifications, interests, references,
            motivation, strengths,
        };

        try {
            const res = await fetch('/api/generate/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    documentType: documentType === 'both' ? 'cv' : documentType,
                    templateId: 'cv-professional',
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
                                if (parsed.meta && profile && parsed.meta.remaining_credits !== undefined) {
                                    setProfile({ ...profile, credits: parsed.meta.remaining_credits });
                                }
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setOutput(fullContent);
                                }
                            } catch { /* ignore */ }
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
        } catch { /* no-op */ }
    };

    const clearAll = () => {
        setOutput('');
        setParsedCV(null);
        setParsedLetter(null);
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
    const showCVTab = documentType === 'cv' || documentType === 'both';
    const showLetterTab = documentType === 'cover-letter' || documentType === 'both';

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[15%] right-[-10%] w-[35%] h-[40%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium gold shadow-lg">
                            <IconBriefcase size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Builder de Carrière
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                CV et lettres de motivation professionnels, design premium et export PDF
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

                {/* ── Document Type Selector ── */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {DOCUMENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => { setDocumentType(type.id); setOutput(''); setParsedCV(null); setParsedLetter(null); }}
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
                                documentType === type.id ? 'bg-[var(--color-gold)] text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                                {type.credits} crédits
                            </span>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* ════════════ LEFT PANEL — FORM ════════════ */}
                    <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-1 hide-scrollbar">

                        {/* ── 1. Identité & Photo ── */}
                        <FormSection title="Identité & Photo" icon={<IconUser size={18} />} accentColor="var(--color-gold)">
                            {/* Photo upload */}
                            <div className="flex items-center gap-4 mb-2">
                                <div
                                    onClick={() => photoInputRef.current?.click()}
                                    className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[var(--color-gold)] transition-colors overflow-hidden bg-gray-50 shrink-0"
                                >
                                    {photoPreview ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center">
                                            <IconUser size={24} className="text-gray-300 mx-auto" />
                                            <span className="text-[9px] text-gray-400 block mt-1">Photo</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-xs text-gray-500">📸 Ajoutez votre photo (optionnel mais recommandé)</p>
                                    <p className="text-[10px] text-gray-400">Format carré, bonne luminosité, tenue professionnelle</p>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3">
                                <FormField label="Nom complet" required hint="Prénom suivi du nom de famille" example="Jean-Baptiste AGOSSOU">
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom NOM" disabled={isStreaming} className={inputClass} />
                                </FormField>
                                <FormField label="Email" required example="jb.agossou@gmail.com">
                                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" disabled={isStreaming} className={inputClass} />
                                </FormField>
                                <FormField label="Téléphone" hint="Format international recommandé" example="+229 97 12 34 56">
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+229 00 00 00 00" disabled={isStreaming} className={inputClass} />
                                </FormField>
                                <FormField label="Adresse / Ville" example="Cotonou, Bénin">
                                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ville, Pays" disabled={isStreaming} className={inputClass} />
                                </FormField>
                                <FormField label="LinkedIn" hint="URL de votre profil LinkedIn" example="linkedin.com/in/jbagossou">
                                    <input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/votre-profil" disabled={isStreaming} className={inputClass} />
                                </FormField>
                                <FormField label="Site web / Portfolio" example="www.monportfolio.com">
                                    <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." disabled={isStreaming} className={inputClass} />
                                </FormField>
                            </div>
                        </FormSection>

                        {/* ── 2. Informations Professionnelles ── */}
                        <FormSection title="Poste & Secteur" icon={<IconBuilding size={18} />} accentColor="var(--color-earth)">
                            <div className="grid sm:grid-cols-2 gap-3">
                                <FormField label="Poste visé" required hint="Le titre exact du poste que vous recherchez" example="Développeur Full Stack Senior">
                                    <input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Titre du poste" disabled={isStreaming} className={inputClass} />
                                </FormField>
                                <FormField label={documentType !== 'cv' ? 'Entreprise *' : 'Entreprise'} hint="Utile pour cibler un employeur spécifique">
                                    <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nom de l&apos;entreprise" disabled={isStreaming} className={inputClass} />
                                </FormField>
                            </div>
                            {documentType !== 'cv' && (
                                <FormField label="Adresse de l&apos;entreprise" example="Avenue Jean-Paul II, Cotonou, Bénin">
                                    <input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="Adresse complète" disabled={isStreaming} className={inputClass} />
                                </FormField>
                            )}
                            <div className="grid sm:grid-cols-2 gap-3">
                                <FormField label="Secteur d&apos;activité">
                                    <div className="relative">
                                        <select value={sector} onChange={e => setSector(e.target.value as SectorType)} disabled={isStreaming} className={`${inputClass} appearance-none pr-8`}>
                                            {Object.entries(SECTOR_CONFIG).map(([key, config]) => (
                                                <option key={key} value={key}>{config.name}</option>
                                            ))}
                                        </select>
                                        <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </FormField>
                                <FormField label="Niveau d&apos;expérience">
                                    <div className="relative">
                                        <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)} disabled={isStreaming} className={`${inputClass} appearance-none pr-8`}>
                                            {EXPERIENCE_LEVELS.map(level => (
                                                <option key={level.id} value={level.id}>{level.label} ({level.years})</option>
                                            ))}
                                        </select>
                                        <IconChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </FormField>
                            </div>
                        </FormSection>

                        {/* ── 3. Expériences & Formation ── */}
                        <FormSection title="Expériences & Formation" icon={<IconFileText size={18} />} accentColor="var(--color-savanna)">
                            <FormField
                                label="Expériences professionnelles"
                                hint="Listez vos postes du plus récent au plus ancien. L&apos;IA enrichira les descriptions."
                                example="Développeur Web Senior chez TechAfrique, Cotonou (2022-2024) — Conception d&apos;une plateforme e-commerce, +40% de conversion"
                            >
                                <textarea value={experiences} onChange={e => setExperiences(e.target.value)}
                                    placeholder={"Poste 1 — Entreprise (dates)\n• Réalisation clé\n\nPoste 2 — Entreprise (dates)\n• Réalisation clé"}
                                    rows={5} disabled={isStreaming} className={textareaClass}
                                />
                            </FormField>

                            <FormField
                                label="Formation & Diplômes"
                                hint="Du plus récent au plus ancien. Mentionnez la mention si pertinente."
                                example="Master Informatique — Université d&apos;Abomey-Calavi (2022), Mention Bien"
                            >
                                <textarea value={education} onChange={e => setEducation(e.target.value)}
                                    placeholder={"Diplôme — Établissement (année)\nDiplôme — Établissement (année)"}
                                    rows={3} disabled={isStreaming} className={textareaClass}
                                />
                            </FormField>

                            <FormField label="Réalisations marquantes" hint="Chiffrez-les pour plus d&apos;impact" example="Augmentation du CA de 25%, gestion d&apos;une équipe de 12 personnes">
                                <textarea value={achievements} onChange={e => setAchievements(e.target.value)}
                                    placeholder="Vos réalisations les plus impressionnantes, quantifiées si possible..."
                                    rows={2} disabled={isStreaming} className={textareaClass}
                                />
                            </FormField>
                        </FormSection>

                        {/* ── 4. Compétences, Langues, Certifications ── */}
                        <FormSection title="Compétences & Langues" icon={<IconSparkles size={18} />} accentColor="var(--color-terracotta)" defaultOpen={true}>
                            <FormField label="Compétences clés" hint="Séparées par des virgules. L&apos;IA les mettra en valeur.">
                                <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Gestion de projet, ..." disabled={isStreaming} className={inputClass} />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    💡 Suggérés pour {SECTOR_CONFIG[sector].name}: {SECTOR_CONFIG[sector].skills.slice(0, 4).join(', ')}...
                                </p>
                            </FormField>

                            <FormField
                                label="Langues"
                                hint="Indiquez chaque langue et son niveau. Format: Langue: Niveau"
                                example="Français: Langue maternelle, Anglais: Courant (B2), Fon: Natif"
                            >
                                <input type="text" value={languages} onChange={e => setLanguages(e.target.value)} placeholder="Français: Maternelle, Anglais: Intermédiaire, Fon: Natif" disabled={isStreaming} className={inputClass} />
                            </FormField>

                            <FormField
                                label="Certifications & Formations complémentaires"
                                hint="Diplômes en ligne, certifications professionnelles, etc."
                                example="Google Analytics Certified (2023), AWS Cloud Practitioner (2022)"
                            >
                                <textarea value={certifications} onChange={e => setCertifications(e.target.value)}
                                    placeholder="Nom de certification — Organisme (année)"
                                    rows={2} disabled={isStreaming} className={textareaClass}
                                />
                            </FormField>
                        </FormSection>

                        {/* ── 5. Extras (optionnel) ── */}
                        <FormSection title="Extras (optionnel)" icon={<IconAward size={18} />} accentColor="var(--color-gold)" defaultOpen={false}>
                            <FormField label="Centres d&apos;intérêt" hint="Loisirs pertinents qui montrent votre personnalité" example="Football, Lecture, Bénévolat, Voyages, Coding">
                                <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Lecture, Sport, Bénévolat..." disabled={isStreaming} className={inputClass} />
                            </FormField>

                            <FormField
                                label="Références"
                                hint="Personnes pouvant témoigner de votre travail. Contact optionnel."
                                example="Dr. Koffi AMOUSSOU — Directeur, TechAfrique — k.amoussou@techafrique.bj"
                            >
                                <textarea value={references} onChange={e => setReferences(e.target.value)}
                                    placeholder={"Nom — Poste, Entreprise — Contact (optionnel)\nNom — Poste, Entreprise — Contact (optionnel)"}
                                    rows={2} disabled={isStreaming} className={textareaClass}
                                />
                            </FormField>
                        </FormSection>

                        {/* ── 6. Lettre de motivation (conditionnel) ── */}
                        {documentType !== 'cv' && (
                            <FormSection title="Lettre de motivation" icon={<IconMail size={18} />} accentColor="var(--color-earth)">
                                <FormField label="Motivation pour le poste" hint="Qu&apos;est-ce qui vous attire spécifiquement dans ce poste/cette entreprise ?" example="La mission de contribuer au développement numérique en Afrique de l&apos;Ouest...">
                                    <textarea value={motivation} onChange={e => setMotivation(e.target.value)}
                                        placeholder="Pourquoi ce poste m'intéresse particulièrement..." rows={3} disabled={isStreaming} className={textareaClass}
                                    />
                                </FormField>
                                <FormField label="Points forts à mettre en avant" example="Leadership, Adaptabilité, 5 ans dans le secteur">
                                    <input type="text" value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Adaptabilité, créativité, expertise..." disabled={isStreaming} className={inputClass} />
                                </FormField>
                            </FormSection>
                        )}

                        {/* ── Tips ── */}
                        <div className="p-4 bg-[var(--color-gold)]/10 rounded-xl">
                            <p className="text-xs font-bold text-[var(--color-gold-dark)] mb-2 uppercase tracking-wider">
                                🎯 Conseils pour un CV parfait
                            </p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Utilisez des verbes d&apos;action: {CV_ACTION_VERBS.slice(0, 5).join(', ')}...</li>
                                <li>• Quantifiez vos réalisations (chiffres, pourcentages)</li>
                                <li>• Plus vous donnez de détails, meilleur sera le résultat</li>
                                <li>• Adaptez au contexte africain (langues locales = atout !)</li>
                            </ul>
                        </div>

                        {/* ── Generate Button ── */}
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
                                <><IconLoader2 size={20} className="animate-spin" /><span>Génération en cours...</span></>
                            ) : (
                                <><IconFileText size={20} /><span>Générer {documentType === 'both' ? 'CV + Lettre' : DOCUMENT_TYPES.find(t => t.id === documentType)?.name} ({creditsNeeded} crédits)</span></>
                            )}
                        </button>

                        {error && (
                            <div className="flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl">
                                <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}
                    </div>

                    {/* ════════════ RIGHT PANEL — PREVIEW ════════════ */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Header bar */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconFile size={18} className="text-gray-400" />
                                <span className="text-gray-700 font-medium text-sm">
                                    {output ? 'Aperçu du document' : 'Aperçu'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {documentType === 'both' && (parsedCV || parsedLetter) && (
                                    <div className="flex bg-gray-200 rounded-lg p-1">
                                        <button onClick={() => setActiveTab('cv')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'cv' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>CV Design</button>
                                        <button onClick={() => setActiveTab('letter')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${activeTab === 'letter' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}>Lettre</button>
                                    </div>
                                )}
                                {parsedCV && (activeTab === 'cv' || documentType === 'cv') && (
                                    <button
                                        onClick={handleDownloadPDF}
                                        disabled={isGeneratingPDF}
                                        className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-savanna)] to-[var(--color-earth)] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {isGeneratingPDF ? <IconLoader2 size={16} className="animate-spin" /> : <IconFileText size={16} />}
                                        Télécharger PDF
                                    </button>
                                )}
                                {output && (activeTab === 'letter' || documentType === 'cover-letter') && (
                                    <button onClick={handleCopy} className={`p-2 rounded-lg transition-colors ${copied ? 'text-green-600 bg-green-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`} title="Copier">
                                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                                    </button>
                                )}
                                <button onClick={clearAll} disabled={!output} className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors" title="Effacer">
                                    <IconRefresh size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Content area */}
                        <div className="flex-1 overflow-auto bg-gray-100 flex justify-center items-start hide-scrollbar">
                            {isStreaming ? (
                                <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-gray-400 bg-white">
                                    <IconLoader2 size={32} className="animate-spin text-[var(--color-gold)]" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium">L&apos;IA construit votre document professionnel...</p>
                                        <p className="text-xs text-gray-400 mt-1">Création du design premium A4 en cours</p>
                                    </div>
                                </div>
                            ) : output ? (
                                <div className="w-full">
                                    {(activeTab === 'cv' && showCVTab) ? (
                                        parsedCV ? (
                                            <div className="w-full flex justify-center py-8 px-4">
                                                <div style={{ width: '794px', transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                                                    <CVTemplateProfessional data={parsedCV} photoPreview={photoPreview} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-8 text-center">
                                                <p className="text-amber-600 font-medium mb-4">⚠️ Le format JSON n&apos;a pas été correctement généré. Voici le contenu brut :</p>
                                                <div className="bg-white rounded-xl p-6 text-left">
                                                    <ChatMessageContent content={output} />
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="p-8 bg-white h-full w-full">
                                            <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                                <ChatMessageContent content={parsedLetter || output} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-gray-400 bg-white">
                                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                                        <IconBriefcase size={32} className="text-gray-300" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-500">Votre document apparaîtra ici</p>
                                    <p className="text-xs text-gray-400 max-w-xs text-center">
                                        Remplissez le formulaire à gauche et cliquez sur Générer pour obtenir un CV professionnel avec design premium
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
