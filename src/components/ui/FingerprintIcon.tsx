interface Props { className?: string; size?: number }
export function FingerprintIcon({ className = "", size = 64 }: Props) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M50 10 C30 10 15 25 15 45 L15 70 C15 82 25 90 35 90 L65 90 C75 90 85 82 85 70 L85 45 C85 25 70 10 50 10Z" stroke="currentColor" strokeWidth="3" fill="none" strokeLinejoin="round" />
      <path d="M50 20 C38 20 28 30 28 42" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M72 42 C72 30 62 20 50 20" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M50 28 C41 28 34 35 34 44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M66 44 C66 35 59 28 50 28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M50 36 C45 36 41 40 41 45 C41 48 42 51 44 53" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M59 53 C61 51 62 48 62 45 C62 40 58 36 53 36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M47 60 C47 62 48 64 50 66" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M34 55 C30 60 28 68 30 74" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M46 50 C44 52 42 55 42 58" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M58 58 C58 55 56 52 54 50" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M70 74 C72 68 70 60 66 55" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M38 80 C42 84 48 86 54 85" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M62 85 C66 84 69 81 70 77" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
