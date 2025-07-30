export function toId(buffer?: Uint8Array | { buffer?: Uint8Array }): string {
  const rawBuffer =
    buffer instanceof Uint8Array
      ? buffer
      : typeof buffer === "object" && buffer?.buffer instanceof Uint8Array
      ? buffer.buffer
      : undefined;

  if (!rawBuffer || rawBuffer.length === 0) return "0";

  const hex = Array.from(rawBuffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  try {
    return BigInt("0x" + hex).toString(10);
  } catch {
    return "0";
  }
}
