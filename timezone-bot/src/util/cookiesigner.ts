const arraybuffString = (buf: ArrayBuffer) => {
  let s = "";
  const bytes = new Uint8Array(buf);

  for (let i = 0; i < buf.byteLength; i++) {
    s += String.fromCharCode(bytes[i]);
  }

  return s;
};

const encrypt = async (val: string, secret: string): Promise<string> => {
  const vale = new TextEncoder().encode(val);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, vale);
  return btoa(arraybuffString(signature)).replace(/=/g, "");
};

export async function sign(val: string, secret: string): Promise<string> {
  return `${val}.${await encrypt(val, secret)}`;
}
export async function unsign(
  val: string,
  secret: string
): Promise<string | false> {
  const value = val.slice(0, val.lastIndexOf("."));
  const key = new TextEncoder().encode(val.slice(val.lastIndexOf(".") + 1));

  const expect = new TextEncoder().encode(await encrypt(val, secret));
  if (expect.length === key.length) return value;

  return false;
}
