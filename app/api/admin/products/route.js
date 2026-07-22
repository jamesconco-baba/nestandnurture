import { NextResponse } from 'next/server';
import { isAuthorized } from '../../../../lib/adminAuth';
import { getProducts, saveProducts } from '../../../../lib/productStore';
import { kvConfigured } from '../../../../lib/kv';
import { blobConfigured } from '../../../../lib/blob';

function unauthorized() {
  return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
}

function notConfigured() {
  return NextResponse.json(
    {
      ok: false,
      message:
        'Storage is not configured — connect a Redis database to this project in Vercel (see README) to save changes.',
    },
    { status: 503 }
  );
}

export async function GET(request) {
  if (!isAuthorized(request)) return unauthorized();
  const products = await getProducts();
  return NextResponse.json({ products, kvConfigured, blobConfigured });
}

export async function POST(request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!kvConfigured) return notConfigured();

  const body = await request.json().catch(() => ({}));
  const name = (body.name || '').trim();
  if (!name) {
    return NextResponse.json({ ok: false, message: 'Item name is required' }, { status: 400 });
  }

  const products = await getProducts();
  const newProduct = {
    id: `p${Date.now()}`,
    name,
    category: body.category || 'Keepsakes & Extras',
    price: Math.max(0, Number(body.price) || 0),
  };
  const updated = [...products, newProduct];
  await saveProducts(updated);
  return NextResponse.json({ ok: true, product: newProduct, products: updated });
}

export async function PUT(request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!kvConfigured) return notConfigured();

  const body = await request.json().catch(() => ({}));
  const products = await getProducts();
  const idx = products.findIndex((p) => p.id === body.id);
  if (idx === -1) {
    return NextResponse.json({ ok: false, message: 'Item not found' }, { status: 404 });
  }

  const updatedProduct = {
    ...products[idx],
    name: body.name?.trim() || products[idx].name,
    category: body.category || products[idx].category,
    price: body.price !== undefined ? Math.max(0, Number(body.price) || 0) : products[idx].price,
    ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl || null } : {}),
  };
  const updated = [...products];
  updated[idx] = updatedProduct;
  await saveProducts(updated);
  return NextResponse.json({ ok: true, product: updatedProduct, products: updated });
}

export async function DELETE(request) {
  if (!isAuthorized(request)) return unauthorized();
  if (!kvConfigured) return notConfigured();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const products = await getProducts();
  const updated = products.filter((p) => p.id !== id);
  await saveProducts(updated);
  return NextResponse.json({ ok: true, products: updated });
}
