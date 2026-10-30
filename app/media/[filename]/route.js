import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { uploadDir } from '../../../lib/site-data.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const mimeTypes = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

export async function GET(_request, { params }) {
  const { filename } = await params;
  if (!/^[a-f0-9]{32}\.(?:jpg|jpeg|png|webp)$/i.test(filename || '')) return new Response(null, { status: 404 });
  const extension = filename.split('.').pop().toLowerCase();
  try {
    const image = await readFile(path.join(uploadDir, filename));
    return new Response(image, { headers: { 'Content-Type': mimeTypes[extension], 'Cache-Control': 'public, max-age=3600' } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
