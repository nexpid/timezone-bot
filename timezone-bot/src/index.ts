import "./commands/timezone";

import apiInteraction from "./hooks/api-interaction";
import discordOauthCallback from "./hooks/discord-oauth-callback";
import linkedRole from "./hooks/linked-role";
import timezoneCallback from "./hooks/timezone-callback";
import updateCallback from "./hooks/update-callback";
import { redisClient, setRedisClient } from "./util/redis";

export interface Env {
  api_url: string;
  pages_url?: string;
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

export function parseURL(thing: string | URL) {
  return new URL(thing).origin;
}

export default {
  fetch: async (req: Request, env: Env) => {
    if (!redisClient) setRedisClient(env.redis_url, env.redis_token);

    const url = new URL(req.url);
    const path = url.pathname;

    // api routes/etc
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
      else
        return new Response("nuh uh", {
          status: 404,
          headers: { "content-type": "text/plain" },
        });
    }

    // website rendering
    if (env.pages_url) {
      return await fetch(`${parseURL(env.pages_url)}${path}`);
    }
  },
};
