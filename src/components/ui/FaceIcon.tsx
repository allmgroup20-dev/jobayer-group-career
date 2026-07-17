interface Props { className?: string; size?: number }
export function FaceIcon({ className = "", size = 64 }: Props) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="48" r="30" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <circle cx="38" cy="43" r="3.5" fill="currentColor" />
      <circle cx="62" cy="43" r="3.5" fill="currentColor" />
      <path d="M50 46 L50 54" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M37 57 C42 65 58 65 63 57" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M12 28 L22 28 M88 28 L78 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 38 L16 38 M88 38 L84 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 60 L16 60 M88 60 L84 60" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 70 L22 70 M88 70 L78 70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
