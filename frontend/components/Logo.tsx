export default function Logo({ size = 36, mono = false }: { size?: number; mono?: boolean }) {
  const ring = mono ? "#1C1B17" : "#125E58";
  const arc = mono ? "#1C1B17" : "#C0741C";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-label="Jornada">
      <circle cx="24" cy="24" r="16.5" fill="none" stroke={ring} strokeWidth="3" />
      <path d="M24 7.5 A16.5 16.5 0 0 1 40 20.3" fill="none" stroke={arc} strokeWidth="5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="24" y2="13" stroke={ring} strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.7" fill={ring} />
    </svg>
  );
}
