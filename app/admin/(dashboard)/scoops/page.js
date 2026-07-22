'use client';

import { useEffect, useState } from 'react';
import { formatNaira } from '../../../../lib/format';
import ProductImage from '../../../../components/ProductImage';
import ImageUploadControl from '../../../../components/admin/ImageUploadControl';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export default function AdminScoopsPage() {
  const [scoops, setScoops] = useState(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [blobConfigured, setBlobConfigured] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [uploadingId, setUploadingId] = useState(null);

  const load = () => {
    fetch('/api/admin/scoops')
      .then((r) => r.json())
      .then((d) => {
        setScoops(d.scoops || []);
        setKvConfigured(Boolean(d.kvConfigured));
        setBlobConfigured(Boolean(d.blobConfigured));
      })
      .catch(() => setError('Could not load Mystery Scoop tiers.'));
  };

  useEffect(load, []);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 2500);
  };

  const handleImageSelect = async (scoop, file) => {
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('That image is too large — please use a file under 4MB.');
      return;
    }

    setUploadingId(scoop.id);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('scoopId', scoop.id);

    try {
      const res = await fetch('/api/admin/scoops/image', { method: 'POST', body: formData });
      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        setError(`Upload failed — server returned an unexpected response (status ${res.status}).`);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(data.message || `Image upload failed (status ${res.status})`);
        return;
      }
      setScoops(data.scoops);
      flash('Image updated');
    } catch (err) {
      console.error('[admin/scoops] image upload error:', err);
      setError('Image upload failed — check your connection and try again.');
    } finally {
      setUploadingId(null);
    }
  };

  const removeImage = async (scoop) => {
    setError('');
    const res = await fetch('/api/admin/scoops', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: scoop.id, imageUrl: null }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setError(data.message || 'Could not remove image');
      return;
    }
    setScoops(data.scoops);
    flash('Image removed');
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-3xl mb-1">Mystery Scoops</h1>
        <p className="text-sm text-charcoal/50 font-body">
          Attach a real photo to each tier so customers can gauge the size of the package before
          buying. Names, prices, and highlights for these three tiers aren&apos;t editable here yet —
          just say the word if you&apos;d like that added too.
        </p>
      </header>

      {!kvConfigured && (
        <div className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Changes won&apos;t be saved yet.</p>
          <p>
            Connect a Redis database from the Vercel Marketplace (Storage tab → Upstash Redis)
            and redeploy.
          </p>
        </div>
      )}

      {kvConfigured && !blobConfigured && (
        <div className="mb-6 rounded-xl border border-gold-300 bg-gold-50 p-5 text-sm font-body text-charcoal/70">
          <p className="font-semibold mb-1">Photo uploads aren&apos;t connected yet.</p>
          <p>
            Vercel project → <strong>Storage</strong> tab → <strong>Create Database</strong> →{' '}
            <strong>Blob</strong> → connect it to this project, then redeploy. See the README for
            details.
          </p>
        </div>
      )}

      {error && (
        <p className="mb-4 text-sm text-lavender-600 font-body bg-lavender-50 border border-lavender-200 rounded-lg p-3">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 text-sm text-gold-700 font-body bg-gold-50 border border-gold-200 rounded-lg p-3">
          {notice}
        </p>
      )}

      {!scoops ? (
        <p className="text-sm text-charcoal/40 font-body py-10 text-center">Loading tiers…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {scoops.map((s) => {
            const isUploading = uploadingId === s.id;
            return (
              <div key={s.id} className="rounded-2xl border border-lavender-100 bg-white p-6">
                <ProductImage src={s.imageUrl} alt={s.name} className="w-full h-40 mb-4" />
                <h2 className="font-display text-xl mb-1">{s.name}</h2>
                <p className="text-lavender font-body font-semibold mb-3">{formatNaira(s.price)}</p>
                <p className="text-sm text-charcoal/50 font-body mb-4">{s.tagline}</p>
                <ImageUploadControl
                  imageUrl={s.imageUrl}
                  disabled={!kvConfigured || !blobConfigured}
                  disabledReason={
                    !kvConfigured
                      ? 'Connect Redis storage first'
                      : !blobConfigured
                      ? 'Connect Vercel Blob storage first'
                      : undefined
                  }
                  uploading={isUploading}
                  onSelectFile={(file) => handleImageSelect(s, file)}
                  onRemove={() => removeImage(s)}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
