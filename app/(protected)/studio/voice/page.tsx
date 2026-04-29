'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types';
import {
    IconZap, IconLoader2, IconAlertCircle, IconCopy, IconRefresh,
    IconUpload, IconX, IconSparkles, IconCheck, IconMic, IconVolume2, IconLanguages
} from '@/components/icons';
import ChatMessageContent from '@/components/chat-message-content';

type InputMode = 'record' | 'upload';
type Language = 'auto' | 'fr' | 'en' | 'yo' | 'fon'; // Adding local languages context

const LANGUAGES: Array<{ id: Language; label: string }> = [
    { id: 'auto', label: 'Automatique' },
    { id: 'fr', label: 'Français' },
    { id: 'en', label: 'Anglais' },
];

export default function VoiceStudioPage() {
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const outputRef = useRef<HTMLDivElement>(null);

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Input state
    const [inputMode, setInputMode] = useState<InputMode>('record');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [language, setLanguage] = useState<Language>('auto');

    // Recording state
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<BlobPart[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Output state
    const [isStreaming, setIsStreaming] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [structuredOutput, setStructuredOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Load profile
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
                if (data) setProfile(data);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    // Handle timer for recording
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRecording]);

    // Format time (MM:SS)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Determine best mime type
            let mimeType = 'audio/webm';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                if (MediaRecorder.isTypeSupported('audio/mp4')) mimeType = 'audio/mp4';
                else mimeType = ''; // Fallback to browser default
            }

            const options = mimeType ? { mimeType } : undefined;
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
                // Create a File object from Blob
                const file = new File([audioBlob], `recording-${Date.now()}.${mimeType.includes('mp4') ? 'm4a' : 'webm'}`, { type: mimeType || 'audio/webm' });
                setSelectedFile(file);
                stream.getTracks().forEach(track => track.stop()); // Release mic
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setError(null);
            setSelectedFile(null);
            setTranscription('');
            setStructuredOutput('');
        } catch (err) {
            console.error('Mic error:', err);
            setError('Impossible d\'accéder au microphone. Vérifiez les autorisations de votre navigateur.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleFileSelect = useCallback((file: File) => {
        const supportedTypes = ['audio/webm', 'audio/ogg', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/wav', 'audio/mp4', 'video/webm'];
        // Some browsers might not report standard mime types correctly, so we check extension too just in case
        const ext = file.name.split('.').pop()?.toLowerCase();
        const validExts = ['webm', 'ogg', 'mp3', 'm4a', 'wav', 'mp4'];
        
        if (!supportedTypes.includes(file.type) && (!ext || !validExts.includes(ext))) {
            setError('Format audio non supporté. Utilisez: MP3, WAV, M4A, OGG, WEBM');
            return;
        }
        if (file.size > 25 * 1024 * 1024) {
            setError('Fichier trop volumineux (max 25MB)');
            return;
        }
        setSelectedFile(file);
        setError(null);
        setTranscription('');
        setStructuredOutput('');
        setInputMode('upload');
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    }, [handleFileSelect]);

    const removeFile = () => {
        setSelectedFile(null);
        setTranscription('');
        setStructuredOutput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerate = async () => {
        if (!selectedFile || isStreaming) return;

        setIsStreaming(true);
        setError(null);
        setTranscription('');
        setStructuredOutput('');

        const formData = new FormData();
        formData.append('audio', selectedFile);
        formData.append('language', language);

        try {
            const res = await fetch('/api/voice', { method: 'POST', body: formData });

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
                                    if (parsed.meta.transcription) {
                                        setTranscription(parsed.meta.transcription);
                                    }
                                    if (profile && parsed.meta.remaining_credits !== undefined) {
                                        setProfile({ ...profile, credits: parsed.meta.remaining_credits });
                                    }
                                }
                                if (parsed.content) {
                                    fullContent += parsed.content;
                                    setStructuredOutput(fullContent);
                                }
                            } catch { /* skip */ }
                        }
                    }
                }
            }
        } catch {
            setError('Erreur réseau. Vérifiez votre connexion.');
        } finally {
            setIsStreaming(false);
        }
    };

    const handleCopy = async () => {
        if (!structuredOutput) return;
        try {
            await navigator.clipboard.writeText(structuredOutput);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* no-op */ }
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

    return (
        <div className="min-h-screen bg-[var(--color-cream)] relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'url(/pattern-african.svg)', backgroundRepeat: 'repeat' }} />
            <div className="absolute top-[20%] right-[-5%] w-[40%] h-[40%] bg-[var(--color-savanna)] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[-10%] w-[30%] h-[35%] bg-[var(--color-earth)] rounded-full blur-[120px] opacity-[0.08] pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-savanna)] to-[var(--color-savanna-light)] flex items-center justify-center shadow-lg">
                            <IconMic size={28} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                Assistant Vocal
                            </h1>
                            <p className="text-[var(--color-text-secondary)] text-sm mt-1">
                                Dictée vocale intelligente avec structuration automatique
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

                <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
                    {/* ── Left Panel ── */}
                    <div className="space-y-5">
                        {/* Input Mode Toggle */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                            <div className="flex rounded-xl bg-[var(--color-cream-dark)]/50 p-1 mb-5">
                                <button onClick={() => setInputMode('record')} disabled={isRecording || isStreaming}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${inputMode === 'record' ? 'bg-white shadow-sm text-[var(--color-savanna)]' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <IconMic size={16} /> Enregistrer
                                </button>
                                <button onClick={() => setInputMode('upload')} disabled={isRecording || isStreaming}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${inputMode === 'upload' ? 'bg-white shadow-sm text-[var(--color-savanna)]' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <IconUpload size={16} /> Importer
                                </button>
                            </div>

                            {inputMode === 'record' ? (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="relative mb-6">
                                        {isRecording && (
                                            <>
                                                <div className="absolute inset-0 rounded-full bg-[var(--color-terracotta)]/20 animate-ping" />
                                                <div className="absolute -inset-4 rounded-full border border-[var(--color-terracotta)]/30 animate-pulse" />
                                            </>
                                        )}
                                        <button
                                            onClick={isRecording ? stopRecording : startRecording}
                                            disabled={isStreaming}
                                            className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                                                isRecording 
                                                    ? 'bg-[var(--color-terracotta)] text-white shadow-[var(--color-terracotta)]/30' 
                                                    : 'bg-white text-[var(--color-savanna)] border-4 border-[var(--color-cream)] hover:border-[var(--color-savanna)]/20'
                                            }`}
                                        >
                                            {isRecording ? <div className="w-8 h-8 bg-white rounded-sm" /> : <IconMic size={40} />}
                                        </button>
                                    </div>
                                    <p className={`text-3xl font-mono tracking-wider font-medium mb-2 ${isRecording ? 'text-[var(--color-terracotta)]' : 'text-gray-400'}`}>
                                        {formatTime(recordingTime)}
                                    </p>
                                    <p className="text-sm text-gray-500 font-medium">
                                        {isRecording ? 'Enregistrement en cours... Cliquez pour arrêter' : 'Cliquez sur le micro pour parler'}
                                    </p>
                                    
                                    {selectedFile && !isRecording && (
                                         <div className="mt-6 w-full p-4 bg-[var(--color-savanna)]/5 border border-[var(--color-savanna)]/20 rounded-xl flex flex-col gap-3">
                                             <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[var(--color-savanna)]">
                                                    <IconCheck size={18} />
                                                    <span className="font-semibold text-sm">Enregistrement terminé</span>
                                                </div>
                                                <button onClick={removeFile} className="text-gray-400 hover:text-red-500"><IconX size={16} /></button>
                                             </div>
                                             <audio src={URL.createObjectURL(selectedFile)} controls className="w-full h-10" />
                                         </div>
                                    )}
                                </div>
                            ) : (
                                !selectedFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        onDrop={handleDrop}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragging ? 'border-[var(--color-savanna)] bg-[var(--color-savanna)]/5' : 'border-gray-300 hover:border-[var(--color-savanna)] hover:bg-gray-50'}`}
                                    >
                                        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-[var(--color-savanna)]/20 to-[var(--color-savanna-light)]/20 flex items-center justify-center">
                                            <IconVolume2 size={24} className="text-[var(--color-savanna)]" />
                                        </div>
                                        <p className="text-gray-600 font-semibold mb-1">Glissez-déposez un audio</p>
                                        <p className="text-xs text-gray-400">MP3, WAV, M4A, OGG (max 25MB)</p>
                                        <input ref={fileInputRef} type="file" accept="audio/*"
                                            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3 p-4 bg-white/60 rounded-xl border border-[var(--color-border)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-xl bg-[var(--color-cream-dark)] flex items-center justify-center text-[var(--color-savanna)]">
                                                <IconVolume2 size={22} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-800 truncate text-sm">{selectedFile.name}</p>
                                                <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <button onClick={removeFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                <IconX size={16} />
                                            </button>
                                        </div>
                                        <audio src={URL.createObjectURL(selectedFile)} controls className="w-full h-10 mt-2" />
                                    </div>
                                )
                            )}

                            {error && (
                                <div className="flex items-start gap-2 mt-4 text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl">
                                    <IconAlertCircle size={18} className="shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="glass-card-premium rounded-[20px] p-5 shadow-sm">
                             <label className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider flex items-center gap-2">
                                <IconLanguages size={14} /> Langue source (Optionnel)
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {LANGUAGES.map((lang) => (
                                    <button key={lang.id} onClick={() => setLanguage(lang.id)} disabled={isStreaming}
                                        className={`py-2 rounded-lg text-sm font-medium transition-all ${language === lang.id
                                            ? 'bg-[var(--color-savanna)] text-white shadow-sm'
                                            : 'bg-[var(--color-cream)] text-gray-600 hover:bg-gray-200'}`}>
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button onClick={handleGenerate} disabled={!selectedFile || isStreaming || isRecording}
                            className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] font-bold text-white transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--color-savanna) 0%, var(--color-savanna-light) 100%)',
                                boxShadow: '0 8px 16px -4px rgba(45, 106, 79, 0.4)',
                            }}>
                            {isStreaming ? (
                                <><IconLoader2 size={20} className="animate-spin" /><span>Traitement en cours...</span></>
                            ) : (
                                <><IconSparkles size={20} /><span>Transcrire et Structurer</span></>
                            )}
                        </button>
                    </div>

                    {/* ── Right Panel — Output ── */}
                    <div className="flex flex-col min-h-[600px] bg-white rounded-[24px] shadow-lg overflow-hidden border border-gray-100">
                        {/* Output Header */}
                        <div className="bg-gray-50 px-5 py-3.5 flex items-center justify-between shrink-0 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <IconSparkles size={18} className="text-[var(--color-savanna)]" />
                                <span className="text-gray-700 font-semibold text-sm">
                                    Résultat Structuré
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {structuredOutput && (
                                    <button onClick={handleCopy}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-[var(--color-savanna)] hover:bg-[var(--color-cream)] transition-all">
                                        {copied ? <><IconCheck size={14} className="text-green-500" /> Copié!</> : <><IconCopy size={14} /> Copier</>}
                                    </button>
                                )}
                                <button onClick={() => { setStructuredOutput(''); setTranscription(''); }} disabled={!structuredOutput && !transcription}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-30">
                                    <IconRefresh size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Output Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 hide-scrollbar">
                            {isStreaming && !structuredOutput ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-savanna)]/20 to-[var(--color-savanna-light)]/20 flex items-center justify-center">
                                            <IconLoader2 size={28} className="animate-spin text-[var(--color-savanna)]" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-gray-600">
                                            {transcription ? 'Structuration par IA en cours...' : 'Transcription de l\'audio (Whisper)...'}
                                        </p>
                                    </div>
                                </div>
                            ) : transcription || structuredOutput ? (
                                <div className="space-y-8">
                                    {/* Raw Transcription Block */}
                                    {transcription && (
                                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                <IconMic size={14} /> Transcription Brute
                                            </h4>
                                            <p className="text-sm text-gray-700 italic leading-relaxed">
                                                &quot;{transcription}&quot;
                                            </p>
                                        </div>
                                    )}

                                    {/* Structured Result */}
                                    {structuredOutput && (
                                        <div className="prose prose-sm sm:prose-base max-w-none text-[15px] leading-relaxed">
                                            <ChatMessageContent content={structuredOutput} />
                                            <div ref={outputRef} />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-gray-400">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--color-savanna)]/10 to-[var(--color-savanna-light)]/10 flex items-center justify-center border-2 border-dashed border-[var(--color-border)]">
                                            <IconVolume2 size={32} className="text-[var(--color-savanna)]/40" />
                                        </div>
                                    </div>
                                    <div className="text-center max-w-sm">
                                        <p className="text-base font-semibold text-gray-600 mb-2">Prêt à vous écouter</p>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            Enregistrez un vocal ou uploadez un fichier audio. L&apos;IA le transcrira instantanément et structurera les informations clés.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
