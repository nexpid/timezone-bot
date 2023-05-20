// COPIED FROM https://gist.github.com/devsnek/77275f6e3f810a9545440931ed314dc1
import { Env } from "..";

function hex2bin(hex: string) {
  const buf = new Uint8Array(Math.ceil(hex.length / 2));
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return buf;
}

const encoder = new TextEncoder();

export async function verify(
  signEd: string,
  signTs: string,
  signBody: string,
  env: Env
) {
  const subtle = await crypto.subtle.importKey(
    "raw",
    hex2bin(env.discord_public_key),
    {
      name: "NODE-ED25519",
      namedCurve: "NODE-ED25519",
    },
    true,
    ["verify"]
  );

  const signature = hex2bin(signEd);

  return await crypto.subtle.verify(
    "NODE-ED25519",
    subtle,
    signature,
    encoder.encode(signTs + signBody)
  );
}
