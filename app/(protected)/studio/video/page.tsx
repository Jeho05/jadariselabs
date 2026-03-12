/**
 * Video Studio Page - Simplified for Vercel
 * Uses Supabase Realtime for progress tracking
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useVideoGeneration, calculateRequiredCredits } from '@/hooks/useVideoGeneration';
import type { Profile } from '@/lib/types';
import type { VideoModel, VideoQuality, VideoStyle } from '@/lib/types/video';
import { VIDEO_MODELS } from '@/lib/types/video';
import {
  IconVideo,
  IconSparkles,
  IconZap,
  IconCheck,
  IconRefresh,
  IconDownload,
  IconLoader2,
  IconAlertCircle,
} from '@/components/icons';
import ShareButtons from '@/components/share-buttons';
import Link from 'next/link';

export default function VideoStudioPage() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [duration, setDuration] = useState<3 | 5 | 15>(5);
  const [selectedModel, setSelectedModel] = useState<VideoModel>('wan-video/wan-2.1-1.3b');
  const [quality, setQuality] = useState<VideoQuality>('standard');
  const [style, setStyle] = useState<VideoStyle>('cinematic');

  const {
    isGenerating,
    status,
    progress,
    videoUrl,
    error: generationError,
    estimatedTime,
    generate,
    cancel,
    reset,
  } = useVideoGeneration({
    onCompleted: () => fetchProfile(),
    onFailed: (err) => console.error('Generation failed:', err),
  });

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const requiredCredits = calculateRequiredCredits(selectedModel, duration, quality);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    await generate(prompt, duration, selectedModel, quality, style);
  }, [prompt, duration, selectedModel, quality, style, generate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <IconLoader2 size={40} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

  // All plans can access free video generation now
  // We remove the restriction that prevented free users from accessing the studio

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-terracotta)] mb-4">
            <IconVideo size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Studio VidÃ©o</h1>
          <p className="text-[var(--color-text-secondary)]">CrÃ©ez des vidÃ©os avec l&apos;IA</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Prompt */}
            <div className="glass-card-premium p-6 rounded-2xl">
              <label className="block text-sm font-semibold mb-2">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="DÃ©crivez la vidÃ©o que vous souhaitez crÃ©er..."
                className="w-full h-32 p-4 rounded-xl border border-[var(--color-cream-dark)] bg-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-gold)]/50"
                disabled={isGenerating}
              />
              <div className="text-xs text-[var(--color-text-muted)] mt-2">{prompt.length}/500</div>
            </div>

            {/* Duration */}
            <div className="glass-card-premium p-6 rounded-2xl">
              <label className="block text-sm font-semibold mb-3">DurÃ©e</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 3, label: '3s' },
                  { value: 5, label: '5s' },
                ].map((d) => {
                  return (
                    <button
                      key={d.value}
                      onClick={() => setDuration(d.value as 3 | 5 | 15)}
                      disabled={isGenerating}
                      className={`p-3 rounded-2xl border-2 transition-all ${duration === d.value ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[var(--color-cream-dark)] bg-white hover:border-[var(--color-gold)]/50'}`}
                    >
                      {duration === d.value && <IconCheck size={14} className="absolute top-2 right-2 text-[var(--color-gold)]" />}
                      <div className="font-bold">{d.label}</div>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mt-3 text-center">Les modÃ¨les IA gratuits actuels gÃ©nÃ¨rent des vidÃ©os courtes de quelques secondes.</p>
            </div>

            {/* Model */}
            <div className="glass-card-premium p-6 rounded-2xl">
              <label className="block text-sm font-semibold mb-3">ModÃ¨le IA</label>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(VIDEO_MODELS) as VideoModel[]).map((model) => {
                  const info = VIDEO_MODELS[model];
                  return (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      disabled={isGenerating}
                      className={`relative p-3 rounded-2xl border-2 transition-all ${selectedModel === model ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/5' : 'border-[var(--color-cream-dark)] bg-white hover:border-[var(--color-gold)]/50'}`}
                    >
                      {selectedModel === model && <IconCheck size={14} className="absolute top-2 right-2 text-[var(--color-gold)]" />}
                      <div className="font-semibold text-sm">{info.displayName}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{info.creditsPerSecond}cr/s</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card-premium p-6 rounded-2xl">
              <div className="flex justify-between mb-4">
                <span className="text-sm text-[var(--color-text-secondary)]">CrÃ©dits</span>
                <span className="font-bold flex items-center gap-1">
                  <IconZap size={18} className="text-[var(--color-gold)]" />
                  {profile?.credits === -1 ? 'âˆž' : profile?.credits ?? 0}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)]">CoÃ»t</span>
                <span className="font-semibold text-[var(--color-gold)]">{requiredCredits} cr</span>
              </div>
            </div>

            <div className="glass-card-premium p-6 rounded-2xl">
              {isGenerating ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <IconLoader2 size={24} className="animate-spin mx-auto mb-2 text-[var(--color-gold)]" />
                    <p className="font-semibold">GÃ©nÃ©ration...</p>
                    <div className="w-full bg-[var(--color-cream)] rounded-full h-2 my-2">
                      <div className="bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-terracotta)] h-2 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    {estimatedTime > 0 && <p className="text-xs text-[var(--color-text-muted)]">~{Math.ceil(estimatedTime / 60)} min</p>}
                  </div>
                  <button onClick={cancel} className="w-full py-3 rounded-xl border border-[var(--color-terracotta)] text-[var(--color-terracotta)]">
                    Annuler
                  </button>
                </div>
              ) : videoUrl ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <IconCheck size={24} className="mx-auto mb-2 text-green-600" />
                    <p className="font-semibold text-green-600">TerminÃ©!</p>
                  </div>
                  <button onClick={() => { reset(); setPrompt(''); }} className="w-full btn-premium py-3">
                    <IconRefresh size={18} className="inline mr-2" /> Nouvelle vidÃ©o
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || (profile?.credits !== undefined && profile?.credits !== -1 && profile?.credits < requiredCredits)}
                  className="w-full btn-premium py-4 disabled:opacity-50"
                >
                  <IconSparkles size={20} className="inline mr-2" /> GÃ©nÃ©rer
                </button>
              )}

              {generationError && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 flex items-start gap-2">
                  <IconAlertCircle size={18} /> {generationError}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Result */}
        {videoUrl && (
          <div className="mt-8 glass-card-premium p-6 rounded-2xl">
            <h3 className="font-semibold mb-4">Votre vidÃ©o</h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />
            </div>
            <div className="flex gap-3 mt-4">
              <a href={videoUrl} download className="flex-1 py-3 rounded-xl border border-[var(--color-cream-dark)] hover:bg-[var(--color-cream)]/50 flex items-center justify-center gap-2">
                <IconDownload size={18} /> TÃ©lÃ©charger
              </a>
              <ShareButtons url={videoUrl} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

