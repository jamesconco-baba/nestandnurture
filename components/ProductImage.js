import NestMark from './NestMark';

export default function ProductImage({ src, alt, className = 'w-full aspect-square' }) {
  if (src) {
    // Plain <img> rather than next/image — Blob URLs live on a per-store subdomain that
    // would otherwise need to be added to next.config.js's image remotePatterns.
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={alt}
        className={`${className} object-cover rounded-lg bg-lavender-50`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`${className} rounded-lg bg-lavender-50 flex items-center justify-center`}>
      <NestMark className="w-1/3 h-1/3 opacity-50" />
    </div>
  );
}
