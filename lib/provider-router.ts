export type ProviderName =
    | 'router'
    | 'pollinations'
    | 'fal'
    | 'huggingface'
    | 'groq'
    | 'gemini'
    | 'gemini-image'
    | 'deepseek'
    | 'zhipu'
    | 'replicate'
    | 'minimax'
    | 'tavily'
    | 'exa'
    | 'brave'
    | 'firecrawl'
    | 'fish'
    | 'kokoro'
    | 'puter';

export interface ProviderAttempt {
    provider: ProviderName;
    ok: boolean;
    status?: number;
    error?: string;
    latency_ms: number;
    skipped?: boolean;
    skip_reason?: 'circuit_open' | 'disabled';
}

export interface ProviderTask<T> {
    name: ProviderName;
    run: () => Promise<T>;
    canFallback?: (error: ProviderError) => boolean;
}

export interface ProviderRunResult<T> {
    result: T;
    provider: ProviderName;
    attempts: ProviderAttempt[];
    latency_ms: number;
}

export interface ProviderRouterOptions {
    traceId?: string;
    purpose?: string;
}

export class ProviderError extends Error {
    provider: ProviderName;
    status?: number;
    code?: string;

    constructor(provider: ProviderName, message: string, status?: number, code?: string) {
        super(message);
        this.name = 'ProviderError';
        this.provider = provider;
        this.status = status;
        this.code = code;
    }
}

type CircuitState = {
    state: 'closed' | 'open' | 'half_open';
    failures: number;
    opened_at?: number;
    last_failure_at?: number;
    last_success_at?: number;
};

const CIRCUIT_CONFIG = {
    failureThreshold: 2,
    resetAfterMs: 30_000,
};

const CIRCUITS = new Map<ProviderName, CircuitState>();

function getCircuitState(provider: ProviderName): CircuitState {
    const existing = CIRCUITS.get(provider);
    if (existing) return existing;
    const fresh: CircuitState = { state: 'closed', failures: 0 };
    CIRCUITS.set(provider, fresh);
    return fresh;
}

function shouldAllowProvider(provider: ProviderName): boolean {
    const now = Date.now();
    const state = getCircuitState(provider);

    if (state.state === 'open') {
        const openedAt = state.opened_at ?? 0;
        if (now - openedAt >= CIRCUIT_CONFIG.resetAfterMs) {
            state.state = 'half_open';
            return true;
        }
        return false;
    }

    return true;
}

function recordSuccess(provider: ProviderName): void {
    const state = getCircuitState(provider);
    state.state = 'closed';
    state.failures = 0;
    state.last_success_at = Date.now();
}

function recordFailure(provider: ProviderName): void {
    const state = getCircuitState(provider);
    state.failures += 1;
    state.last_failure_at = Date.now();

    if (state.failures >= CIRCUIT_CONFIG.failureThreshold) {
        state.state = 'open';
        state.opened_at = Date.now();
    }
}

function toProviderError(provider: ProviderName, error: unknown): ProviderError {
    if (error instanceof ProviderError) return error;
    if (error instanceof Error) return new ProviderError(provider, error.message);
    return new ProviderError(provider, String(error));
}

export async function runProviderChain<T>(
    tasks: ProviderTask<T>[],
    options: ProviderRouterOptions = {}
): Promise<ProviderRunResult<T>> {
    if (!tasks.length) {
        throw new ProviderError('router', 'No providers configured');
    }

    const attempts: ProviderAttempt[] = [];
    const overallStart = Date.now();
    let lastError: ProviderError | undefined;

    for (const task of tasks) {
        if (!shouldAllowProvider(task.name)) {
            attempts.push({
                provider: task.name,
                ok: false,
                latency_ms: 0,
                skipped: true,
                skip_reason: 'circuit_open',
            });
            continue;
        }

        const start = Date.now();
        try {
            const result = await task.run();
            const latency = Date.now() - start;
            recordSuccess(task.name);
            attempts.push({
                provider: task.name,
                ok: true,
                latency_ms: latency,
            });
            return {
                result,
                provider: task.name,
                attempts,
                latency_ms: Date.now() - overallStart,
            };
        } catch (error) {
            const latency = Date.now() - start;
            const providerError = toProviderError(task.name, error);
            lastError = providerError;

            attempts.push({
                provider: task.name,
                ok: false,
                status: providerError.status,
                error: providerError.message,
                latency_ms: latency,
            });

            recordFailure(task.name);

            const canFallback = task.canFallback ? task.canFallback(providerError) : true;
            if (!canFallback) {
                throw providerError;
            }
        }
    }

    if (lastError) {
        throw lastError;
    }

    throw new ProviderError(
        'router',
        `No providers available${options.purpose ? ` for ${options.purpose}` : ''}`
    );
}
