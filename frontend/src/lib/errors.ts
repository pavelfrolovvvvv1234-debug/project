export function formatClientError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (Array.isArray(e.formErrors) || e.fieldErrors) {
      const parts: string[] = [];
      if (Array.isArray(e.formErrors)) parts.push(...e.formErrors.map(String));
      if (e.fieldErrors && typeof e.fieldErrors === "object") {
        for (const [key, val] of Object.entries(e.fieldErrors as Record<string, string[]>)) {
          parts.push(`${key}: ${val.join(", ")}`);
        }
      }
      return parts.join("; ") || "Ошибка валидации";
    }
    if (typeof e.message === "string") return e.message;
  }
  return "Произошла ошибка";
}
