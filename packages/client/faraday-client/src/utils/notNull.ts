// Helper filter function to let typescript know that there are no null values
export function notNull<T>(value: T | null | undefined): value is T {
  return value != null;
}