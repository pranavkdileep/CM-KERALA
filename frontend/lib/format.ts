const zone = "Asia/Kolkata";

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: zone });
const dateTimeFmt = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: zone,
});

export const formatDate = (value: string | Date) => dateFmt.format(new Date(value));
export const formatDateTime = (value: string | Date) => dateTimeFmt.format(new Date(value)).replace(/\b(am|pm)\b/i, (m) => m.toLowerCase());

export function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function daysUntil(value: string | Date) {
  return Math.ceil((new Date(value).getTime() - Date.now()) / 86400000);
}
