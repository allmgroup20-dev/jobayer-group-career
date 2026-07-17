"use client";

export function StarDisplay({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "text-lg" : size === "md" ? "text-base" : "text-sm";
  return (
    <span className={`${cls} text-yellow-500`}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition-all hover:scale-110 ${star <= value ? "text-yellow-500" : "text-gray-300"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
