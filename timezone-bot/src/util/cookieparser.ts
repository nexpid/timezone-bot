export function parseCookies(
  header: string | null | undefined
): Map<string, string> {
  const map = new Map();

  for (const x of (header ?? "").split("; ")) {
    const key = x.slice(0, x.indexOf("="));
    const val = x.slice(x.indexOf("=") + 1);
    map.set(key, val);
  }

  return map;
}
