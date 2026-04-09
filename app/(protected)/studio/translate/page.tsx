'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconLanguages,
    IconZap,
    IconLoader2,
    IconAlertCircle,
    IconCopy,
    IconRefresh,
    IconVolume2,
    IconBookOpen,
    IconCheck,
    IconArrowRight,
    IconSparkles,
    IconStar,
    IconGlobe,
    IconMic,
    IconRepeat,
} from '@/components/icons';
import {
    TRANSLATION_PAIRS,
    LANGUAGE_CONFIG,
    type SupportedLanguage,
} from '@/lib/translation/providers';

type TranslationMode = 'simple' | 'phonetic';

export default function TranslateStudioPage() {
    const supabase = createClient();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Translation state
    const [sourceLang, setSourceLang] = useState<SupportedLanguage>('fr');
    const [targetLang, setTargetLang] = useState<SupportedLanguage>('fon');
    const [inputText, setInputText] = useState('');
    const [outputText, setOutputText] = useState('');
    const [phoneticGuide, setPhoneticGuide] = useState<string | null>(null);
    
    // Options
    const [mode, setMode] = useState<TranslationMode>('simple');
    const [isTranslating, setIsTranslating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [translationHistory, setTranslationHistory] = useState<Array<{
        from: string;
        to: string;
        input: string;
        output: string;
        method: string;
        confidence: number;
    }>>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    // Get available pairs for current source
    const availableTargets = TRANSLATION_PAIRS
        .filter(p => p.from === sourceLang)
        .map(p => ({
            value: p.to,
            label: LANGUAGE_CONFIG[p.to].nativeName,
            difficulty: p.difficulty,
            accuracy: p.estimatedAccuracy,
        }));

    // Get current pair info
    const currentPair = TRANSLATION_PAIRS.find(p => p.from === sourceLang && p.to === targetLang);

    // Swap languages
    const swapLanguages = () => {
        // Check if reverse pair exists
        const reversePair = TRANSLATION_PAIRS.find(p => p.from === targetLang && p.to === sourceLang);
        if (reversePair) {
            setSourceLang(targetLang);
            setTargetLang(sourceLang);
            setInputText(outputText);
            setOutputText('');
            setPhoneticGuide(null);
        }
    };

    const calculateCredits = () => {
        const baseCredits = currentPair?.difficulty === 'hard' ? 2 : 1;
        const lengthMultiplier = inputText.length > 500 ? 2 : 1;
        const phoneticCost = mode === 'phonetic' ? 1 : 0;
        return (baseCredits * lengthMultiplier) + phoneticCost;
    };

    const handleTranslate = async () => {
        if (!inputText.trim() || isTranslating) return;

        const creditsNeeded = calculateCredits();
        if (profile && profile.credits !== -1 && profile.credits < creditsNeeded) {
            setError(`Crédits insuffisants. Cette traduction nécessite ${creditsNeeded} crédits.`);
            return;
        }

        setIsTranslating(true);
        setError(null);
        setOutputText('');
        setPhoneticGuide(null);

        try {
            const res = await fetch('/api/generate/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: inputText.trim(),
                    from: sourceLang,
                    to: targetLang,
                    includePhonetic: mode === 'phonetic',
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.details || data.error || 'Une erreur est survenue');
                setIsTranslating(false);
                return;
            }

            const data = await res.json();
            
            if (data.success) {
                setOutputText(data.translation);
                setPhoneticGuide(data.phonetic);
                
                if (profile && data.remaining_credits !== undefined) {
                    setProfile({ ...profile, credits: data.remaining_credits });
                }

                // Add to history
                setTranslationHistory(prev => [{
                    from: LANGUAGE_CONFIG[sourceLang].name,
                    to: LANGUAGE_CONFIG[targetLang].name,
                    input: inputText.substring(0, 50),
                    output: data.translation.substring(0, 50),
                    method: data.method,
                    confidence: data.confidence,
                }, ...prev].slice(0, 10));
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion et réessayez.');
        } finally {
            setIsTranslating(false);
        }
    };

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // no-op
        }
    };

    const clearAll = () => {
        setInputText('');
        setOutputText('');
        setPhoneticGuide(null);
        setError(null);
    };

    const speakText = (text: string, lang: SupportedLanguage) => {
        if (!text.trim() || typeof window === 'undefined') return;
        // Use Web Speech API if available
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            // Map lang codes to BCP-47 for best voice matching
            const langMap: Record<string, string> = { fr: 'fr-FR', en: 'en-US', fon: 'fr-BJ', yoruba: 'yo-NG' };
            utterance.lang = langMap[lang] || 'fr-FR';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    // Quick phrases par langue
    const getQuickPhrases = (): string[] => {
        const phrases: Record<string, string[]> = {
            fr: ['Bonjour', 'Merci beaucoup', 'Comment allez-vous?', 'Au revoir', 'Bonne journée'],
            fon: ['a kwaaba', 'a ná', 'alɔ àfɔ̀?', 'a bɔ́', 'ŋ̀ bɛ na wɛ́'],
            yoruba: ['báwo ni', 'ẹ ṣé', 'báwo ni ẹ ṣe?', 'ó dàbọ̀', 'ọjọ́ rere'],
            en: ['Hello', 'Thank you', 'How are you?', 'Goodbye', 'Have a nice day'],
        };
        return phrases[sourceLang] || phrases.fr;
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

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[10%] left-[-5%] w-[30%] h-[40%] bg-[var(--color-savanna)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />
            <div className="absolute bottom-[10%] right-[-5%] w-[25%] h-[35%] bg-[var(--color-gold)] rounded-full blur-[120px] opacity-[0.1] pointer-events-none" />

            <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="module-icon-premium savanna shadow-lg">
                            <IconLanguages size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Traduction locale
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Français ↔ Fon ↔ Yoruba — Unique en Afrique
                            </p>
                        </div>
                    </div>
                    {profile && (
                        <div className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-[14px] bg-white/60 backdrop-blur-md border border-white shadow-sm">
                            <IconZap size={18} className="text-[var(--color-savanna)]" />
                            <span className="text-gray-800">{profile.credits === -1 ? '∞' : profile.credits} crédits</span>
                        </div>
                    )}
                </div>

                {/* Language Selector */}
                <div className="glass-card-premium rounded-[20px] p-6 mb-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        {/* Source Language */}
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">De</label>
                            <div className="relative">
                                <select
                                    value={sourceLang}
                                    onChange={(e) => {
                                        setSourceLang(e.target.value as SupportedLanguage);
                                        // Auto-select first available target
                                        const firstTarget = TRANSLATION_PAIRS.find(p => p.from === e.target.value);
                                        if (firstTarget) setTargetLang(firstTarget.to);
                                        setOutputText('');
                                        setPhoneticGuide(null);
                                    }}
                                    className="w-full p-4 pr-10 rounded-xl border-2 border-gray-200 bg-white text-base font-medium appearance-none focus:outline-none focus:border-[var(--color-savanna)] transition-all"
                                >
                                    {Object.entries(LANGUAGE_CONFIG).map(([key, config]) => (
                                        <option key={key} value={key}>
                                            {config.flag} {config.nativeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {LANGUAGE_CONFIG[sourceLang].speakers} locuteurs
                            </p>
                        </div>

                        {/* Swap Button */}
                        <button
                            onClick={swapLanguages}
                            disabled={isTranslating}
                            className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors mt-6"
                            title="Inverser les langues"
                        >
                            <IconRepeat size={20} />
                        </button>

                        {/* Target Language */}
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider">Vers</label>
                            <div className="relative">
                                <select
                                    value={targetLang}
                                    onChange={(e) => {
                                        setTargetLang(e.target.value as SupportedLanguage);
                                        setOutputText('');
                                        setPhoneticGuide(null);
                                    }}
                                    className="w-full p-4 pr-10 rounded-xl border-2 border-gray-200 bg-white text-base font-medium appearance-none focus:outline-none focus:border-[var(--color-savanna)] transition-all"
                                >
                                    {availableTargets.map((target) => (
                                        <option key={target.value} value={target.value}>
                                            {LANGUAGE_CONFIG[target.value].flag} {target.label}
                                            {target.difficulty === 'hard' ? ' ⚡' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {LANGUAGE_CONFIG[targetLang].region}
                            </p>
                        </div>
                    </div>

                    {/* Pair Info */}
                    {currentPair && (
                        <div className="mt-4 flex items-center gap-4 p-3 bg-[var(--color-savanna)]/5 rounded-xl">
                            <div className="flex items-center gap-1">
                                {currentPair.difficulty === 'hard' && (
                                    <IconStar size={14} className="text-amber-500" />
                                )}
                                <span className="text-sm font-medium text-[var(--color-savanna)]">
                                    {currentPair.label}
                                </span>
                            </div>
                            <span className="text-xs text-gray-500">
                                Précision estimée: {currentPair.estimatedAccuracy}%
                            </span>
                            <span className="text-xs text-gray-400">
                                Niveau: {currentPair.difficulty === 'easy' ? 'Facile' : currentPair.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Mode Selector */}
                <div className="flex gap-3 mb-6">
                    <button
                        onClick={() => setMode('simple')}
                        disabled={isTranslating}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            mode === 'simple'
                                ? 'bg-[var(--color-savanna)] text-white shadow-md'
                                : 'bg-white/50 text-gray-600 hover:bg-white'
                        }`}
                    >
                        <IconBookOpen size={18} />
                        <span>Traduction simple</span>
                    </button>
                    <button
                        onClick={() => setMode('phonetic')}
                        disabled={isTranslating}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                            mode === 'phonetic'
                                ? 'bg-[var(--color-savanna)] text-white shadow-md'
                                : 'bg-white/50 text-gray-600 hover:bg-white'
                        }`}
                    >
                        <IconVolume2 size={18} />
                        <span>+ Guide phonétique</span>
                        <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">+1 crédit</span>
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input */}
                    <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{LANGUAGE_CONFIG[sourceLang].flag}</span>
                                <span className="font-medium text-gray-700">{LANGUAGE_CONFIG[sourceLang].name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopy(inputText)}
                                    disabled={!inputText}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Copier"
                                >
                                    <IconCopy size={16} />
                                </button>
                                <button
                                    onClick={clearAll}
                                    disabled={!inputText && !outputText}
                                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    title="Effacer"
                                >
                                    <IconRefresh size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder={`Entrez votre texte en ${LANGUAGE_CONFIG[sourceLang].name}...`}
                            rows={8}
                            maxLength={5000}
                            disabled={isTranslating}
                            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-white focus:outline-none focus:border-[var(--color-savanna)] transition-all text-base leading-relaxed resize-none"
                        />
                        
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-gray-400">
                                {inputText.length}/5000 caractères
                            </span>
                            <button
                                onClick={() => speakText(inputText, sourceLang)}
                                disabled={!inputText}
                                className="p-2 rounded-lg text-gray-400 hover:text-[var(--color-savanna)] hover:bg-[var(--color-savanna)]/10 transition-colors"
                                title="Écouter"
                            >
                                <IconMic size={16} />
                            </button>
                        </div>

                        {/* Quick Phrases */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Phrases rapides</p>
                            <div className="flex flex-wrap gap-2">
                                {getQuickPhrases().map((phrase) => (
                                    <button
                                        key={phrase}
                                        onClick={() => setInputText(phrase)}
                                        disabled={isTranslating}
                                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-600 transition-colors"
                                    >
                                        {phrase}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Output */}
                    <div className="glass-card-premium rounded-[20px] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{LANGUAGE_CONFIG[targetLang].flag}</span>
                                <span className="font-medium text-gray-700">{LANGUAGE_CONFIG[targetLang].name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleCopy(outputText)}
                                    disabled={!outputText}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                                    title="Copier"
                                >
                                    <IconCopy size={16} />
                                </button>
                                <button
                                    onClick={() => speakText(outputText, targetLang)}
                                    disabled={!outputText}
                                    className="p-2 rounded-lg text-gray-400 hover:text-[var(--color-savanna)] hover:bg-[var(--color-savanna)]/10 transition-colors"
                                    title="Écouter"
                                >
                                    <IconVolume2 size={16} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="relative">
                            {isTranslating ? (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
                                    <div className="flex flex-col items-center gap-3">
                                        <IconLoader2 size={24} className="animate-spin text-[var(--color-savanna)]" />
                                        <p className="text-sm text-gray-500">Traduction en cours...</p>
                                    </div>
                                </div>
                            ) : null}
                            
                            <textarea
                                value={outputText}
                                readOnly
                                placeholder={`Traduction en ${LANGUAGE_CONFIG[targetLang].name}...`}
                                rows={8}
                                className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-base leading-relaxed resize-none"
                            />
                        </div>
                        
                        {/* Phonetic Guide */}
                        {phoneticGuide && (
                            <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <IconVolume2 size={16} className="text-amber-600" />
                                    <span className="text-sm font-bold text-amber-800">Guide de prononciation</span>
                                </div>
                                <p className="text-sm text-amber-700 font-mono">{phoneticGuide}</p>
                            </div>
                        )}

                        <div className="mt-3 flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                                {outputText.length > 0 && `${outputText.length} caractères`}
                            </span>
                            {currentPair && (
                                <span className="text-xs text-[var(--color-savanna)]">
                                    ~{creditsNeeded} crédit{creditsNeeded > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Translate Button */}
                <button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isTranslating}
                    className="w-full mt-6 flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                    style={{
                        background: 'linear-gradient(135deg, var(--color-savanna) 0%, var(--color-savanna-dark) 100%)',
                        boxShadow: '0 8px 16px -4px rgba(45, 106, 79, 0.4)',
                    }}
                >
                    {isTranslating ? (
                        <>
                            <IconLoader2 size={20} className="animate-spin" />
                            <span>Traduction...</span>
                        </>
                    ) : (
                        <>
                            <IconSparkles size={20} />
                            <span>Traduire ({creditsNeeded} crédit{creditsNeeded > 1 ? 's' : ''})</span>
                        </>
                    )}
                </button>

                {error && (
                    <div className="mt-4 flex items-start gap-3 text-sm text-red-600 bg-red-50 border border-red-100 p-4 rounded-xl">
                        <IconAlertCircle size={20} className="shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* History */}
                {translationHistory.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <IconGlobe size={18} className="text-[var(--color-earth)]" />
                            Historique récent
                        </h3>
                        <div className="space-y-2">
                            {translationHistory.map((item, idx) => (
                                <div key={idx} className="p-4 bg-white/50 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <span>{item.from}</span>
                                            <IconArrowRight size={14} />
                                            <span>{item.to}</span>
                                        </div>
                                        <span className="text-sm text-gray-800 truncate max-w-xs">
                                            {item.input} → {item.output}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            item.method === 'dictionary' 
                                                ? 'bg-green-100 text-green-700' 
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {item.method === 'dictionary' ? 'Dict.' : 'IA'}
                                        </span>
                                        <span className="text-xs text-gray-400">{item.confidence}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Banner */}
                <div className="mt-8 p-6 bg-gradient-to-r from-[var(--color-savanna)]/10 to-transparent rounded-2xl border-l-4 border-[var(--color-savanna)]">
                    <h4 className="font-bold text-[var(--color-savanna-dark)] mb-2 flex items-center gap-2">
                        <IconStar size={18} className="text-[var(--color-gold)]" />
                        Pourquoi c&apos;est unique ?
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        C&apos;est la première plateforme IA à offrir la traduction directe entre le Français et les langues locales 
                        de l&apos;Afrique de l&apos;Ouest. Le Fon est parlé par plus de 2 millions de personnes au Bénin et au Togo, 
                        tandis que le Yoruba compte 45 millions de locuteurs au Nigeria et au Bénin. 
                        Notre approche hybride combine IA avancée et dictionnaires spécialisés pour une précision optimale.
                    </p>
                </div>
            </div>
        </div>
    );
}
