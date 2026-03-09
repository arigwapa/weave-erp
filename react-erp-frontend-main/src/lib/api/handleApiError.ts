// handleApiError.ts - turns HTTP error codes into user-friendly messages for toasts
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    const status = (err as any).status as number | undefined;

    if (status === 401) return "Session expired. Please log in again.";
    if (status === 403) return err.message || "Not authorized for this action.";
    if (status === 404) return "Record not found.";
    if (status === 409)
      return err.message || "Conflict: record is in use or already exists.";
    if (status === 400 || status === 422)
      return err.message || "Invalid data submitted.";

    return err.message || "An unexpected error occurred.";
  }
  return "An unexpected error occurred.";
}
