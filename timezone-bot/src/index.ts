import "./commands/timezone";

import apiInteraction from "./hooks/api-interaction";
import discordOauthCallback from "./hooks/discord-oauth-callback";
import linkedRole from "./hooks/linked-role";
import notfound from "./hooks/notfound";
import timezoneCallback from "./hooks/timezone-callback";
import updateCallback from "./hooks/update-callback";
import { redisClient, setRedisClient } from "./util/redis";

export interface Env {
  api_url: string;
  cookie_secret: string;
  discord_client_id: string;
  discord_token: string;
  discord_public_key: string;
  discord_client_secret: string;
  redis_url: string;
  redis_token: string;
}

export class Redirect extends Response {
  constructor(url: string, init?: ResponseInit) {
    let headers = init?.headers ?? {};
    super(undefined, {
      status: 307,
      headers: {
        Location: url,
        ...headers,
      },
    });
  }
}

const StateThing: Map<string, string> = new Map();
export function getStateThing(): typeof StateThing {
  console.log(
    "requested get StateThing, entries: ",
    [...StateThing.keys()].length
  );
  return StateThing;
}

export default {
  fetch: async (req: Request, env: Env) => {
    if (!redisClient) setRedisClient(env.redis_url, env.redis_token);

    const url = new URL(req.url);
    const path = url.pathname;

    if (req.method === "GET") {
      if (path === "/linked-role") return await linkedRole(env);
      else if (path === "/discord-oauth-callback")
        return discordOauthCallback(req);
      else if (path === "/timezone-callback")
        return await timezoneCallback(req, env);
      else if (path === "/update-callback")
        return await updateCallback(req, env);
    } else if (req.method === "POST") {
      if (path === "/api/interaction") return await apiInteraction(req, env);
    }
    return notfound(path);
  },
};
