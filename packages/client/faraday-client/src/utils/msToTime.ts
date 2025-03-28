export function msToTimeDivision(duration: number) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

  return { hours, minutes, seconds };
}

export function msToFormattedDuration(milliseconds: number) {
  const minutes = Math.floor(milliseconds / 60000); // 1 minute = 60000 row.duration_ms
  const seconds = Math.floor((milliseconds % 60000) / 1000); // Remaining seconds
  // Use padStart to ensure two digits for minutes and seconds
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}