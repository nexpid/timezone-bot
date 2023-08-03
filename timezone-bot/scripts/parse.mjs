import fs from "fs";
import fetch from "node-fetch";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const res = await (
  await fetch(
    "https://raw.githubusercontent.com/moment/moment-timezone/develop/data/packed/latest.json"
  )
).json();

const obj = {};
const links = res.links.map((x) => x.split("|"));
for (let x of res.countries) {
  const cat = x.split("|");
  const ct = cat[0],
    tzs = cat[1].split(" ");

  for (const tz of tzs) {
    const link = links.find((z) => z.includes(tz));
    if (link) for (const l of link) if (!tzs.includes(l)) tzs.push(l);
  }

  obj[ct] = tzs;
}

// hotfix
obj.CZ = ["Europe/Prague"];
obj.SK = ["Europe/Bratislava"];

console.log("done");
fs.writeFileSync(
  join(__dirname, "../src/util/timezones.parsed.ts"),
  `// from https://github.com/moment/moment-timezone/blob/develop/data/packed/latest.json\n// last fetched at ${new Date().toISOString()}, version '${
    res.version
  }'\n\nexport const countryTimezoneMap = {${Object.entries(obj).map(
    ([x, y]) => `${x}:[${y.map((z) => `"${z}"`).join(",")}]`
  )}}`
);
