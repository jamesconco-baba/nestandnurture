export default function NestMark({ className = 'w-10 h-10' }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Nest & Nurture emblem"
    >
      <g fill="none" stroke="#C5A059" strokeWidth="2.2" strokeLinecap="round">
        <path d="M20 62c0-16 13-29 30-29s30 13 30 29" />
        <path d="M14 58c8-4 16-6 21-3" />
        <path d="M86 58c-8-4-16-6-21-3" />
        <path d="M24 66c10-3 20-3 30 0" />
        <path d="M76 66c-10-3-20-3-30 0" />
        <path d="M30 71c8-2 16-2 24 0" />
        <path d="M70 71c-8-2-16-2-24 0" />
      </g>
      <path
        d="M62 30c2-8 3-15 10-19-2 8-1 14-4 20"
        fill="none"
        stroke="#C5A059"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="66" cy="24" rx="4" ry="7" fill="#C5A059" opacity="0.8" transform="rotate(20 66 24)" />
      <ellipse cx="72" cy="16" rx="3.5" ry="6" fill="#C5A059" opacity="0.7" transform="rotate(15 72 16)" />
      <circle cx="50" cy="50" r="11" fill="#B79BC7" />
      <ellipse cx="46" cy="46" rx="3.5" ry="2.5" fill="#EDE3F1" opacity="0.8" transform="rotate(-30 46 46)" />
    </svg>
  );
}
