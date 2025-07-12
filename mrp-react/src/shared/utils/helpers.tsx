export function formatDate(input: string): string {
  const [d, M, y] = input.split("-").map(Number);
  const utcDate = new Date(Date.UTC(y, M - 1, d));
  return utcDate.toLocaleDateString("hr-HR", {
    day: "numeric",
    month: "narrow",
    year: "numeric",
    timeZone: "UTC",
  });
}
