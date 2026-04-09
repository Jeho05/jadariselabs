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
    IconFileText,
    IconFile,
    IconCheck,
    IconChevronDown,
    IconSparkles,
    IconBuilding,
    IconMail,
    IconUser,
    IconAward,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import {
    SECTOR_CONFIG,
    type DocumentType,
    type SectorType,
} from '@/lib/prompts/career-templates';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CVTemplateProfessional, type CVData } from '@/components/cv-templates/CVTemplateProfessional';

/* ─── Inline Mini Icons for Dynamic Forms ─── */
const MiniPlus = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 5v14m-7-7h14"/></svg>
);
const MiniTrash = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'executive';
type CareerDocumentType = DocumentType | 'both';

const DOCUMENT_TYPES: Array<{ id: CareerDocumentType; name: string; credits: number; description: string; tag?: string }> = [
    { id: 'cv', name: 'CV Live', credits: 0, description: 'Création instantanée', tag: 'GRATUIT' },
    { id: 'cover-letter', name: 'Lettre seule', credits: 2, description: 'Lettre par IA' },
    { id: 'both', name: 'CV Live + Lettre', credits: 2, description: 'Pack complet' },
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
        <div className="glass-card-premium rounded-[20px] shadow-sm overflow-hidden mb-4">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                style={{ borderLeft: `4px solid ${accentColor}` }}
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
const inputClass = "w-full p-2.5 rounded-lg border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-gold)] transition-all text-sm";
const textareaClass = `${inputClass} resize-none`;

export default function CareerStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [documentType, setDocumentType] = useState<CareerDocumentType>('cv');

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
    const [sector, setSector] = useState<SectorType>('tech');
    const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('mid');
    const [summary, setSummary] = useState('');

    // ── Dynamic Lists ──
    const [experiences, setExperiences] = useState([{ id: 'exp_1', role: '', company: '', location: '', period: '', achievements: '' }]);
    const [education, setEducation] = useState([{ id: 'edu_1', degree: '', institution: '', period: '', details: '' }]);
    const [languages, setLanguages] = useState([{ id: 'lang_1', name: '', level: '' }]);
    const [certifications, setCertifications] = useState([{ id: 'cert_1', name: '', issuer: '', year: '' }]);
    const [references, setReferences] = useState([{ id: 'ref_1', name: '', role: '', contact: '' }]);

    // ── Simple text fields ──
    const [skills, setSkills] = useState('');
    const [interests, setInterests] = useState('');

    // ── Cover Letter Exclusive fields ──
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [motivation, setMotivation] = useState('');
    const [strengths, setStrengths] = useState('');

    // ── Generation state ──
    const [isStreaming, setIsStreaming] = useState(false);
    const [letterOutput, setLetterOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // ── Handlers for Dynamic Lists ──
    const genId = () => Math.random().toString(36).substr(2, 9);
    
    // Arrays helper
    const updateListItem = <T extends { id: string }>(list: T[], setList: (v: T[]) => void, id: string, key: keyof T, value: string) => {
        setList(list.map(item => item.id === id ? { ...item, [key]: value } : item));
    };
    const removeListItem = <T extends { id: string }>(list: T[], setList: (v: T[]) => void, id: string) => {
        setList(list.filter(item => item.id !== id));
    };

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

    // ── Live CV Data Mapping ──
    const liveCVData: CVData = {
        personalInfo: {
            fullName: name,
            jobTitle,
            email,
            phone,
            location: address,
            linkedin,
            website,
            photoUrl: photoPreview || undefined
        },
        summary,
        experience: experiences.filter(e => e.role || e.company).map(e => ({
            role: e.role,
            company: e.company,
            period: e.period,
            location: e.location,
            achievements: e.achievements.split('\n').map(s => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
        })),
        education: education.filter(e => e.degree || e.institution).map(e => ({
            degree: e.degree,
            institution: e.institution,
            period: e.period,
            details: e.details
        })),
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        languages: languages.filter(l => l.name).map(l => ({ name: l.name, level: l.level })),
        certifications: certifications.filter(c => c.name).map(c => ({ name: c.name, issuer: c.issuer, year: c.year })),
        interests: interests.split(',').map(s => s.trim()).filter(Boolean),
        references: references.filter(r => r.name).map(r => ({ name: r.name, role: r.role, contact: r.contact }))
    };

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
                width: 794,
                windowWidth: 794,
            });

            const pdf = new jsPDF({ format: 'a4', unit: 'mm', orientation: 'portrait' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgHeightMM = (canvas.height * pdfWidth) / canvas.width;

            if (imgHeightMM <= pdfHeight) {
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, imgHeightMM);
            } else {
                const pageCanvasHeight = Math.floor((pdfHeight / imgHeightMM) * canvas.height);
                let yOffset = 0; let pageNum = 0;
                while (yOffset < canvas.height) {
                    const sliceHeight = Math.min(pageCanvasHeight, canvas.height - yOffset);
                    const pageCanvas = document.createElement('canvas');
                    pageCanvas.width = canvas.width;
                    pageCanvas.height = sliceHeight;
                    const ctx = pageCanvas.getContext('2d');
                    if (ctx) ctx.drawImage(canvas, 0, yOffset, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
                    const sliceHeightMM = (sliceHeight * pdfWidth) / canvas.width;
                    if (pageNum > 0) pdf.addPage();
                    pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, sliceHeightMM);
                    yOffset += sliceHeight; pageNum++;
                }
            }
            pdf.save(`CV_${name.replace(/\s+/g, '_') || 'JadaRise'}.pdf`);
        } catch (err) {
            console.error('PDF Error:', err);
            setError('Erreur lors de la génération du PDF.');
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

    useEffect(() => {
        setSkills(SECTOR_CONFIG[sector].skills.join(', '));
    }, [sector]);

    const calculateCredits = () => DOCUMENT_TYPES.find(t => t.id === documentType)?.credits || 0;

    // ── Generate AI Cover Letter ──
    const handleGenerateLetter = async () => {
        if (!name.trim() || !jobTitle.trim() || !companyName.trim()) {
            setError('Pour la lettre, indiquez au minimum : Nom, Poste visé, et Nom de l\'entreprise.');
            return;
        }

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Il faut ${creditsNeeded} crédits.`);
            return;
        }

        setIsStreaming(true); setError(null); setLetterOutput(''); setActiveTab('letter');

        // Construire form data pour l'IA
        const formData = {
            name, email, phone, address, jobTitle, companyName, companyAddress, sector, experienceLevel,
            motivation, strengths,
            experiences: experiences.map(e => `${e.role} chez ${e.company} (${e.period})`).join(', '),
            education: education.map(e => `${e.degree} - ${e.institution}`).join(', '),
            skills
        };

        try {
            const res = await fetch('/api/generate/career', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documentType: 'cover-letter', templateId: 'cover-classic', formData, generateBoth: false }),
            });
            if (!res.ok) {
                const data = await res.json();
                setError(data.error); setIsStreaming(false); return;
            }
            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let full = '';
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
                                    full += parsed.content;
                                    setLetterOutput(full);
                                }
                            } catch { /* ignore */ }
                        }
                    }
                }
            }
        } catch {
            setError('Erreur réseau.');
        } finally {
            setIsStreaming(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--color-cream)] flex items-center justify-center">
            <IconLoader2 size={32} className="animate-spin text-[var(--color-gold)]" />
        </div>
    );

    const showLetterTab = documentType === 'cover-letter' || documentType === 'both';
    const showCVTab = documentType === 'cv' || documentType === 'both';

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium gold shadow-lg"><IconBriefcase size={28} /></div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Builder CV & Lettres</h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">Créez votre CV professionnel en direct et générez une lettre par IA.</p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md shadow-sm">
                            <IconZap size={18} className="text-[var(--color-gold)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                {/* ── Type Selector ── */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {DOCUMENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => { setDocumentType(type.id); if (type.id === 'cv') setActiveTab('cv'); else if (type.id === 'cover-letter') setActiveTab('letter'); }}
                            className={`p-4 rounded-xl border-2 text-center transition-all relative ${
                                documentType === type.id ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-gray-200 bg-white/50 hover:border-gray-300'
                            }`}
                        >
                            {type.tag && <div className="absolute -top-3 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{type.tag}</div>}
                            <p className="font-bold text-gray-800">{type.name}</p>
                            <p className="text-xs text-gray-500 mb-2">{type.description}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${documentType === type.id ? 'bg-[var(--color-gold)] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                {type.credits} crédits
                            </span>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* ════════════ LEFT PANEL — FORM ════════════ */}
                    <div className="space-y-4 overflow-y-auto h-[75vh] pr-2 custom-scrollbar">

                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl mb-4 text-xs text-blue-800 flex gap-2">
                            <span>💡</span>
                            <p><strong>Aperçu en direct !</strong> Remplissez le formulaire, votre CV se construit instantanément sur la droite. Aucun crédit nécessaire pour le CV.</p>
                        </div>

                        {/* ── Identité & Photo ── */}
                        <FormSection title="Identité & Contact" icon={<IconUser size={18} />} accentColor="#C9A84C">
                            <div className="flex items-center gap-4 mb-2">
                                <div onClick={() => photoInputRef.current?.click()} className="w-16 h-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#C9A84C] relative overflow-hidden bg-gray-50 shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {photoPreview ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" /> : <IconUser size={20} className="text-gray-300" />}
                                </div>
                                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                <div className="text-xs text-gray-500">Ajouter une photo de profil pro</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <FormField label="Nom complet *"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom NOM" className={inputClass} /></FormField>
                                <FormField label="Poste visé *"><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="ex: Développeur Web" className={inputClass} /></FormField>
                                <FormField label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domaine.com" className={inputClass} /></FormField>
                                <FormField label="Téléphone"><input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+229 00 00 00 00" className={inputClass} /></FormField>
                                <FormField label="Ville, Pays"><input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Cotonou, Bénin" className={inputClass} /></FormField>
                                <FormField label="Profil (Résumé)"><textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Une phrase d'accroche pour votre CV" rows={1} className={textareaClass} /></FormField>
                                <FormField label="LinkedIn"><input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..." className={inputClass} /></FormField>
                                <FormField label="Site Web"><input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="www.portfolio.com" className={inputClass} /></FormField>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <FormField label="Secteur">
                                    <select value={sector} onChange={e => setSector(e.target.value as SectorType)} className={inputClass}>
                                        {Object.entries(SECTOR_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Exigence & Niveau">
                                    <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)} className={inputClass}>
                                        {EXPERIENCE_LEVELS.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.label}</option>)}
                                    </select>
                                </FormField>
                            </div>
                        </FormSection>

                        {/* ── Expériences ── */}
                        <FormSection title="Expériences" icon={<IconBriefcase size={18} />} accentColor="#A88B3A">
                            {experiences.map((exp, i) => (
                                <div key={exp.id} className="relative p-3 bg-gray-50 border border-gray-100 rounded-lg mb-3">
                                    <button onClick={() => removeListItem(experiences, setExperiences, exp.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><MiniTrash /></button>
                                    <div className="grid grid-cols-2 gap-2 mb-2 pr-6">
                                        <FormField label="Titre du poste"><input type="text" value={exp.role} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'role', e.target.value)} placeholder="Directeur IT" className={inputClass} /></FormField>
                                        <FormField label="Entreprise"><input type="text" value={exp.company} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'company', e.target.value)} placeholder="TechCorp" className={inputClass} /></FormField>
                                        <FormField label="Période"><input type="text" value={exp.period} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'period', e.target.value)} placeholder="2020 - 2023" className={inputClass} /></FormField>
                                        <FormField label="Ville"><input type="text" value={exp.location} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'location', e.target.value)} placeholder="Dakar" className={inputClass} /></FormField>
                                    </div>
                                    <FormField label="Réalisations (une par ligne)">
                                        <textarea value={exp.achievements} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'achievements', e.target.value)} placeholder="- Augmentation du CA de 20%\n- Management de 5 personnes" rows={3} className={textareaClass} />
                                    </FormField>
                                </div>
                            ))}
                            <button onClick={() => setExperiences([...experiences, { id: genId(), role: '', company: '', location: '', period: '', achievements: '' }])} className="text-xs font-bold text-[#C9A84C] flex items-center gap-1 hover:underline">
                                <MiniPlus /> Ajouter une expérience
                            </button>
                        </FormSection>

                        {/* ── Formation ── */}
                        <FormSection title="Formations" icon={<IconFileText size={18} />} accentColor="#8B7355">
                            {education.map((edu, i) => (
                                <div key={edu.id} className="relative p-3 bg-gray-50 border border-gray-100 rounded-lg mb-3">
                                    <button onClick={() => removeListItem(education, setEducation, edu.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><MiniTrash /></button>
                                    <div className="grid grid-cols-2 gap-2 pr-6">
                                        <FormField label="Diplôme"><input type="text" value={edu.degree} onChange={e => updateListItem(education, setEducation, edu.id, 'degree', e.target.value)} placeholder="Master Informatique" className={inputClass} /></FormField>
                                        <FormField label="Établissement"><input type="text" value={edu.institution} onChange={e => updateListItem(education, setEducation, edu.id, 'institution', e.target.value)} placeholder="Université d'Abomey-Calavi" className={inputClass} /></FormField>
                                        <FormField label="Période"><input type="text" value={edu.period} onChange={e => updateListItem(education, setEducation, edu.id, 'period', e.target.value)} placeholder="2018 - 2020" className={inputClass} /></FormField>
                                        <FormField label="Mention/Détails"><input type="text" value={edu.details} onChange={e => updateListItem(education, setEducation, edu.id, 'details', e.target.value)} placeholder="Mention Très Bien" className={inputClass} /></FormField>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setEducation([...education, { id: genId(), degree: '', institution: '', period: '', details: '' }])} className="text-xs font-bold text-[#C9A84C] flex items-center gap-1 hover:underline">
                                <MiniPlus /> Ajouter une formation
                            </button>
                        </FormSection>

                        {/* ── Compétences & Extras ── */}
                        <FormSection title="Compétences, Langues, Extras" icon={<IconAward size={18} />} accentColor="#C9A84C" defaultOpen={false}>
                            <div className="space-y-4">
                                <FormField label="Compétences (séparées par virgule)">
                                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Node.js, Vente..." className={inputClass} />
                                </FormField>
                                
                                <div className="border-t border-gray-100 pt-3">
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Langues</label>
                                    {languages.map((lang) => (
                                        <div key={lang.id} className="flex gap-2 mb-2 items-center">
                                            <input type="text" value={lang.name} onChange={e => updateListItem(languages, setLanguages, lang.id, 'name', e.target.value)} placeholder="Anglais" className={`flex-1 ${inputClass} py-1.5`} />
                                            <input type="text" value={lang.level} onChange={e => updateListItem(languages, setLanguages, lang.id, 'level', e.target.value)} placeholder="Courant" className={`flex-1 ${inputClass} py-1.5`} />
                                            <button onClick={() => removeListItem(languages, setLanguages, lang.id)} className="text-gray-400 hover:text-red-500"><MiniTrash /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setLanguages([...languages, { id: genId(), name: '', level: '' }])} className="text-[10px] font-bold text-gray-500 hover:text-gray-800 py-1">+ Ajouter Langue</button>
                                </div>

                                <div className="border-t border-gray-100 pt-3">
                                    <label className="text-xs font-bold text-gray-500 mb-2 block">Certifications</label>
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="flex gap-2 mb-2 items-center">
                                            <input type="text" value={cert.name} onChange={e => updateListItem(certifications, setCertifications, cert.id, 'name', e.target.value)} placeholder="AWS Cloud" className={`flex-1 ${inputClass} py-1.5`} />
                                            <input type="text" value={cert.year} onChange={e => updateListItem(certifications, setCertifications, cert.id, 'year', e.target.value)} placeholder="2023" className={`w-20 ${inputClass} py-1.5`} />
                                            <button onClick={() => removeListItem(certifications, setCertifications, cert.id)} className="text-gray-400 hover:text-red-500"><MiniTrash /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setCertifications([...certifications, { id: genId(), name: '', issuer: '', year: '' }])} className="text-[10px] font-bold text-gray-500 hover:text-gray-800 py-1">+ Ajouter Certification</button>
                                </div>

                                <FormField label="Centres d'intérêt (virgules)">
                                    <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Sport, Lecture..." className={inputClass} />
                                </FormField>
                            </div>
                        </FormSection>

                        {/* ── Lettre de motivation (si requis) ── */}
                        {showLetterTab && (
                            <FormSection title="Données pour la Lettre" icon={<IconMail size={18} />} accentColor="#333" defaultOpen={true}>
                                <FormField label="Nom de l'entreprise cible *" hint="Requis pour la lettre"><input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nom entreprise" className={inputClass} /></FormField>
                                <FormField label="Vos principales forces"><input type="text" value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Adaptabilité, Leadership..." className={inputClass} /></FormField>
                                <FormField label="Pourquoi cette entreprise ?"><textarea value={motivation} onChange={e => setMotivation(e.target.value)} placeholder="J'admire votre croissance sur le marché africain..." rows={2} className={textareaClass} /></FormField>
                            </FormSection>
                        )}
                        
                        {/* ── Generate Letter Button ── */}
                        {showLetterTab && (
                            <button
                                onClick={handleGenerateLetter}
                                disabled={isStreaming}
                                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 disabled:opacity-50"
                                style={{ background: '#1F2937' }}
                            >
                                {isStreaming ? <IconLoader2 className="animate-spin" /> : <IconSparkles size={18} />}
                                <span>Générer la Lettre par IA ({calculateCredits()} crédits)</span>
                            </button>
                        )}
                        {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                        
                    </div>

                    {/* ════════════ RIGHT PANEL — LIVE PREVIEW ════════════ */}
                    <div className="flex flex-col bg-[#F3F4F6] rounded-[24px] shadow-lg overflow-hidden border-2 border-gray-200 h-[75vh]">
                        {/* Toolbar */}
                        <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10 shrink-0">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {showCVTab && <button onClick={() => setActiveTab('cv')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'cv' ? 'bg-white shadow text-[#1B2A4A]' : 'text-gray-500'}`}>CV (Live)</button>}
                                {showLetterTab && <button onClick={() => setActiveTab('letter')} className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'letter' ? 'bg-white shadow text-[#1B2A4A]' : 'text-gray-500'}`}>Lettre IA</button>}
                            </div>

                            {activeTab === 'cv' && (
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center gap-2 bg-[#1B2A4A] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#2A3A5E] transition-all"
                                >
                                    {isGeneratingPDF ? <IconLoader2 size={16} className="animate-spin" /> : <IconFileText size={16} />}
                                    Télécharger PDF
                                </button>
                            )}
                            {activeTab === 'letter' && letterOutput && (
                                <button onClick={() => { navigator.clipboard.writeText(letterOutput); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-lg">
                                    {copied ? <IconCheck size={18} className="text-green-600" /> : <IconCopy size={18} />}
                                </button>
                            )}
                        </div>

                        {/* Render Area */}
                        <div className="flex-1 overflow-auto flex justify-center py-8 hide-scrollbar bg-[#E5E7EB]">
                            {activeTab === 'cv' ? (
                                <div className="shadow-2xl">
                                    <CVTemplateProfessional data={liveCVData} photoPreview={photoPreview} />
                                </div>
                            ) : (
                                <div className="w-[794px] max-w-full bg-white p-12 shadow-xl shrink-0">
                                    {isStreaming ? (
                                        <div className="text-center text-gray-400 py-20 flex flex-col items-center">
                                            <IconLoader2 size={32} className="animate-spin mb-4 text-gray-300" />
                                            <span>L&apos;Intelligence Artificielle rédige votre lettre...</span>
                                        </div>
                                    ) : letterOutput ? (
                                        <div className="prose prose-sm max-w-none"><ChatMessageContent content={letterOutput} /></div>
                                    ) : (
                                        <div className="text-center text-gray-400 py-20">
                                            <IconMail size={48} className="mx-auto mb-4 opacity-20" />
                                            <span>Cliquez sur &quot;Générer la Lettre par IA&quot; à gauche.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* Minimal styles for specific needs directly in JSX for self-containment */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
            `}</style>
        </div>
    );
}
