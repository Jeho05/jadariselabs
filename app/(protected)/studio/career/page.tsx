'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconBriefcase,
    IconZap,
    IconLoader2,
    IconCopy,
    IconFileText,
    IconCheck,
    IconChevronDown,
    IconSparkles,
    IconMail,
    IconUser,
    IconAward,
    IconGlobe,
    IconStar,
    IconCode,
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';
import {
    SECTOR_CONFIG,
    type DocumentType,
    type SectorType,
} from '@/lib/prompts/career-templates';
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
            <label className="text-[13px] font-semibold text-gray-700 mb-1.5 block">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {(hint || example) && (
                <div className="mt-1.5 space-y-0.5">
                    {hint && <p className="text-[11px] text-gray-500 leading-tight">💡 {hint}</p>}
                    {example && <p className="text-[11px] text-blue-500/80 leading-tight italic">Ex: {example}</p>}
                </div>
            )}
        </div>
    );
}

/* ─── Collapsible Section ─── */
function FormSection({ title, icon, children, defaultOpen = true, accentColor = '#8B5CF6' }: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
    accentColor?: string;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="bg-white/80 backdrop-blur-md rounded-[20px] shadow-sm border border-gray-100 overflow-hidden mb-5 transition-all hover:shadow-md">
            <button
                type="button"
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                style={{ borderLeft: `4px solid ${accentColor}` }}
            >
                <span className="font-bold text-gray-800 flex items-center gap-3 text-[15px]">
                    <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>
                        {icon}
                    </div>
                    {title}
                </span>
                <div className={`p-1.5 rounded-full bg-gray-100 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>
                    <IconChevronDown size={16} />
                </div>
            </button>
            <div className={`transition-all duration-300 ease-in-out origin-top ${open ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0'} grid`}>
                <div className="overflow-hidden px-5 space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ─── Input styling ─── */
const inputClass = "w-full p-2.5 rounded-xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:border-[var(--color-gold)] focus:ring-4 focus:ring-[var(--color-gold)]/10 transition-all text-[14px] placeholder-gray-400";
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
    const [photoPreviewPdf, setPhotoPreviewPdf] = useState<string | null>(null);
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

    // ── Extra Personal Details ──
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [nationality, setNationality] = useState('');
    const [drivingLicense, setDrivingLicense] = useState('');

    // ── New Dynamic Lists ──
    const [projects, setProjects] = useState([{ id: 'proj_1', name: '', description: '', technologies: '', url: '' }]);
    const [volunteer, setVolunteer] = useState([{ id: 'vol_1', role: '', organization: '', period: '', description: '' }]);
    const [awards, setAwards] = useState([{ id: 'aw_1', name: '', issuer: '', year: '' }]);
    const [customSections, setCustomSections] = useState<Array<{ id: string; title: string; items: string }>>([]);

    // ── Cover Letter Exclusive fields ──
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [motivation, setMotivation] = useState('');
    const [strengths, setStrengths] = useState('');

    // ── Generation state ──
    const [isStreaming, setIsStreaming] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    const [letterOutput, setLetterOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [errorModal, setErrorModal] = useState<{ error: string; details?: string; traceId?: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'cv' | 'letter'>('cv');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // ── localStorage Persistence ──
    const CV_STORAGE_KEY = 'jadarise_cv_draft';
    const isInitialized = useRef(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Handlers for Dynamic Lists ──
    const genId = () => Math.random().toString(36).substr(2, 9);
    
    const updateListItem = <T extends { id: string }>(list: T[], setList: (v: T[]) => void, id: string, key: keyof T, value: string) => {
        setList(list.map(item => item.id === id ? { ...item, [key]: value } : item));
    };
    const removeListItem = <T extends { id: string }>(list: T[], setList: (v: T[]) => void, id: string) => {
        setList(list.filter(item => item.id !== id));
    };

    // ── Photo handler ──
    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setPhotoFile(file);
        setError(null);

        const originalDataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('FileReader failed'));
            reader.readAsDataURL(file);
        });

        try {
            const { previewDataUrl, pdfDataUrl } = await new Promise<{ previewDataUrl: string; pdfDataUrl: string }>((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    /**
                     * buildCoverCropCanvas: Creates a square canvas with a clean
                     * center-crop (cover fit) — like a professional headshot.
                     * No blur, no contain — just a crisp, high-quality crop.
                     */
                    const buildCoverCropCanvas = (size: number, quality: 'high' | 'medium' = 'high') => {
                        const canvas = document.createElement('canvas');
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Canvas context unavailable');

                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = quality;

                        const srcW = img.width || 1;
                        const srcH = img.height || 1;

                        // Center-crop: cover fit (fills the square, crops overflow)
                        const coverScale = Math.max(size / srcW, size / srcH);
                        const drawW = srcW * coverScale;
                        const drawH = srcH * coverScale;
                        const drawX = (size - drawW) / 2;
                        const drawY = (size - drawH) / 2;

                        ctx.drawImage(img, drawX, drawY, drawW, drawH);
                        return canvas;
                    };

                    try {
                        // Preview: 600px square, JPEG for speed
                        const previewCanvas = buildCoverCropCanvas(600, 'high');
                        // PDF: 1200px square, PNG for maximum quality (lossless)
                        const pdfCanvas = buildCoverCropCanvas(1200, 'high');

                        resolve({
                            previewDataUrl: previewCanvas.toDataURL('image/jpeg', 0.92),
                            pdfDataUrl: pdfCanvas.toDataURL('image/png'),
                        });
                    } catch (e) {
                        reject(e);
                    }
                };
                img.onerror = () => reject(new Error('Image decode failed'));
                img.src = originalDataUrl;
            });

            setPhotoPreview(previewDataUrl);
            setPhotoPreviewPdf(pdfDataUrl);
        } catch (err) {
            console.error('Photo normalization failed:', err);
            setPhotoPreview(originalDataUrl);
            setPhotoPreviewPdf(originalDataUrl);
            setError('Photo non compatible pour le PDF. Utilisez plutôt une image JPG ou PNG.');
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
            photoUrl: photoPreviewPdf || undefined,
            dateOfBirth: dateOfBirth || undefined,
            nationality: nationality || undefined,
            drivingLicense: drivingLicense || undefined
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
        references: references.filter(r => r.name).map(r => ({ name: r.name, role: r.role, contact: r.contact })),
        projects: projects.filter(p => p.name).map(p => ({ name: p.name, description: p.description, technologies: p.technologies, url: p.url })),
        volunteer: volunteer.filter(v => v.role || v.organization).map(v => ({ role: v.role, organization: v.organization, period: v.period, description: v.description })),
        awards: awards.filter(a => a.name).map(a => ({ name: a.name, issuer: a.issuer, year: a.year })),
        customSections: customSections.filter(s => s.title && s.items.trim()).map(s => ({
            title: s.title,
            items: s.items.split('\n').map(i => i.replace(/^[-•*]\s*/, '').trim()).filter(Boolean)
        }))
    };

    // ── Native PDF Generator (Vector Perfect PDF via @react-pdf/renderer) ──
    const handleDownloadPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            
            // Importation dynamique
            const { pdf } = await import('@react-pdf/renderer');
            const { CVTemplateReactPDF } = await import('@/components/cv-templates/CVTemplateReactPDF');
            
            // Compilation
            const documentComponent = <CVTemplateReactPDF data={liveCVData} photoPreview={photoPreviewPdf} />;
            
            // Génération
            const asPdf = pdf(documentComponent);
            const blob = await asPdf.toBlob();
            
            // Téléchargement
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `CV_Pro_${name.replace(/\s+/g, '_') || 'JadaRise'}.pdf`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("CV PDF generation failed:", error);
            setError("Erreur lors de la création du CV PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadLetterPDF = async () => {
        try {
            setIsGeneratingPDF(true);
            
            const { pdf } = await import('@react-pdf/renderer');
            const { CoverLetterReactPDF } = await import('@/components/cv-templates/CoverLetterReactPDF');
            
            const documentComponent = <CoverLetterReactPDF content={letterOutput} personalInfo={liveCVData.personalInfo} companyName={companyName} companyAddress={companyAddress} jobTitle={jobTitle} />;
            
            const asPdf = pdf(documentComponent);
            const blob = await asPdf.toBlob();
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const fileName = `Lettre_Motivation_${name.replace(/\s+/g, '_') || 'JadaRise'}.pdf`;
            link.download = fileName;
            link.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error("Letter PDF generation failed:", error);
            setError("Erreur lors de la création de la Lettre PDF.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ── Fetch profile + Restore saved CV data ──
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) {
                    setProfile(data);
                    // Only set name from profile if there's no saved draft
                    const savedRaw = localStorage.getItem(CV_STORAGE_KEY);
                    if (savedRaw) {
                        try {
                            const saved = JSON.parse(savedRaw);
                            // Restore all fields from localStorage
                            if (saved.name) setName(saved.name);
                            else if (data.username) setName(data.username);
                            if (saved.email) setEmail(saved.email);
                            if (saved.phone) setPhone(saved.phone);
                            if (saved.address) setAddress(saved.address);
                            if (saved.linkedin) setLinkedin(saved.linkedin);
                            if (saved.website) setWebsite(saved.website);
                            if (saved.jobTitle) setJobTitle(saved.jobTitle);
                            if (saved.sector) setSector(saved.sector);
                            if (saved.experienceLevel) setExperienceLevel(saved.experienceLevel);
                            if (saved.summary) setSummary(saved.summary);
                            if (saved.skills) setSkills(saved.skills);
                            if (saved.interests) setInterests(saved.interests);
                            if (saved.dateOfBirth) setDateOfBirth(saved.dateOfBirth);
                            if (saved.nationality) setNationality(saved.nationality);
                            if (saved.drivingLicense) setDrivingLicense(saved.drivingLicense);
                            if (saved.companyName) setCompanyName(saved.companyName);
                            if (saved.companyAddress) setCompanyAddress(saved.companyAddress);
                            if (saved.motivation) setMotivation(saved.motivation);
                            if (saved.strengths) setStrengths(saved.strengths);
                            if (saved.photoPreview) setPhotoPreview(saved.photoPreview);
                            if (saved.photoPreviewPdf) setPhotoPreviewPdf(saved.photoPreviewPdf);

                            // Restore dynamic lists (only if they have content)
                            if (saved.experiences?.length) setExperiences(saved.experiences);
                            if (saved.education?.length) setEducation(saved.education);
                            if (saved.languages?.length) setLanguages(saved.languages);
                            if (saved.certifications?.length) setCertifications(saved.certifications);
                            if (saved.references?.length) setReferences(saved.references);
                            if (saved.projects?.length) setProjects(saved.projects);
                            if (saved.volunteer?.length) setVolunteer(saved.volunteer);
                            if (saved.awards?.length) setAwards(saved.awards);
                            if (saved.customSections?.length) setCustomSections(saved.customSections);
                        } catch (e) {
                            console.warn('Failed to restore CV draft:', e);
                            if (data.username) setName(data.username);
                        }
                    } else {
                        if (data.username) setName(data.username);
                    }
                }
            }
            setLoading(false);
            // Mark as initialized after a short delay to let state settle
            setTimeout(() => { isInitialized.current = true; }, 500);
        };
        fetchProfile();
    }, [supabase]);

    // ── Auto-save to localStorage (debounced) ──
    useEffect(() => {
        if (!isInitialized.current) return;

        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setSaveStatus('saving');

        saveTimerRef.current = setTimeout(() => {
            try {
                const draft = {
                    name, email, phone, address, linkedin, website,
                    jobTitle, sector, experienceLevel, summary,
                    skills, interests,
                    dateOfBirth, nationality, drivingLicense,
                    companyName, companyAddress, motivation, strengths,
                    experiences, education, languages, certifications,
                    references, projects, volunteer, awards, customSections,
                    photoPreview, photoPreviewPdf,
                    _savedAt: new Date().toISOString(),
                };
                localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(draft));
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } catch (e) {
                console.warn('Failed to save CV draft:', e);
                setSaveStatus('idle');
            }
        }, 800);

        return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
    }, [
        name, email, phone, address, linkedin, website,
        jobTitle, sector, experienceLevel, summary,
        skills, interests,
        dateOfBirth, nationality, drivingLicense,
        companyName, companyAddress, motivation, strengths,
        experiences, education, languages, certifications,
        references, projects, volunteer, awards, customSections,
        photoPreview, photoPreviewPdf,
    ]);

    useEffect(() => {
        // Only set skills from sector config if user hasn't modified them yet
        if (!isInitialized.current) {
            setSkills(SECTOR_CONFIG[sector].skills.join(', '));
        }
    }, [sector]);

    const calculateCredits = () => DOCUMENT_TYPES.find(t => t.id === documentType)?.credits || 0;

    const openErrorModal = (payload: { error: string; details?: string; traceId?: string }) => {
        setError(payload.error);
        setErrorModal(payload);
    };

    // ── Generate AI Cover Letter ──
    const handleGenerateLetter = async () => {
        if (!name.trim() || !jobTitle.trim() || !companyName.trim()) {
            openErrorModal({
                error: "Champs requis manquants",
                details: "Pour la lettre, indiquez au minimum : Nom, Poste visé, et Nom de l'entreprise.",
            });
            return;
        }

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            openErrorModal({
                error: 'Crédits insuffisants',
                details: `Il faut ${creditsNeeded} crédits.`,
            });
            return;
        }

        setIsStreaming(true); setError(null); setErrorModal(null); setLetterOutput(''); setActiveTab('letter');

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
                let data: any = null;
                let rawText: string | null = null;
                try {
                    data = await res.json();
                } catch {
                    try {
                        rawText = await res.text();
                    } catch {
                        rawText = null;
                    }
                }

                const apiError = (data && typeof data === 'object' && typeof data.error === 'string')
                    ? data.error
                    : `Erreur HTTP ${res.status}`;

                openErrorModal({
                    error: apiError,
                    details: (data && typeof data.details === 'string') ? data.details : (rawText || undefined),
                    traceId: (data && typeof data.trace_id === 'string') ? data.trace_id : undefined,
                });
                setIsStreaming(false);
                return;
            }
            if (!res.body) {
                const text = await res.text();
                setLetterOutput(text);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let full = '';
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });

                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) continue;
                    const dataStr = line.slice(6).trim();
                    if (!dataStr || dataStr === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(dataStr);
                        if (parsed?.meta && profile && parsed.meta.remaining_credits !== undefined) {
                            setProfile({ ...profile, credits: parsed.meta.remaining_credits });
                        }
                        if (typeof parsed?.content === 'string' && parsed.content) {
                            full += parsed.content;
                            setLetterOutput(full);
                        }
                        if (typeof parsed?.error === 'string') {
                            openErrorModal({
                                error: parsed.error,
                                details: typeof parsed.details === 'string' ? parsed.details : undefined,
                                traceId: typeof parsed.trace_id === 'string' ? parsed.trace_id : undefined,
                            });
                        }
                    } catch {
                        continue;
                    }
                }
            }
        } catch {
            openErrorModal({ error: 'Erreur réseau.' });
        } finally {
            setIsStreaming(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <IconLoader2 size={32} className="animate-spin text-[#1B2A4A]" />
        </div>
    );

    const showLetterTab = documentType === 'cover-letter' || documentType === 'both';
    const showCVTab = documentType === 'cv' || documentType === 'both';

    return (
        <div className="min-h-screen bg-[#F8FAFC] relative overflow-hidden text-gray-800">
            {errorModal && (
                <div className="gallery-modal-overlay" onClick={() => setErrorModal(null)}>
                    <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Erreur</h3>
                        <p className="text-[14px] font-semibold text-[var(--color-terracotta-dark)]">{errorModal.error}</p>
                        {errorModal.details && (
                            <p className="whitespace-pre-wrap break-words">{errorModal.details}</p>
                        )}
                        {errorModal.traceId && (
                            <p className="text-[12px] text-gray-500">Trace ID: <span className="font-mono">{errorModal.traceId}</span></p>
                        )}
                        <div className="gallery-modal-actions">
                            <button className="btn-secondary" onClick={() => setErrorModal(null)}>
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Elegant Background Gradients */}
            <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/10 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-amber-400/10 blur-[150px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#1B2A4A] to-[#2A3F6B] text-white rounded-2xl shadow-xl flex items-center justify-center transform rotate-3">
                            <IconBriefcase size={28} />
                        </div>
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">C.V. Studio Pro</h1>
                            <p className="text-gray-500 font-medium mt-1 text-[15px]">Construisez un CV parfait. Vectoriel, gratuit et instantané.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Save Status Indicator */}
                        {saveStatus !== 'idle' && (
                            <div className={`flex items-center gap-2 text-[13px] font-semibold px-4 py-2.5 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
                                saveStatus === 'saved' 
                                    ? 'bg-emerald-50/80 border-emerald-200/50 text-emerald-700' 
                                    : 'bg-amber-50/80 border-amber-200/50 text-amber-700'
                            }`}>
                                {saveStatus === 'saving' ? (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                        Sauvegardé ✓
                                    </>
                                )}
                            </div>
                        )}
                        {profile && (
                            <div className="flex items-center gap-2.5 text-sm font-bold px-5 py-3 rounded-2xl bg-white/60 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100/50">
                                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600">
                                    <IconZap size={18} />
                                </div>
                                <span className="text-[#111827]">{profile.credits === -1 ? '∞' : profile.credits} crédits IA</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Type Selector ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl">
                    {DOCUMENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => { setDocumentType(type.id); if (type.id === 'cv') setActiveTab('cv'); else if (type.id === 'cover-letter') setActiveTab('letter'); }}
                            className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 relative group overflow-hidden ${
                                documentType === type.id 
                                ? 'border-[#C9A84C] bg-white shadow-xl shadow-amber-900/5 transform -translate-y-1' 
                                : 'border-transparent bg-white/60 backdrop-blur-sm hover:bg-white hover:shadow-lg'
                            }`}
                        >
                            {documentType === type.id && <div className="absolute inset-0 bg-gradient-to-br from-[#C9A84C]/5 to-transparent pointer-events-none" />}
                            {type.tag && <div className="absolute top-4 right-4 bg-gradient-to-r from-emerald-400 to-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">{type.tag}</div>}
                            
                            <p className={`font-bold text-[16px] mb-1 ${documentType === type.id ? 'text-[#111827]' : 'text-gray-700'}`}>{type.name}</p>
                            <p className="text-[13px] text-gray-500 mb-3">{type.description}</p>
                            
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-colors ${
                                documentType === type.id 
                                ? 'bg-[#111827] text-[#C9A84C]' 
                                : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                            }`}>
                                {type.credits} crédits
                            </span>
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    {/* ════════════ LEFT PANEL — FORM ════════════ */}
                    <div className="lg:col-span-4 2xl:col-span-3 space-y-2 overflow-y-auto max-h-[75vh] pr-4 custom-scrollbar sticky top-8">
                        {/* ── Identité & Photo ── */}
                        <FormSection title="Profil & Info" icon={<IconUser size={18} />} accentColor="#3B82F6">
                            <div className="flex items-center gap-5 mb-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                                <div onClick={() => photoInputRef.current?.click()} className="w-16 h-16 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all relative overflow-hidden bg-white shrink-0 shadow-sm group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    {photoPreview ? <img src={photoPreview} alt="Photo" className="w-full h-full object-cover" /> : <IconUser size={24} className="text-gray-300 group-hover:text-blue-400 transition-colors" />}
                                </div>
                                <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={handlePhotoChange} className="hidden" />
                                <div className="text-[13px] text-gray-500 font-medium">Ajoutez une photo professionnelle.<br/><span className="text-blue-500 cursor-pointer">Parcourir</span></div>
                            </div>
                            
                            <div className="space-y-4">
                                <FormField label="Nom complet *"><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Prénom NOM" className={inputClass} /></FormField>
                                <FormField label="Poste visé *"><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="ex: Développeur Senior" className={inputClass} /></FormField>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="Email"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@domaine.com" className={inputClass} /></FormField>
                                    <FormField label="Téléphone"><input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+229..." className={inputClass} /></FormField>
                                </div>
                                
                                <FormField label="Lieu"><input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Ex: Cotonou, Bénin" className={inputClass} /></FormField>
                                <FormField label="Résumé du profil"><textarea value={summary} onChange={e => setSummary(e.target.value)} placeholder="Une phrase d'accroche pour votre CV..." rows={3} className={textareaClass} /></FormField>
                                
                                <div className="grid grid-cols-2 gap-3">
                                    <FormField label="LinkedIn"><input type="text" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="in/username" className={inputClass} /></FormField>
                                    <FormField label="Site Web"><input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="portfolio.com" className={inputClass} /></FormField>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                                <FormField label="Date de naissance"><input type="text" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} placeholder="01/01/1995" className={inputClass} /></FormField>
                                <FormField label="Nationalité"><input type="text" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="Béninoise" className={inputClass} /></FormField>
                                <FormField label="Permis"><input type="text" value={drivingLicense} onChange={e => setDrivingLicense(e.target.value)} placeholder="B" className={inputClass} /></FormField>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                                <FormField label="Secteur">
                                    <select value={sector} onChange={e => setSector(e.target.value as SectorType)} className={inputClass}>
                                        {Object.entries(SECTOR_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.name}</option>)}
                                    </select>
                                </FormField>
                                <FormField label="Niveau">
                                    <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value as ExperienceLevel)} className={inputClass}>
                                        {EXPERIENCE_LEVELS.map(lvl => <option key={lvl.id} value={lvl.id}>{lvl.label}</option>)}
                                    </select>
                                </FormField>
                            </div>
                        </FormSection>

                        {/* ── Expériences ── */}
                        <FormSection title="Expériences" icon={<IconBriefcase size={18} />} accentColor="#F59E0B" defaultOpen={false}>
                            {experiences.map((exp, i) => (
                                <div key={exp.id} className="relative p-4 bg-amber-50/30 border border-amber-100/50 rounded-[14px] mb-4 group transition-all hover:bg-amber-50/50">
                                    <button onClick={() => removeListItem(experiences, setExperiences, exp.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"><MiniTrash /></button>
                                    <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                                        <FormField label="Poste"><input type="text" value={exp.role} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'role', e.target.value)} placeholder="Directeur IT" className={inputClass} /></FormField>
                                        <FormField label="Entreprise"><input type="text" value={exp.company} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'company', e.target.value)} placeholder="TechCorp" className={inputClass} /></FormField>
                                        <FormField label="Période"><input type="text" value={exp.period} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'period', e.target.value)} placeholder="2020 - 2023" className={inputClass} /></FormField>
                                        <FormField label="Ville"><input type="text" value={exp.location} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'location', e.target.value)} placeholder="Dakar" className={inputClass} /></FormField>
                                    </div>
                                    <FormField label="Réalisations (une par ligne)">
                                        <textarea value={exp.achievements} onChange={e => updateListItem(experiences, setExperiences, exp.id, 'achievements', e.target.value)} placeholder="- Augmentation de 20%\n- Management équipe" rows={3} className={textareaClass} />
                                    </FormField>
                                </div>
                            ))}
                            <button onClick={() => setExperiences([...experiences, { id: genId(), role: '', company: '', location: '', period: '', achievements: '' }])} className="w-full py-3 rounded-xl border border-dashed border-amber-300 text-amber-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-50 transition-colors mt-2">
                                <MiniPlus /> Ajouter une expérience
                            </button>
                        </FormSection>

                        {/* ── Formation ── */}
                        <FormSection title="Formations" icon={<IconFileText size={18} />} accentColor="#10B981" defaultOpen={false}>
                            {education.map((edu, i) => (
                                <div key={edu.id} className="relative p-4 bg-emerald-50/30 border border-emerald-100/50 rounded-[14px] mb-4 group transition-all hover:bg-emerald-50/50">
                                    <button onClick={() => removeListItem(education, setEducation, edu.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"><MiniTrash /></button>
                                    <div className="grid grid-cols-2 gap-3 pr-8">
                                        <FormField label="Diplôme"><input type="text" value={edu.degree} onChange={e => updateListItem(education, setEducation, edu.id, 'degree', e.target.value)} placeholder="Master Informatique" className={inputClass} /></FormField>
                                        <FormField label="Établissement"><input type="text" value={edu.institution} onChange={e => updateListItem(education, setEducation, edu.id, 'institution', e.target.value)} placeholder="Université d'Abomey-Calavi" className={inputClass} /></FormField>
                                        <FormField label="Période"><input type="text" value={edu.period} onChange={e => updateListItem(education, setEducation, edu.id, 'period', e.target.value)} placeholder="2018 - 2020" className={inputClass} /></FormField>
                                        <FormField label="Détails/Mention"><input type="text" value={edu.details} onChange={e => updateListItem(education, setEducation, edu.id, 'details', e.target.value)} placeholder="Mention Très Bien" className={inputClass} /></FormField>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setEducation([...education, { id: genId(), degree: '', institution: '', period: '', details: '' }])} className="w-full py-3 rounded-xl border border-dashed border-emerald-300 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-50 transition-colors mt-2">
                                <MiniPlus /> Ajouter une formation
                            </button>
                        </FormSection>

                        {/* ── Compétences & Extras ── */}
                        <FormSection title="Compétences & Plus" icon={<IconAward size={18} />} accentColor="#8B5CF6" defaultOpen={false}>
                            <div className="space-y-5">
                                <FormField label="Compétences (séparées par virgule)">
                                    <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="React, Marketing, Gestion..." className={inputClass} />
                                </FormField>
                                
                                <div className="p-4 rounded-[14px] bg-purple-50/30 border border-purple-100/50">
                                    <label className="text-[13px] font-semibold text-gray-700 mb-3 block">Langues</label>
                                    {languages.map((lang) => (
                                        <div key={lang.id} className="flex gap-2 mb-2 items-center group">
                                            <input type="text" value={lang.name} onChange={e => updateListItem(languages, setLanguages, lang.id, 'name', e.target.value)} placeholder="Anglais" className={`flex-1 ${inputClass} py-2`} />
                                            <input type="text" value={lang.level} onChange={e => updateListItem(languages, setLanguages, lang.id, 'level', e.target.value)} placeholder="Courant" className={`flex-1 ${inputClass} py-2`} />
                                            <button onClick={() => removeListItem(languages, setLanguages, lang.id)} className="text-gray-300 hover:text-red-500 p-2"><MiniTrash /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setLanguages([...languages, { id: genId(), name: '', level: '' }])} className="text-xs font-bold text-purple-600 hover:text-purple-800 py-2 inline-flex items-center gap-1">+ Ajouter Langue</button>
                                </div>

                                <div className="p-4 rounded-[14px] bg-purple-50/30 border border-purple-100/50">
                                    <label className="text-[13px] font-semibold text-gray-700 mb-3 block">Certifications</label>
                                    {certifications.map((cert) => (
                                        <div key={cert.id} className="flex gap-2 mb-2 items-center">
                                            <input type="text" value={cert.name} onChange={e => updateListItem(certifications, setCertifications, cert.id, 'name', e.target.value)} placeholder="AWS Cloud" className={`flex-1 ${inputClass} py-2`} />
                                            <input type="text" value={cert.year} onChange={e => updateListItem(certifications, setCertifications, cert.id, 'year', e.target.value)} placeholder="2023" className={`w-24 ${inputClass} py-2 text-center`} />
                                            <button onClick={() => removeListItem(certifications, setCertifications, cert.id)} className="text-gray-300 hover:text-red-500 p-2"><MiniTrash /></button>
                                        </div>
                                    ))}
                                    <button onClick={() => setCertifications([...certifications, { id: genId(), name: '', issuer: '', year: '' }])} className="text-xs font-bold text-purple-600 hover:text-purple-800 py-2 inline-flex items-center gap-1">+ Ajouter Certif</button>
                                </div>

                                <FormField label="Centres d'intérêt (virgules)">
                                    <input type="text" value={interests} onChange={e => setInterests(e.target.value)} placeholder="Sport, Lecture, Tech..." className={inputClass} />
                                </FormField>
                            </div>
                        </FormSection>

                        {/* ── Projets ── */}
                        <FormSection title="Projets / Portfolio" icon={<IconCode size={18} />} accentColor="#06B6D4" defaultOpen={false}>
                            {projects.map((proj) => (
                                <div key={proj.id} className="relative p-4 bg-cyan-50/30 border border-cyan-100/50 rounded-[14px] mb-4 group transition-all hover:bg-cyan-50/50">
                                    <button onClick={() => removeListItem(projects, setProjects, proj.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"><MiniTrash /></button>
                                    <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                                        <FormField label="Nom du projet"><input type="text" value={proj.name} onChange={e => updateListItem(projects, setProjects, proj.id, 'name', e.target.value)} placeholder="Mon App" className={inputClass} /></FormField>
                                        <FormField label="URL"><input type="text" value={proj.url} onChange={e => updateListItem(projects, setProjects, proj.id, 'url', e.target.value)} placeholder="github.com/..." className={inputClass} /></FormField>
                                    </div>
                                    <FormField label="Technologies"><input type="text" value={proj.technologies} onChange={e => updateListItem(projects, setProjects, proj.id, 'technologies', e.target.value)} placeholder="React, Node.js, PostgreSQL" className={inputClass} /></FormField>
                                    <div className="mt-3">
                                        <FormField label="Description"><textarea value={proj.description} onChange={e => updateListItem(projects, setProjects, proj.id, 'description', e.target.value)} placeholder="Description courte du projet..." rows={2} className={textareaClass} /></FormField>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setProjects([...projects, { id: genId(), name: '', description: '', technologies: '', url: '' }])} className="w-full py-3 rounded-xl border border-dashed border-cyan-300 text-cyan-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-50 transition-colors mt-2">
                                <MiniPlus /> Ajouter un projet
                            </button>
                        </FormSection>

                        {/* ── Bénévolat ── */}
                        <FormSection title="Bénévolat / Communauté" icon={<IconGlobe size={18} />} accentColor="#EC4899" defaultOpen={false}>
                            {volunteer.map((vol) => (
                                <div key={vol.id} className="relative p-4 bg-pink-50/30 border border-pink-100/50 rounded-[14px] mb-4 group transition-all hover:bg-pink-50/50">
                                    <button onClick={() => removeListItem(volunteer, setVolunteer, vol.id)} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"><MiniTrash /></button>
                                    <div className="grid grid-cols-2 gap-3 mb-3 pr-8">
                                        <FormField label="Rôle"><input type="text" value={vol.role} onChange={e => updateListItem(volunteer, setVolunteer, vol.id, 'role', e.target.value)} placeholder="Mentor" className={inputClass} /></FormField>
                                        <FormField label="Organisation"><input type="text" value={vol.organization} onChange={e => updateListItem(volunteer, setVolunteer, vol.id, 'organization', e.target.value)} placeholder="ONG Locale" className={inputClass} /></FormField>
                                    </div>
                                    <FormField label="Période"><input type="text" value={vol.period} onChange={e => updateListItem(volunteer, setVolunteer, vol.id, 'period', e.target.value)} placeholder="2021 - Présent" className={inputClass} /></FormField>
                                    <div className="mt-3">
                                        <FormField label="Description"><textarea value={vol.description} onChange={e => updateListItem(volunteer, setVolunteer, vol.id, 'description', e.target.value)} placeholder="Ce que vous avez fait..." rows={2} className={textareaClass} /></FormField>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => setVolunteer([...volunteer, { id: genId(), role: '', organization: '', period: '', description: '' }])} className="w-full py-3 rounded-xl border border-dashed border-pink-300 text-pink-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-pink-50 transition-colors mt-2">
                                <MiniPlus /> Ajouter du bénévolat
                            </button>
                        </FormSection>

                        {/* ── Distinctions / Prix ── */}
                        <FormSection title="Distinctions & Prix" icon={<IconStar size={18} />} accentColor="#F97316" defaultOpen={false}>
                            {awards.map((aw) => (
                                <div key={aw.id} className="flex gap-2 mb-2 items-center group">
                                    <input type="text" value={aw.name} onChange={e => updateListItem(awards, setAwards, aw.id, 'name', e.target.value)} placeholder="Prix d'excellence" className={`flex-1 ${inputClass} py-2`} />
                                    <input type="text" value={aw.issuer} onChange={e => updateListItem(awards, setAwards, aw.id, 'issuer', e.target.value)} placeholder="Organisateur" className={`flex-1 ${inputClass} py-2`} />
                                    <input type="text" value={aw.year} onChange={e => updateListItem(awards, setAwards, aw.id, 'year', e.target.value)} placeholder="2023" className={`w-20 ${inputClass} py-2 text-center`} />
                                    <button onClick={() => removeListItem(awards, setAwards, aw.id)} className="text-gray-300 hover:text-red-500 p-2"><MiniTrash /></button>
                                </div>
                            ))}
                            <button onClick={() => setAwards([...awards, { id: genId(), name: '', issuer: '', year: '' }])} className="text-xs font-bold text-orange-600 hover:text-orange-800 py-2 inline-flex items-center gap-1">+ Ajouter une distinction</button>
                        </FormSection>

                        {/* ── Sections Personnalisées ── */}
                        <FormSection title="Sections libres" icon={<IconSparkles size={18} />} accentColor="#64748B" defaultOpen={false}>
                            <p className="text-[11px] text-gray-500 mb-3">💡 Ajoutez vos propres rubriques : Publications, Conférences, Affiliations, etc.</p>
                            {customSections.map((sec) => (
                                <div key={sec.id} className="relative p-4 bg-slate-50/50 border border-slate-200/50 rounded-[14px] mb-4 group transition-all hover:bg-slate-50">
                                    <button onClick={() => setCustomSections(customSections.filter(s => s.id !== sec.id))} className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors p-1 bg-white rounded-lg opacity-0 group-hover:opacity-100 shadow-sm"><MiniTrash /></button>
                                    <div className="pr-8 mb-3">
                                        <FormField label="Titre de la section"><input type="text" value={sec.title} onChange={e => setCustomSections(customSections.map(s => s.id === sec.id ? { ...s, title: e.target.value } : s))} placeholder="Publications, Conférences..." className={inputClass} /></FormField>
                                    </div>
                                    <FormField label="Éléments (un par ligne)">
                                        <textarea value={sec.items} onChange={e => setCustomSections(customSections.map(s => s.id === sec.id ? { ...s, items: e.target.value } : s))} placeholder="- Article publié dans...
- Conférence à..." rows={3} className={textareaClass} />
                                    </FormField>
                                </div>
                            ))}
                            <button onClick={() => setCustomSections([...customSections, { id: genId(), title: '', items: '' }])} className="w-full py-3 rounded-xl border border-dashed border-slate-300 text-slate-600 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors mt-2">
                                <MiniPlus /> Ajouter une section libre
                            </button>
                        </FormSection>

                        {/* ── Lettre de motivation (si requis) ── */}
                        {showLetterTab && (
                            <FormSection title="Générateur de Lettre" icon={<IconMail size={18} />} accentColor="#111827" defaultOpen={true}>
                                <div className="bg-gray-900 text-white p-4 rounded-xl mb-4 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10"/>
                                    <p className="text-sm font-medium relative z-10 flex items-center gap-2">
                                        <IconSparkles size={16} className="text-amber-400" /> IA JadaRise
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <FormField label="Entreprise ciblée *" hint="Requis pour personnaliser la lettre"><input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nom entreprise" className={inputClass} /></FormField>
                                    <FormField label="Adresse de l'entreprise" hint="Apparaîtra sur la lettre (format international)"><input type="text" value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} placeholder="123 Rue Exemple, Ville" className={inputClass} /></FormField>
                                    <FormField label="Vos principales forces"><input type="text" value={strengths} onChange={e => setStrengths(e.target.value)} placeholder="Adaptabilité, Leadership..." className={inputClass} /></FormField>
                                    <FormField label="Pourquoi cette entreprise ?"><textarea value={motivation} onChange={e => setMotivation(e.target.value)} placeholder="Pourquoi les rejoignez-vous ?" rows={3} className={textareaClass} /></FormField>
                                </div>
                            </FormSection>
                        )}
                        
                        {/* ── Generate Letter Button ── */}
                        {showLetterTab && (
                            <button
                                onClick={handleGenerateLetter}
                                disabled={isStreaming}
                                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-white transition-all transform hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50 disabled:transform-none disabled:shadow-none mt-6 overflow-hidden relative group"
                                style={{ background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)' }}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"/>
                                <span className="relative z-10 flex items-center gap-2">
                                    {isStreaming ? <IconLoader2 className="animate-spin" /> : <IconSparkles size={20} className="text-amber-400" />}
                                    Rédiger la lettre ({calculateCredits()} crédits)
                                </span>
                            </button>
                        )}
                        {error && (
                            <button
                                type="button"
                                onClick={() => setErrorModal({ error })}
                                className="mt-4 text-left w-full text-[13px] text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 font-medium flex items-center gap-2"
                            >
                                <IconCheck size={16} className="text-red-500" /> {error}
                            </button>
                        )}
                        
                    </div>

                    {/* ════════════ RIGHT PANEL — LIVE PREVIEW ════════════ */}
                    <div className="lg:col-span-8 2xl:col-span-9 flex flex-col bg-white/40 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white h-[80vh] overflow-hidden sticky top-8">
                        
                        {/* Toolbar */}
                        <div className="bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100 z-20 shrink-0">
                            <div className="flex bg-gray-100/80 p-1.5 rounded-[14px]">
                                {showCVTab && (
                                    <button onClick={() => setActiveTab('cv')} className={`px-5 py-2 rounded-xl text-[14px] font-bold transition-all ${activeTab === 'cv' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] text-[#111827]' : 'text-gray-500 hover:text-gray-800'}`}>
                                        CV Vectoriel
                                    </button>
                                )}
                                {showLetterTab && (
                                    <button onClick={() => setActiveTab('letter')} className={`px-5 py-2 rounded-xl text-[14px] font-bold transition-all ${activeTab === 'letter' ? 'bg-white shadow-[0_2px_10px_rgb(0,0,0,0.06)] text-[#111827]' : 'text-gray-500 hover:text-gray-800'}`}>
                                        Lettre de Motivation
                                    </button>
                                )}
                            </div>

                            {activeTab === 'cv' && (
                                <button
                                    onClick={handleDownloadPDF}
                                    disabled={isGeneratingPDF}
                                    className="flex items-center gap-2.5 bg-[#111827] text-white px-6 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#1F2937] hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                >
                                    {isGeneratingPDF ? (
                                        <IconLoader2 size={18} className="animate-spin text-[#C9A84C]" />
                                    ) : (
                                        <IconFileText size={18} className="text-[#C9A84C]" />
                                    )}
                                    {isGeneratingPDF ? 'Création du PDF...' : 'Télécharger PDF Parfait'}
                                </button>
                            )}
                            {activeTab === 'letter' && letterOutput && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleDownloadLetterPDF}
                                        disabled={isGeneratingPDF}
                                        className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold hover:bg-[#1F2937] hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                                    >
                                        {isGeneratingPDF ? <IconLoader2 size={18} className="animate-spin text-white" /> : <IconFileText size={18} className="text-white" />}
                                        Télécharger PDF
                                    </button>
                                    <button onClick={() => { navigator.clipboard.writeText(letterOutput); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-gray-600 hover:text-gray-900 bg-gray-100/80 p-2.5 rounded-xl border border-gray-200 shadow-sm transition-all hover:bg-white" title="Copier le texte">
                                        {copied ? <IconCheck size={20} className="text-green-500" /> : <IconCopy size={20} />}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Render Area */}
                        <div className="flex-1 overflow-auto flex justify-center py-10 px-4 items-start bg-[#F3F4F6]/50 shadow-inner cv-scroll">
                            {activeTab === 'cv' ? (
                                <div className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-sm overflow-hidden border border-gray-200 bg-white ring-1 ring-black/5 transform origin-top transition-transform">
                                    {/* The component handles A4 dimensions in its own styles */}
                                    <CVTemplateProfessional data={liveCVData} photoPreview={photoPreview} />
                                </div>
                            ) : (
                                <div className="w-[210mm] min-h-[297mm] max-w-full bg-white p-14 shadow-xl border border-gray-100 rounded-sm shrink-0 text-[15px] leading-relaxed text-gray-800 font-serif">
                                    {isStreaming ? (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-400 py-32 space-y-6">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse" />
                                                <IconLoader2 size={40} className="animate-spin text-[#111827] relative z-10" />
                                            </div>
                                            <span className="font-medium tracking-wide">Rédaction intelligente en cours...</span>
                                        </div>
                                    ) : letterOutput ? (
                                        <div className="prose prose-gray prose-p:my-5 max-w-none"><ChatMessageContent content={letterOutput} /></div>
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-gray-300 py-32 space-y-4">
                                            <IconMail size={64} className="opacity-40" />
                                            <span className="font-medium text-lg">Votre lettre IA apparaîtra ici.</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #94A3B8; }
                
                .cv-scroll::-webkit-scrollbar { width: 10px; height: 10px; }
                .cv-scroll::-webkit-scrollbar-track { background: transparent; }
                .cv-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border: 2px solid #F3F4F6; border-radius: 10px; }
            `}</style>
        </div>
    );
}
