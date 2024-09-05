export type ConcatErrorType = any | ConcatHexErrorType | any;

export function concat<value extends any | any>(values: readonly value[]) {
  if (typeof values[0] === "string") return concatHex(values as readonly any[]);
  return concatBytes(values as readonly any[]);
}

export function concatBytes(values: readonly any[]): any {
  let length = 0;
  for (const arr of values) {
    length += arr.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const arr of values) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

export type ConcatHexErrorType = any;

export function concatHex(values: readonly any[]): any {
  return `0x${(values as any[]).reduce(
    (acc, x) => acc + x.replace("0x", ""),
    "",
  )}`;
}
