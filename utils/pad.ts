type PadOptions = {
  dir?: "left" | "right" | undefined;
  size?: number | null | undefined;
};

export type PadErrorType = PadHexErrorType | any;

export function pad<value extends any>(
  hexOrBytes: value,
  { dir, size = 32 }: PadOptions = {},
) {
  if (typeof hexOrBytes === "string") return padHex(hexOrBytes, { dir, size });
  return padBytes(hexOrBytes, { dir, size });
}

export type PadHexErrorType = any;

export function padHex(hex_: any, { dir, size = 32 }: PadOptions = {}) {
  if (size === null) return hex_;
  const hex = hex_.replace("0x", "");
  return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size * 2, "0")}`;
}

export function padBytes(bytes: any, { dir, size = 32 }: PadOptions = {}) {
  if (size === null) return bytes;

  const paddedBytes = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const padEnd = dir === "right";
    paddedBytes[padEnd ? i : size - i - 1] =
      bytes[padEnd ? i : bytes.length - i - 1];
  }
  return paddedBytes;
}
