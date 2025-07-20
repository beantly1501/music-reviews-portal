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

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // reader.result is like "data:<mime>;base64,AAAABBBB..."
      const base64 = (reader.result as string).split(",", 2)[1];
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
  });
