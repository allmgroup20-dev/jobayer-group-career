import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix = ""): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}${random}`.toUpperCase();
}

export function formatCurrency(amount: number | null | undefined, currency = "BDT", symbol = "৳"): string {
  const n = amount ?? 0;
  return `${symbol}${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getLevelName(level: number): string {
  if (level === 1) return "Direct";
  const suffixes = ["th", "st", "nd", "rd"];
  const suffix = level >= 11 && level <= 13 ? "th" : suffixes[level % 10] || "th";
  return `${level}${suffix} Level`;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, 4) + "****" + phone.slice(-2);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: "text-green-600 bg-green-50",
    pending: "text-yellow-600 bg-yellow-50",
    completed: "text-blue-600 bg-blue-50",
    cancelled: "text-red-600 bg-red-50",
    paid: "text-green-600 bg-green-50",
    processing: "text-blue-600 bg-blue-50",
    approved: "text-green-600 bg-green-50",
    rejected: "text-red-600 bg-red-50",
  };
  return colors[status?.toLowerCase()] || "text-gray-600 bg-gray-50";
}

export function getStatusBadge(status: string, lang: "bn" | "en" = "en"): string {
  const labels: Record<string, Record<"bn" | "en", string>> = {
    active: { bn: "সক্রিয়", en: "Active" },
    inactive: { bn: "নিষ্ক্রিয়", en: "Inactive" },
    pending: { bn: "বিচারাধীন", en: "Pending" },
    completed: { bn: "সম্পন্ন", en: "Completed" },
    cancelled: { bn: "বাতিল", en: "Cancelled" },
    paid: { bn: "পরিশোধিত", en: "Paid" },
    unpaid: { bn: "অপরিশোধিত", en: "Unpaid" },
    processing: { bn: "প্রক্রিয়াধীন", en: "Processing" },
    approved: { bn: "অনুমোদিত", en: "Approved" },
    rejected: { bn: "প্রত্যাখ্যাত", en: "Rejected" },
  };
  return labels[status?.toLowerCase()]?.[lang] || status;
}
