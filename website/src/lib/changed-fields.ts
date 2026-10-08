export function changedFields<T extends object>(original: T, next: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => original[key as keyof T] !== value),
  ) as Partial<T>
}
