/** Validates that a value is not empty after trimming whitespace. */
export function validateRequired(value: string): boolean {
  return value.trim().length > 0;
}

/** Validates that a value is a properly formatted email address. */
export function validateEmail(value: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value.trim());
}
