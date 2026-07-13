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

export function formatCurrency(amount: number, currency = "BDT", symbol = "৳"): string {
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

export function getStatusBadge(status: string): string {
  const labels: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
    paid: "Paid",
    unpaid: "Unpaid",
    processing: "Processing",
    approved: "Approved",
    rejected: "Rejected",
  };
  return labels[status?.toLowerCase()] || status;
}
