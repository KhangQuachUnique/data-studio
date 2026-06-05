import crypto from "node:crypto";

export function generateId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID()}`;
}
