import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { ProblemDetails } from "./types";

/**
 * Turns whatever an API call failed with into messages fit to show an operator.
 *
 * Validation failures carry the API's own wording, which is written for staff
 * and is shown as-is. Everything else — a network drop, a 500, a stack trace —
 * is replaced by a plain sentence, so a raw error never reaches the floor
 * (spec §35).
 */

const UNREACHABLE = "Could not reach the server. Check your connection and try again.";
const UNEXPECTED = "Something went wrong while saving. Please try again.";

function isProblemDetails(data: unknown): data is ProblemDetails {
  return typeof data === "object" && data !== null;
}

/** Validation errors arrive either as a flat list (the API's handler) or as
 *  ASP.NET's per-field dictionary (model binding failures). */
function flattenErrors(errors: ProblemDetails["errors"]): string[] {
  if (!errors) return [];
  if (Array.isArray(errors)) return errors;
  return Object.values(errors).flat();
}

export function getApiErrorMessages(
  error: FetchBaseQueryError | SerializedError | undefined,
): string[] {
  if (!error) return [];

  /* SerializedError: thrown inside the client rather than returned by the API */
  if (!("status" in error)) return [UNEXPECTED];

  if (error.status === "FETCH_ERROR" || error.status === "TIMEOUT_ERROR") {
    return [UNREACHABLE];
  }

  if (typeof error.status === "number" && error.status < 500 && isProblemDetails(error.data)) {
    const messages = flattenErrors(error.data.errors);
    if (messages.length > 0) return messages;
    if (error.data.detail) return [error.data.detail];
  }

  return [UNEXPECTED];
}
