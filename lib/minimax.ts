/**
 * MiniMax Hailuo Video API Client
 * Docs: https://platform.minimaxi.com/document/Video%20generation
 */

export type MinimaxVideoStatus = 'Preparing' | 'Queueing' | 'Processing' | 'Success' | 'Fail';

export interface MinimaxVideoTask {
    task_id: string;
    status: MinimaxVideoStatus;
    file_id?: string;
    message?: string;
    error?: string;
    video_width?: number;
    video_height?: number;
}

export interface MinimaxFileInfo {
    file_id: string;
    filename?: string;
    length?: number;
    download_url: string;
}

const DEFAULT_MINIMAX_BASE = 'https://api.minimax.chat/v1';

function getMinimaxBase(): string {
    return process.env.MINIMAX_API_BASE || DEFAULT_MINIMAX_BASE;
}

function getMinimaxKey(): string {
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
        throw new Error('MINIMAX_API_KEY is not configured');
    }
    return apiKey;
}

export async function createMinimaxVideoTask(params: {
    prompt: string;
    model: string;
    duration: number;
    resolution: string;
}): Promise<{ taskId: string }> {
    const apiKey = getMinimaxKey();
    const response = await fetch(`${getMinimaxBase()}/video_generation`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: params.prompt,
            model: params.model,
            duration: params.duration,
            resolution: params.resolution,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MiniMax error: ${errorText.substring(0, 200)}`);
    }

    const payload = await response.json();
    const taskId = payload?.task_id;
    if (!taskId) {
        throw new Error('MiniMax response missing task_id');
    }

    return { taskId };
}

export async function getMinimaxVideoTask(taskId: string): Promise<MinimaxVideoTask> {
    const apiKey = getMinimaxKey();
    const response = await fetch(`${getMinimaxBase()}/query/video_generation?task_id=${encodeURIComponent(taskId)}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MiniMax status error: ${errorText.substring(0, 200)}`);
    }

    const payload = await response.json();
    return {
        task_id: payload?.task_id || taskId,
        status: payload?.status as MinimaxVideoStatus,
        file_id: payload?.file_id,
        message: payload?.message,
        error: payload?.error,
        video_width: payload?.video_width,
        video_height: payload?.video_height,
    };
}

export async function retrieveMinimaxFile(fileId: string): Promise<MinimaxFileInfo> {
    const apiKey = getMinimaxKey();
    const response = await fetch(`${getMinimaxBase()}/files/retrieve?file_id=${encodeURIComponent(fileId)}`, {
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MiniMax file error: ${errorText.substring(0, 200)}`);
    }

    const payload = await response.json();
    const file = payload?.file;
    if (!file?.download_url) {
        throw new Error('MiniMax response missing download_url');
    }

    return {
        file_id: file.file_id || fileId,
        filename: file.filename,
        length: file.length,
        download_url: file.download_url,
    };
}
