/** Robot mascot with headphones — used in chat launcher & avatars */
export default function BuddyAgentIcon({ size = 32, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="24" cy="26" r="14" fill="rgba(255,255,255,0.95)" />
      <rect x="11" y="12" width="26" height="18" rx="6" fill="rgba(255,255,255,0.95)" />
      <circle cx="18" cy="22" r="3" fill="#4f46e5" />
      <circle cx="30" cy="22" r="3" fill="#4f46e5" />
      <path
        d="M20 28h8c0 3-2 5-4 5s-4-2-4-5z"
        fill="#7c3aed"
      />
      <path
        d="M6 20c0-6 4-10 10-10"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M42 20c0-6-4-10-10-10"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="4" y="18" width="5" height="10" rx="2.5" fill="rgba(255,255,255,0.85)" />
      <rect x="39" y="18" width="5" height="10" rx="2.5" fill="rgba(255,255,255,0.85)" />
      <circle cx="24" cy="8" r="2" fill="#a78bfa" />
    </svg>
  );
}
