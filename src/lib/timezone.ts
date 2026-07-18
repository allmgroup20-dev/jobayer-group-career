const DEFAULT_TIMEZONE = "Asia/Dhaka";

export function getSystemTimezone(): string {
  return DEFAULT_TIMEZONE;
}

export function getLocalTime(timezone?: string): Date {
  const tz = timezone || DEFAULT_TIMEZONE;
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const tzOffset = getTimezoneOffset(tz);
  return new Date(utcMs + tzOffset * 60000);
}

function getTimezoneOffset(tz: string): number {
  const offsets: Record<string, number> = {
    "Asia/Dhaka": 360,
    "Asia/Kolkata": 330,
    "Asia/Karachi": 300,
    "Asia/Kathmandu": 345,
    "Asia/Shanghai": 480,
    "Asia/Tokyo": 540,
    "Asia/Dubai": 240,
    "Asia/Bangkok": 420,
    "Asia/Singapore": 480,
    "Asia/Riyadh": 180,
    "Asia/Baghdad": 180,
    "Asia/Tehran": 210,
    "Asia/Yangon": 390,
    "America/New_York": -300,
    "America/Chicago": -360,
    "America/Denver": -420,
    "America/Los_Angeles": -480,
    "America/Toronto": -300,
    "America/Sao_Paulo": -180,
    "Europe/London": 60,
    "Europe/Berlin": 120,
    "Europe/Paris": 120,
    "Europe/Moscow": 180,
    "Europe/Istanbul": 180,
    "Australia/Sydney": 660,
    "Australia/Melbourne": 660,
    "Pacific/Auckland": 780,
    "Pacific/Fiji": 720,
    "Africa/Cairo": 120,
    "Africa/Lagos": 60,
    "Africa/Johannesburg": 120,
  };
  return offsets[tz] ?? 360;
}

export function formatLocalTime(date: Date | string, timezone?: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const tz = timezone || DEFAULT_TIMEZONE;
  try {
    return d.toLocaleString("en-US", { timeZone: tz, hour12: true, year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return d.toLocaleString();
  }
}

export function isScheduledTime(scheduleHour: number, timezone?: string): boolean {
  const tz = timezone || DEFAULT_TIMEZONE;
  const now = getLocalTime(tz);
  return now.getHours() === scheduleHour && now.getMinutes() < 5;
}

export const TIMEZONES = [
  { value: "Asia/Dhaka", label: "Asia/Dhaka (BST, UTC+6)", offset: "+6" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST, UTC+5:30)", offset: "+5:30" },
  { value: "Asia/Karachi", label: "Asia/Karachi (PKT, UTC+5)", offset: "+5" },
  { value: "Asia/Kathmandu", label: "Asia/Kathmandu (NPT, UTC+5:45)", offset: "+5:45" },
  { value: "Asia/Dubai", label: "Asia/Dubai (GST, UTC+4)", offset: "+4" },
  { value: "Asia/Riyadh", label: "Asia/Riyadh (AST, UTC+3)", offset: "+3" },
  { value: "Asia/Bangkok", label: "Asia/Bangkok (ICT, UTC+7)", offset: "+7" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST, UTC+8)", offset: "+8" },
  { value: "Asia/Singapore", label: "Asia/Singapore (SGT, UTC+8)", offset: "+8" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST, UTC+9)", offset: "+9" },
  { value: "Europe/London", label: "Europe/London (GMT/BST, UTC+0/+1)", offset: "0" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST, UTC+1/+2)", offset: "+1" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST, UTC+1/+2)", offset: "+1" },
  { value: "Europe/Moscow", label: "Europe/Moscow (MSK, UTC+3)", offset: "+3" },
  { value: "Europe/Istanbul", label: "Europe/Istanbul (TRT, UTC+3)", offset: "+3" },
  { value: "America/New_York", label: "America/New_York (EST/EDT, UTC-5/-4)", offset: "-5" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT, UTC-6/-5)", offset: "-6" },
  { value: "America/Denver", label: "America/Denver (MST/MDT, UTC-7/-6)", offset: "-7" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT, UTC-8/-7)", offset: "-8" },
  { value: "America/Sao_Paulo", label: "America/Sao_Paulo (BRT, UTC-3)", offset: "-3" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT, UTC+10/+11)", offset: "+10" },
  { value: "Pacific/Auckland", label: "Pacific/Auckland (NZST/NZDT, UTC+12/+13)", offset: "+12" },
  { value: "Africa/Cairo", label: "Africa/Cairo (EET, UTC+2)", offset: "+2" },
  { value: "Africa/Lagos", label: "Africa/Lagos (WAT, UTC+1)", offset: "+1" },
  { value: "Africa/Johannesburg", label: "Africa/Johannesburg (SAST, UTC+2)", offset: "+2" },
];
