import { unsign } from "../util/cookiesigner";
import { parseCookies } from "../util/cookieparser";
import { getOAuthToken, getUserData } from "../oauth2";
import * as storage from "../storage";
import * as timezones from "../util/timezones";
import { setMetadata } from "../oauth2";
import { Env } from "..";

export const textType = {
  headers: {
    "Content-Type": "text/plain; charset=UTF-8",
  },
};

export default async (req: Request, env: Env) => {
  const url = new URL(req.url);
  const query = new URLSearchParams(url.search);
  const cookies = parseCookies(req.headers.get("cookie"));

  const code = query.get("code") as string;
  const dcState = query.get("state") as string;
  const timezone = query.get("timezone") as string;
  const countryFlag = (query.get("country") === "true") as boolean;
  if (!code || !dcState || !timezone || countryFlag === undefined)
    return new Response(
      "query.code, query.state, query.timezone or query.country is missing",
      {
        status: 400,
        ...textType,
      }
    );

  const tz = timezones
    .getList()
    .find((x) => x.toLowerCase() === timezone.toLowerCase());
  if (!tz)
    return new Response(`invalid timezone "${timezone}"`, {
      status: 400,
      ...textType,
    });
  const country = timezones.timezoneToCountry(tz);
  if (!country)
    return new Response(`country not found for timezone "${timezone}"`, {
      status: 400,
      ...textType,
    });

  const state = await unsign(cookies.get("state") ?? "", env.cookie_secret);
  if (!state)
    return new Response("state validation failed", {
      status: 403,
      ...textType,
    });

  let tokens;
  try {
    tokens = await getOAuthToken(env, code);
  } catch {
    return new Response("code has expired", {
      status: 400,
      ...textType,
    });
  }

  const user = await getUserData(tokens);
  const userId = user.user?.id;
  if (!userId)
    return new Response("user not found", {
      status: 400,
      ...textType,
    });

  const tzoffset = timezones.getOffset(tz);
  const continent = tz.split("/")[0];

  tokens.settings = {
    offset: tzoffset,
    timezone: tz,
    continent: continent,
    country,
    showcountry: countryFlag,
  };
  await storage.setTokens(userId, tokens);

  try {
    await setMetadata(
      env,
      userId,
      tokens,
      `UTC${timezones.prettifyOffset(tzoffset)} (${
        countryFlag && country ? `${country}, ${continent}` : continent
      })`
    );
  } catch (e) {
    console.error("error setting metadata:\n", e);
    return new Response("server error sorry", {
      status: 500,
      ...textType,
    });
  }

  return new Response("success, go back to discord now :)", {
    status: 200,
    ...textType,
  });
};
