import { countryTimezoneMap } from "./timezones.parsed";

export function getList(): string[] {
  const list: string[] = [];
  for (const x of Object.values(countryTimezoneMap))
    for (const y of x) list.push(y);

  return list;
}

export function timezoneToCountry(tz: string): string | undefined {
  for (const [x, y] of Object.entries(countryTimezoneMap)) {
    if (y.some((z) => z.toLowerCase() === tz.toLowerCase())) return x;
  }
}

export function getOffset(tz: string): number {
  const now = new Date();
  const tzS = now.toLocaleString("en-US", { timeZone: tz });
  const utcS = now.toLocaleString("en-US", { timeZone: "GMT+0" });

  return (Date.parse(tzS) - Date.parse(utcS)) / 60000;
}

export function prettifyOffset(off: number): string {
  const hrs = Math.abs(off) / 60;
  const mins = Math.abs(off) % 60;
  return `${off < 0 ? "-" : "+"}${hrs}:${mins.toString().padStart(2, "0")}`;
}
