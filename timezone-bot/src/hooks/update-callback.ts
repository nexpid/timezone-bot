import { textType } from "./timezone-callback";
import * as timezones from "../util/timezones";
import {
  delUpdateState,
  getTokens,
  getUpdateState,
  setTokens,
} from "../storage";
import { setMetadata } from "../oauth2";
import { Env } from "..";
import { REST } from "../util/rest";
import { Routes } from "discord-api-types/v10";

export default async (req: Request, env: Env) => {
  const rest = new REST();

  const url = new URL(req.url);
  const query = url.searchParams;

  const state = query.get("state") as string;
  const timezone = query.get("timezone") as string;
  const countryFlag = (query.get("country") === "true") as boolean;
  if (!state || !timezone || countryFlag === undefined)
    return new Response(
      "query.state, query.timezone or query.country is missing",
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

  const stat = await getUpdateState(env, state);
  if (!stat)
    return new Response("state validation failed", {
      status: 403,
      ...textType,
    });

  for (let x of stat.actions)
    if (x.type === "editinteraction")
      await rest.patch(
        Routes.webhookMessage(env.discord_client_id, x.data.token),
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bot ${env.discord_token}`,
          },
          body: x.data.message,
        }
      );
  await delUpdateState(env, state);

  const tokens = await getTokens(env, stat.userid);
  if (!tokens)
    return new Response("no saved tokens found", { status: 400, ...textType });

  const tzoffset = timezones.getOffset(tz);
  const continent = tz.split("/")[0];

  tokens.settings = {
    offset: tzoffset,
    timezone: tz,
    continent,
    country,
    showcountry: countryFlag,
  };
  await setTokens(env, stat.userid, tokens);

  try {
    await setMetadata(
      env,
      stat.userid,
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
