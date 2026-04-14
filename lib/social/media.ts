import crypto from 'crypto';
import sharp from 'sharp';
import { createAdminClient } from '@/lib/supabase/admin';

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function wrapText(text: string, maxChars: number, maxLines: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = '';

    for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (next.length <= maxChars) {
            current = next;
            continue;
        }
        if (current) lines.push(current);
        current = word;
        if (lines.length >= maxLines - 1) break;
    }

    if (lines.length < maxLines && current) {
        lines.push(current);
    }

    if (lines.length === maxLines && words.length > 0) {
        const last = lines[maxLines - 1];
        if (last.length > maxChars - 3) {
            lines[maxLines - 1] = `${last.slice(0, maxChars - 3)}...`;
        }
    }

    return lines.slice(0, maxLines);
}

export async function generateSocialImageUrl({
    text,
    userId,
    bucket = 'generations',
}: {
    text: string;
    userId: string;
    bucket?: string;
}): Promise<string> {
    const width = 1080;
    const height = 1350;
    const paddingX = 120;
    const paddingY = 140;
    const maxChars = 30;
    const maxLines = 8;

    const lines = wrapText(text, maxChars, maxLines);
    const lineHeight = 72;
    const startY = paddingY + 120;

    const textSvg = lines
        .map((line, index) => {
            const y = startY + index * lineHeight;
            return `<text x="${paddingX}" y="${y}" font-size="56" font-family="Arial, sans-serif" fill="#2f2a24" font-weight="700">${escapeXml(line)}</text>`;
        })
        .join('');

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff6e9" />
      <stop offset="100%" stop-color="#ffe9d6" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="48" fill="url(#bg)" />
  <rect x="80" y="80" width="${width - 160}" height="${height - 160}" rx="40" fill="#ffffff" opacity="0.85" />
  <text x="${paddingX}" y="${paddingY}" font-size="28" font-family="Arial, sans-serif" fill="#9b7b5a" font-weight="600">JadaRiseLabs</text>
  ${textSvg}
</svg>`;

    const buffer = await sharp(Buffer.from(svg)).png({ quality: 90 }).toBuffer();

    const supabase = createAdminClient();
    const fileName = `social/${userId}/${crypto.randomUUID()}.png`;

    const { error: uploadError } = await supabase
        .storage
        .from(bucket)
        .upload(fileName, buffer, { contentType: 'image/png', upsert: false });

    if (uploadError) {
        throw new Error(`Failed to upload social image: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    if (!data?.publicUrl) {
        throw new Error('Failed to get public URL for social image');
    }

    return data.publicUrl;
}
