import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../../lib/adminAuth';
import { getScoops, saveScoops } from '../../../../lib/scoopStore';
import { kvConfigured } from '../../../../lib/kv';
import { blobConfigured } from '../../../../lib/blob';

export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  const scoops = await getScoops();
  return NextResponse.json({ scoops, kvConfigured, blobConfigured });
}

export async function PUT(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (!kvConfigured) {
    return NextResponse.json({ ok: false, message: 'Storage is not configured.' }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const scoops = await getScoops();
  const idx = scoops.findIndex((s) => s.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, message: 'Tier not found' }, { status: 404 });
  }

  const updated = [...scoops];
  updated[idx] = {
    ...updated[idx],
    ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
  };
  await saveScoops(updated);
  return NextResponse.json({ ok: true, scoop: updated[idx], scoops: updated });
}
