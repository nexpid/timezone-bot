import {
  Routes,
  Snowflake,
  RESTPostOAuth2AccessTokenResult,
  RESTGetAPIOAuth2CurrentAuthorizationResult,
  RESTGetAPICurrentUserApplicationRoleConnectionResult,
} from "discord-api-types/v10";
import { REST } from "./util/rest";
import { Env, parseURL } from ".";
import { delTokens, setTokens, TokensType } from "./storage";

const rest = new REST();

export function getOAuthUrl(env: Env): { state: string; url: string } {
  const state = crypto.randomUUID();

  const url = new URL("https://discord.com/api/oauth2/authorize");
  url.searchParams.set("client_id", env.discord_client_id);
  url.searchParams.set(
    "redirect_uri",
    `${parseURL(env.api_url)}/discord-oauth-callback`
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("state", state);
  url.searchParams.set("scope", "role_connections.write identify");
  url.searchParams.set("prompt", "consent");

  return { state, url: url.toString() };
}

export async function getOAuthToken(
  env: Env,
  code: string
): Promise<TokensType> {
  const data = (await rest.post(Routes.oauth2TokenExchange(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.discord_client_id,
      client_secret: env.discord_client_secret,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${parseURL(env.api_url)}/discord-oauth-callback`,
    }),
  })) as RESTPostOAuth2AccessTokenResult;

  return {
    access_token: data.access_token as string,
    refresh_token: data.refresh_token as string,
    expires_at: (Date.now() + data.expires_in * 1000) as number,
  };
}

export async function getAccessToken(
  env: Env,
  userId: Snowflake,
  tokens: TokensType
) {
  if (Date.now() > tokens.expires_at) {
    const body = (await rest.post(Routes.oauth2TokenExchange(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.discord_client_id,
        client_secret: env.discord_client_secret,
        grant_type: "refresh_token",
        refresh_token: tokens.refresh_token,
      }),
    })) as RESTPostOAuth2AccessTokenResult;

    tokens.access_token = body.access_token;
    tokens.expires_at = Date.now() + body.expires_in * 1000;
    await setTokens(userId, tokens);
    return body.access_token;
  } else return tokens.access_token;
}
export async function revokeAccessToken(
  env: Env,
  userId: Snowflake,
  tokens: TokensType
) {
  await rest.post(Routes.oauth2TokenRevocation(), {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.discord_client_id,
      client_secret: env.discord_client_secret,
      token: tokens.refresh_token,
      token_type_hint: "refresh_token",
    }),
  });

  await delTokens(userId);
}

export async function getUserData(
  tokens: TokensType
): Promise<RESTGetAPIOAuth2CurrentAuthorizationResult> {
  return (await rest.get(Routes.oauth2CurrentAuthorization(), {
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
    },
  })) as RESTGetAPIOAuth2CurrentAuthorizationResult;
}

export async function setMetadata(
  env: Env,
  userId: string,
  tokens: TokensType,
  display?: string
): Promise<RESTGetAPICurrentUserApplicationRoleConnectionResult> {
  const accessToken = await getAccessToken(env, userId, tokens);
  return (await rest.put(
    Routes.userApplicationRoleConnection(env.discord_client_id),
    {
      body: display
        ? {
            platform_name: `Timezone`,
            platform_username: display,
          }
        : {},
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  )) as RESTGetAPICurrentUserApplicationRoleConnectionResult;
}
export async function getMetadata(
  env: Env,
  userId: string,
  tokens: TokensType
): Promise<RESTGetAPICurrentUserApplicationRoleConnectionResult> {
  const accessToken = await getAccessToken(env, userId, tokens);
  return (await rest.get(
    Routes.userApplicationRoleConnection(env.discord_client_id),
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  )) as RESTGetAPICurrentUserApplicationRoleConnectionResult;
}
