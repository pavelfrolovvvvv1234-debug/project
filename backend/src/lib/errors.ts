import type { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map((i) => `${i.path.join(".") || "поле"}: ${i.message}`).join("; ");
}

export function formatApiError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    if ("formErrors" in error || "fieldErrors" in error) {
      const e = error as { formErrors?: string[]; fieldErrors?: Record<string, string[]> };
      const parts = [...(e.formErrors ?? [])];
      for (const [key, msgs] of Object.entries(e.fieldErrors ?? {})) {
        parts.push(`${key}: ${msgs.join(", ")}`);
      }
      return parts.join("; ") || "Ошибка валидации";
    }
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return (error as { message: string }).message;
    }
  }
  return "Произошла ошибка";
}
