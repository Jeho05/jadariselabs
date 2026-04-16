type ServerSecret = {
    OPENROUTER_API_KEY?: string;
    DMXAPI_API_KEY?: string;
};

function getRequiredEnv(name: keyof ServerSecret): string {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const serverEnv = {
    get OPENROUTER_API_KEY(): string {
        return getRequiredEnv('OPENROUTER_API_KEY');
    },
    get DMXAPI_API_KEY(): string {
        return getRequiredEnv('DMXAPI_API_KEY');
    },
};
