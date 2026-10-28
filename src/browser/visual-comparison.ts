// Shared by Vitest's screenshot comparator and the real-PNG mutation check.
export const visualPixelmatchOptions = {
  threshold: 0.1,
  allowedMismatchedPixelRatio: 0.002,
} as const;
