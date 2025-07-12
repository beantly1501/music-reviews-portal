export function formatDate(input: string): string {
  // expected date: "d-M-yyyy"
  const [d, M, y] = input.split("-").map(Number);

  // 2) build a UTC timestamp (month is zero‐based)
  const utcDate = new Date(Date.UTC(y, M - 1, d));
  // 3) format for hr-HR in UTC
  return utcDate.toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "narrow",
    year: "numeric",
    timeZone: "UTC",
  });
}
