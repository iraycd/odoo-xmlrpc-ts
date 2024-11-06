// src/utils.ts
export function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null) {
    if ('faultString' in error) {
      return String((error as { faultString: unknown }).faultString);
    }
    if ('message' in error) {
      return String((error as { message: unknown }).message);
    }
  }
  return String(error);
}
