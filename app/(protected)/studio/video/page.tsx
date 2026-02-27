/**
 * Video Studio Page - Enterprise Grade
 * Real-time progress tracking, WebSocket integration, premium UI
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useVideoWebSocket } from '@/lib/websocket/hook';
import type { Profile } from '@/lib/types';
import type { VideoModel, VideoQuality, VideoStyle } from '@/lib/types/video';
import { VIDEO_MODELS } from '@/lib/types/video';
import {
  IconVideo,
  IconClock,
  IconSparkles,
  IconZap,
  IconCheck,
  IconX,
  IconRefresh,
  IconDownload,
  IconShare,
  IconLoader2,
  IconAlertCircle,
  IconTrendingUp,
} from '@/components/icons';
import ShareButtons from '@/components/share-buttons';
import Link from 'next/link';

export default function VideoStudioPageEnterprise() {
  const supabase = createClient();
  
  // User state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Generation config
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<3 | 5 | 15>(5);
  const [selectedModel, setSelectedModel] = useState<VideoModel>('wan2');
  const [quality, setQuality] = useState<VideoQuality>('standard');
  const [style, setStyle] = useState<VideoStyle>('cinematic');

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [creditsCharged, setCreditsCharged] = useState<number>(0);

  // WebSocket for real-time updates
  const { progress, isConnected, cancelGeneration } = useVideoWebSocket({
    generationId: generationId || undefined,
    onCompleted: (videoUrl) => {
      setResultUrl(videoUrl);
      setIsGenerating(false);
    },
    onFailed: (err) => {
      setError(err);
      setIsGenerating(false);
    },
  });

  // Fetch user profile
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

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Le prompt ne peut pas être vide.');
      return;
    }

    setError(null);
    setResultUrl(null);
    setIsGenerating(true);
    setGenerationId(null);

    try {
      const response = await fetch('/api/generate/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration,
          model: selectedModel,
          quality,
          style,
          enhancePrompt: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || 'Erreur lors de la génération.');
        setIsGenerating(false);
        return;
      }

      setGenerationId(data.generation_id);
      setEstimatedTime(data.estimated_time_seconds);
      setQueuePosition(data.queue_position);
      setCreditsCharged(data.credits_charged);

      if (profile && profile.credits !== -1) {
        setProfile({ ...profile, credits: data.remaining_credits });
      }

    } catch (err) {
      setError('Erreur réseau. Veuillez vérifier votre connexion.');
      setIsGenerating(false);
    }
  }, [prompt, duration, selectedModel, quality, style, profile]);

  // Handle cancel
  const handleCancel = useCallback(async () => {
    if (generationId) {
      cancelGeneration(generationId);
      setIsGenerating(false);
      setGenerationId(null);
      setError('Génération annulée');
    }
  }, [generationId, cancelGeneration]);

  // Check duration allowance
  const isDurationAllowed = (d: number) => {
    if (!profile) return false;
    if (profile.plan === 'pro') return true;
    if (profile.plan === 'starter' && d <= 5) return true;
    return false;
  };

  // Calculate credits
  const calculateCredits = () => {
    const modelInfo = VIDEO_MODELS[selectedModel];
    const baseCredits = modelInfo.creditsPerSecond * duration;
    const qualityMultiplier = quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1;
    return Math.ceil(baseCredits * qualityMultiplier);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)] pt-20 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-cream-dark)] mb-4" />
          <div className="h-4 w-32 bg-[var(--color-cream-dark)] rounded" />
        </div>
      </div>
    );
  }

  // Free plan blocked
  if (profile?.plan === 'free') {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[var(--color-cream)] p-6 lg:p-12 relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'url(/pattern-african.svg)' }} />
        <div className="max-w-3xl mx-auto relative z-10 text-center animate-fade-in-up mt-20 glass-card-premium p-12 rounded-3xl">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] flex items-center justify-center mb-6 shadow-premium">
            <IconVideo size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
            Studio Vidéo Premium
          </h1>
          <p className="text-[var(--color-text-secondary)] text-lg mb-8 max-w-xl mx-auto">
            La génération vidéo est réservée aux abonnés Starter et Pro. Donnez vie à vos idées avec des animations époustouflantes générées par l&apos;IA.
          </p>
          <Link href="/pricing" className="btn-cta-premium inline-flex py-4 px-8 text-lg">
            Passer Premium
          </Link>
        </div>
      </div>
    );
  }

  const requiredCredits = calculateCredits();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[var(--color-cream)] p-6 lg:p-12 relative overflow-hidden">
      {/* Background pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'url(/pattern-african.svg)' }} />
      
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-gold w-96 h-96 -top-48 -right-48 opacity-20" />
        <div className="orb orb-terracotta w-64 h-64 -bottom-32 -left-32 opacity-15" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
            Studio Vidéo
            <span className="text-[var(--color-gold)]"> Enterprise</span>
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Génération vidéo IA avancée avec suivi en temps réel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Prompt Input */}
            <div className="glass-card-premium rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center shadow-lg">
                  <IconVideo size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                    Configuration
                  </h2>
                  <p className="text-[var(--color-text-secondary)] text-sm">
                    Personnalisez votre vidéo
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm border border-red-100 flex items-start gap-3 animate-fade-in">
                  <IconAlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}

              <div className="space-y-6">
                {/* Prompt */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Description de la vidéo
                  </label>
                  <textarea
                    className="input-premium w-full min-h-[120px] resize-none"
                    placeholder="Ex: Un lion majestueux marchant dans la savane africaine au coucher du soleil, style cinématographique 4K..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isGenerating}
                  />
                  <div className="mt-1 text-xs text-[var(--color-text-muted)] text-right">
                    {prompt.length}/1000
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Modèle IA
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(VIDEO_MODELS) as VideoModel[]).map((model) => {
                      const info = VIDEO_MODELS[model];
                      const isAllowed = profile?.plan === 'pro' || 
                        (profile?.plan === 'starter' && (model === 'wan2' || model === 'gen2'));
                      
                      return (
                        <button
                          key={model}
                          onClick={() => isAllowed && setSelectedModel(model)}
                          disabled={!isAllowed || isGenerating}
                          className={`relative p-3 rounded-2xl border-2 transition-all ${selectedModel === model
                            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                            : 'border-[var(--color-cream-dark)] hover:border-[var(--color-gold)]/50 bg-white'
                          } ${!isAllowed ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {selectedModel === model && (
                            <div className="absolute top-2 right-2 text-[var(--color-gold)]">
                              <IconCheck size={14} />
                            </div>
                          )}
                          <div className="font-semibold text-sm">{info.displayName}</div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            {info.creditsPerSecond}cr/s
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2 flex justify-between items-center">
                    <span>Durée</span>
                    {profile?.plan === 'starter' && (
                      <span className="text-xs text-[var(--color-gold)] bg-[var(--color-gold)]/10 px-2 py-1 rounded-full">
                        Pro (15s) verrouillé
                      </span>
                    )}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[3, 5, 15].map((sec) => {
                      const allowed = isDurationAllowed(sec);
                      return (
                        <button
                          key={sec}
                          onClick={() => allowed && setDuration(sec as 3 | 5 | 15)}
                          disabled={!allowed || isGenerating}
                          className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${duration === sec
                            ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                            : 'border-[var(--color-cream-dark)] hover:border-[var(--color-gold)]/50 bg-white'
                          } ${!allowed ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                        >
                          {duration === sec && (
                            <div className="absolute top-2 right-2 text-[var(--color-gold)]">
                              <IconCheck size={14} />
                            </div>
                          )}
                          <IconClock size={20} className={duration === sec ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-muted)]'} />
                          <span className={`font-semibold ${duration === sec ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                            {sec}s
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-2">
                    Qualité
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['standard', 'high', 'ultra'] as VideoQuality[]).map((q) => (
                      <button
                        key={q}
                        onClick={() => setQuality(q)}
                        disabled={isGenerating}
                        className={`p-3 rounded-2xl border-2 transition-all ${quality === q
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5'
                          : 'border-[var(--color-cream-dark)] hover:border-[var(--color-gold)]/50 bg-white'
                        }`}
                      >
                        <span className={`font-semibold capitalize ${quality === q ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                          {q}
                        </span>
                        {q === 'ultra' && (
                          <span className="text-xs text-[var(--color-terracotta)] ml-1">2x</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-4 border-t border-[var(--color-border)]">
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-[var(--color-text-secondary)]">Coût estimé</span>
                    <span className="font-semibold text-[var(--color-gold)] flex items-center gap-1">
                      <IconZap size={16} /> {requiredCredits} crédits
                    </span>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim() || (profile?.credits !== undefined && profile?.credits !== -1 && profile?.credits < requiredCredits)}
                    className="w-full btn-premium py-4 flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <div className="flex items-center gap-2">
                        <IconLoader2 size={20} className="animate-spin" />
                        <span>Génération en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 group">
                        <IconSparkles size={20} className="group-hover:animate-pulse" />
                        <span>Générer la vidéo</span>
                      </div>
                    )}
                  </button>

                  {isGenerating && (
                    <button
                      onClick={handleCancel}
                      className="w-full mt-3 py-2 text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-2"
                    >
                      <IconX size={16} />
                      Annuler la génération
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-7">
            <div className="glass-card-premium rounded-3xl p-6 lg:p-8 h-full min-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  Résultat
                </h2>
                <div className="flex items-center gap-3">
                  {isConnected && (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      WebSocket connecté
                    </span>
                  )}
                  {isGenerating && progress && (
                    <span className="text-sm text-[var(--color-gold)] flex items-center gap-2">
                      <IconTrendingUp size={16} />
                      {progress.stage}: {Math.round(progress.progress)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 rounded-2xl overflow-hidden bg-[var(--color-cream-dark)] border border-[var(--color-border)] relative flex items-center justify-center">
                {/* Generation Progress */}
                {isGenerating && progress ? (
                  <div className="text-center p-8 w-full">
                    {/* Progress Circle */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-[var(--color-cream-dark)]"
                        />
                        <circle
                          cx="64"
                          cy="64"
                          r="56"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={352}
                          strokeDashoffset={352 - (352 * progress.progress) / 100}
                          className="text-[var(--color-gold)] transition-all duration-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[var(--color-text-primary)]">
                          {Math.round(progress.progress)}%
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2 capitalize">
                      {progress.stage.replace('-', ' ')}
                    </h3>
                    <p className="text-[var(--color-text-secondary)] mb-4">
                      {progress.message}
                    </p>

                    {estimatedTime && (
                      <p className="text-sm text-[var(--color-text-muted)]">
                        Temps estimé: ~{Math.round(estimatedTime / 60)} min
                      </p>
                    )}

                    {queuePosition && queuePosition > 0 && (
                      <p className="text-sm text-[var(--color-text-muted)] mt-2">
                        Position dans la file: {queuePosition}
                      </p>
                    )}
                  </div>
                ) : resultUrl ? (
                  /* Video Result */
                  <div className="absolute inset-0 w-full h-full bg-black">
                    <video
                      src={resultUrl}
                      controls
                      autoPlay
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center p-8 max-w-sm">
                    <IconVideo size={48} className="mx-auto text-[var(--color-text-muted)] mb-4" />
                    <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
                      Votre vidéo apparaîtra ici
                    </h3>
                    <p className="text-[var(--color-text-secondary)] text-sm">
                      Configurez les paramètres et lancez la génération pour voir le résultat en temps réel.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {resultUrl && !isGenerating && (
                <div className="mt-6 animate-fade-in-up space-y-4">
                  <div className="flex gap-3">
                    <a
                      href={resultUrl}
                      download
                      className="flex-1 btn-premium py-3 flex items-center justify-center gap-2"
                    >
                      <IconDownload size={18} />
                      Télécharger
                    </a>
                  </div>
                  <ShareButtons 
                    url={resultUrl} 
                    title={`Regardez cette vidéo IA générée avec JadaRiseLabs:\n"${prompt}"`} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
