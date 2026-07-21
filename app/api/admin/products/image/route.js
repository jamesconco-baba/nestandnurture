import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAuthorized } from '../../../../../lib/adminAuth';
import { getProducts, saveProducts } from '../../../../../lib/productStore';
import { kvConfigured } from '../../../../../lib/kv';

const MAX_BYTES = 4 * 1024 * 1024; // stay safely under Vercel's 4.5MB server-upload body limit

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'Image storage is not configured — connect Vercel Blob storage to this project (see README) and redeploy.',
      },
      { status: 503 }
    );
  }
  if (!kvConfigured) {
    return NextResponse.json(
      { ok: false, message: 'Product storage (Redis) is not configured — connect that first.' },
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
  const productId = formData.get('productId');

  if (!file || typeof file === 'string') {
    return NextResponse.json({ ok: false, message: 'No file provided' }, { status: 400 });
  }
  if (!productId) {
    return NextResponse.json({ ok: false, message: 'Missing productId' }, { status: 400 });
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

  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx === -1) {
    return NextResponse.json({ ok: false, message: 'Item not found' }, { status: 404 });
  }

  const ext = (file.name?.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';

  let blob;
  try {
    blob = await put(`products/${productId}-${Date.now()}.${ext}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, message: 'Upload to storage failed' }, { status: 500 });
  }

  const updated = [...products];
  updated[idx] = { ...updated[idx], imageUrl: blob.url };
  await saveProducts(updated);

  return NextResponse.json({ ok: true, product: updated[idx], products: updated });
}
