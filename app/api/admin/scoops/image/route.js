import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthorized } from '../../../../../lib/adminAuth';
import { getScoops, saveScoops } from '../../../../../lib/scoopStore';
import { kvConfigured } from '../../../../../lib/kv';
import { blobConfigured } from '../../../../../lib/blob';

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (!blobConfigured) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Image storage is not configured — connect Vercel Blob storage to this project (Storage tab → Create Database → Blob) and redeploy (see README).',
      },
      { status: 503 }
    );
  }
  if (!kvConfigured) {
    return NextResponse.json(
      { ok: false, message: 'Storage (Redis) is not configured — connect that first.' },
      { status: 503 }
    );
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'Could not read upload' }, { status: 400 });
  }

  const file = formData.get('file');
  const scoopId = formData.get('scoopId');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ ok: false, message: 'No file provided' }, { status: 400 });
  }
  if (!scoopId) {
    return NextResponse.json({ ok: false, message: 'Missing scoopId' }, { status: 400 });
  }
  if (!file.type || !file.type.startsWith('image/')) {
    return NextResponse.json({ ok: false, message: 'Only image files are allowed' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, message: 'Image is too large — please use a file under 4MB.' },
      { status: 400 }
    );
  }

  const scoops = await getScoops();
  const idx = scoops.findIndex((s) => s.id === scoopId);
  if (idx === -1) {
    return NextResponse.json({ ok: false, message: 'Tier not found' }, { status: 404 });
  }

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';

  let blob;
  try {
    blob = await put(`scoops/${scoopId}-${Date.now()}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });
  } catch (err) {
    console.error('[scoops/image] Blob upload failed:', err);
    return NextResponse.json(
      { ok: false, message: `Upload to storage failed: ${err.message || 'unknown error'}` },
      { status: 500 }
    );
  }

  const updated = [...scoops];
  updated[idx] = { ...updated[idx], imageUrl: blob.url };
  await saveScoops(updated);

  return NextResponse.json({ ok: true, scoop: updated[idx], scoops: updated });
}
