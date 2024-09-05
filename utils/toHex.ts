import { pad } from "./pad";

export function toHex(
  value: string | number | bigint | boolean,
  opts: any = {},
): any {
  if (typeof value === "number" || typeof value === "bigint")
    return numberToHex(value, opts);
}

export function numberToHex(value_: number | bigint, opts: any = {}): any {
  const { signed, size } = opts;

  const value = BigInt(value_);

  let maxValue: bigint | number | undefined;
  if (size) {
    if (signed) maxValue = (1n << (BigInt(size) * 8n - 1n)) - 1n;
    else maxValue = 2n ** (BigInt(size) * 8n) - 1n;
  } else if (typeof value_ === "number") {
    maxValue = BigInt(Number.MAX_SAFE_INTEGER);
  }

  const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;

  if ((maxValue && value > maxValue) || value < minValue) {
    const suffix = typeof value_ === "bigint" ? "n" : "";
  }

  const hex = `0x${(signed && value < 0
    ? (1n << BigInt(size * 8)) + BigInt(value)
    : value
  ).toString(16)}` as any;
  if (size) return pad(hex, { size });
  return hex;
}
