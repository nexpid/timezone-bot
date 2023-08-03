import { Snowflake } from "discord-api-types/v10";
import { MessageData } from "./commands";
import { Env } from ".";

export interface TokensType {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  settings: {
    offset: number;
    timezone: string;
    continent: string;
    country?: string;
    showcountry: boolean;
  } | null;
}

interface D1TokensType {
  userid: string;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  settings: string | null;
}

export async function getTokens(
  env: Env,
  userId: Snowflake
): Promise<TokensType | null> {
  const cmd = (await env.DB.prepare(`select * from oauth where userid=?1`)
    .bind(userId)
    .first()) as D1TokensType;
  if (!cmd) return null;

  return (
    cmd && {
      access_token: cmd.access_token,
      refresh_token: cmd.refresh_token,
      expires_at: cmd.expires_at,
      settings: cmd.settings && JSON.parse(cmd.settings),
    }
  );
}
export async function setTokens(
  env: Env,
  userId: Snowflake,
  tokens: TokensType
): Promise<boolean> {
  return (
    await env.DB.prepare(
      `insert or replace into oauth (userid, access_token, refresh_token, expires_at, settings) values (?1, ?2, ?3, ?4, ?5)`
    )
      .bind(
        userId,
        tokens.access_token,
        tokens.refresh_token,
        tokens.expires_at,
        JSON.stringify(tokens.settings)
      )
      .run()
  ).success;
}
export async function delTokens(env: Env, userId: Snowflake): Promise<boolean> {
  return (
    await env.DB.prepare(`delete from oauth where userid=?1`).bind(userId).run()
  ).success;
}

export type UpdateStateAction =
  | {
      type: "editinteraction";
      data: {
        token: string;
        message: MessageData;
      };
    }
  | {
      type: "ack";
      data: {};
    };
export type UpdateStates = {
  userid: string;
  actions: UpdateStateAction[];
};

interface D1UpdateStates {
  state: string;
  userid: string;
  actions: string;
}

export async function getUpdateState(
  env: Env,
  state: string
): Promise<UpdateStates | null> {
  const cmd = (await env.DB.prepare(`select * from ustate where state=?1`)
    .bind(state)
    .first()) as D1UpdateStates;
  if (!cmd) return null;

  return (
    cmd && {
      userid: cmd.userid,
      actions: JSON.parse(cmd.actions),
    }
  );
}
export async function setUpdateState(
  env: Env,
  state: string,
  data: UpdateStates
): Promise<boolean> {
  return (
    await env.DB.prepare(
      `insert or replace into ustate (state, userid, actions) values (?1, ?2, ?3)`
    )
      .bind(state, data.userid, JSON.stringify(data.actions))
      .run()
  ).success;
}
export async function delUpdateState(
  env: Env,
  state: string
): Promise<boolean> {
  return (
    await env.DB.prepare(`delete from ustate where state=?1`).bind(state).run()
  ).success;
}
