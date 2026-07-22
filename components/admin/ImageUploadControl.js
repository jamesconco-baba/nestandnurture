'use client';

import { useRef } from 'react';

export default function ImageUploadControl({
  imageUrl,
  disabled,
  disabledReason,
  uploading,
  onSelectFile,
  onRemove,
}) {
  const inputRef = useRef(null);

  const handleClick = () => {
    if (disabled || uploading) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || uploading}
        title={disabled ? disabledReason : undefined}
        className="focus-ring text-xs text-lavender hover:underline disabled:opacity-30 disabled:no-underline disabled:cursor-not-allowed text-left"
      >
        {uploading ? 'Uploading…' : imageUrl ? 'Replace photo' : 'Upload photo'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = ''; // allow re-selecting the same file next time
          if (file) onSelectFile(file);
        }}
      />
      {imageUrl && (
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled || uploading}
          className="focus-ring text-xs text-charcoal/40 hover:text-lavender-600 hover:underline text-left disabled:opacity-30"
        >
          Remove
        </button>
      )}
    </div>
  );
}
