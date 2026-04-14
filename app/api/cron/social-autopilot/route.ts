import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
    generateSocial,
    getCreditsRequired,
    readStreamedContent,
    type SocialGenerateInput,
} from '@/lib/social/generate';
import { publishDraftById } from '@/lib/social/publish';

function unauthorized() {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

async function runCron() {
    const supabase = createAdminClient();

    const now = new Date();

    const { data: schedules, error: schedulesError } = await supabase
        .from('social_schedules')
        .select('*')
        .eq('enabled', true)
        .lte('next_run_at', now.toISOString())
        .order('next_run_at', { ascending: true })
        .limit(25);

    if (schedulesError) {
        return NextResponse.json({ error: 'Failed to load schedules' }, { status: 500 });
    }

    const results: Array<{ schedule_id: string; ok: boolean; skipped?: boolean; reason?: string }> = [];

    for (const schedule of schedules || []) {
        try {
            const scheduleId = schedule.id as string;
            const userId = schedule.user_id as string;

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, credits')
                .eq('id', userId)
                .single();

            if (profileError || !profile) {
                results.push({ schedule_id: scheduleId, ok: false, reason: 'profile_not_found' });
                continue;
            }

            const creditsRequired = getCreditsRequired({
                platform: 'tiktok',
                topic: 'x',
                multiVariant: false,
            } as SocialGenerateInput);

            const weekCreditsUsed = (schedule.week_credits_used as number) || 0;
            const weeklyBudget = (schedule.credits_budget_weekly as number) || 0;

            const needReset = !schedule.week_anchor_date || (Date.now() - new Date(schedule.week_anchor_date as string).getTime()) >= 7 * 24 * 60 * 60 * 1000;
            if (needReset) {
                await supabase
                    .from('social_schedules')
                    .update({ week_anchor_date: now.toISOString().slice(0, 10), week_credits_used: 0 })
                    .eq('id', scheduleId);
            }

            const effectiveWeekCreditsUsed = needReset ? 0 : weekCreditsUsed;

            if (weeklyBudget > 0 && effectiveWeekCreditsUsed + creditsRequired > weeklyBudget) {
                const nextRetry = new Date(Date.now() + 6 * 60 * 60 * 1000);
                await supabase
                    .from('social_schedules')
                    .update({ next_run_at: nextRetry.toISOString() })
                    .eq('id', scheduleId);

                results.push({ schedule_id: scheduleId, ok: true, skipped: true, reason: 'weekly_budget_exceeded' });
                continue;
            }

            if (profile.credits !== -1 && profile.credits < creditsRequired) {
                const nextRetry = new Date(Date.now() + 24 * 60 * 60 * 1000);
                await supabase
                    .from('social_schedules')
                    .update({ next_run_at: nextRetry.toISOString() })
                    .eq('id', scheduleId);

                results.push({ schedule_id: scheduleId, ok: true, skipped: true, reason: 'insufficient_credits' });
                continue;
            }

            const platforms = (schedule.platforms as string[]) || [];
            const config = (schedule.config as Record<string, any>) || {};
            const lastIndex = typeof config.last_platform_index === 'number' ? config.last_platform_index : -1;
            const nextIndex = platforms.length ? (lastIndex + 1) % platforms.length : 0;
            const platform = (platforms[nextIndex] || 'tiktok') as any;

            const topic = (config.topic as string) || 'Créer du contenu authentique et utile pour promouvoir mon activité';
            const context = (config.context as string) || '';
            const tone = (config.tone as string) || 'authentique';
            const sector = (config.sector as string) || 'general';
            const contentType = (config.content_type as any) || 'tips';
            const autoPublish = !!config.auto_publish;

            const generation = await generateSocial({
                input: {
                    platform,
                    contentType,
                    topic,
                    context,
                    tone,
                    sector,
                    multiVariant: false,
                } as SocialGenerateInput,
                stream: true,
            });

            const content = await readStreamedContent(generation.response);

            if (!content.trim()) {
                results.push({ schedule_id: scheduleId, ok: false, reason: 'empty_generation' });
                continue;
            }

            if (profile.credits !== -1) {
                await supabase
                    .from('profiles')
                    .update({ credits: profile.credits - creditsRequired })
                    .eq('id', userId);
            }

            const { data: draftRow } = await supabase.from('social_drafts').insert({
                user_id: userId,
                schedule_id: scheduleId,
                platform,
                content_type: contentType,
                topic,
                context,
                tone,
                sector,
                content,
                status: autoPublish ? 'approved' : 'draft',
                planned_for: autoPublish ? now.toISOString() : null,
                metadata: {
                    provider: generation.provider,
                    template_id: generation.templateId,
                },
                credits_used: creditsRequired,
            }).select('id').single();

            if (autoPublish && draftRow?.id) {
                await publishDraftById(draftRow.id);
            }

            await supabase
                .from('generations')
                .insert({
                    user_id: userId,
                    type: 'social',
                    prompt: String(topic).substring(0, 500),
                    result_url: null,
                    metadata: {
                        platform,
                        autopilot: true,
                        schedule_id: scheduleId,
                        provider: generation.provider,
                        template_id: generation.templateId,
                        content_type: contentType,
                    },
                    credits_used: creditsRequired,
                });

            const postsPerWeek = Math.max(1, Math.min(21, Number(schedule.posts_per_week || 3)));
            const intervalMs = Math.floor((7 * 24 * 60 * 60 * 1000) / postsPerWeek);
            const nextRunAt = new Date(Date.now() + intervalMs);

            await supabase
                .from('social_schedules')
                .update({
                    next_run_at: nextRunAt.toISOString(),
                    week_credits_used: effectiveWeekCreditsUsed + creditsRequired,
                    config: { ...config, last_platform_index: nextIndex },
                })
                .eq('id', scheduleId);

            results.push({ schedule_id: scheduleId, ok: true });
        } catch (err) {
            results.push({ schedule_id: String((schedule as any).id), ok: false, reason: err instanceof Error ? err.message : String(err) });
        }
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
}

export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
        return NextResponse.json({ error: 'Missing CRON_SECRET' }, { status: 500 });
    }

    const auth = request.headers.get('authorization') || '';
    if (auth !== `Bearer ${secret}`) {
        return unauthorized();
    }

    return runCron();
}

export async function POST(request: Request) {
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get('authorization') || '';

    if (!secret) {
        return NextResponse.json({ error: 'Missing CRON_SECRET' }, { status: 500 });
    }

    if (auth !== `Bearer ${secret}`) {
        return unauthorized();
    }

    return runCron();
}
