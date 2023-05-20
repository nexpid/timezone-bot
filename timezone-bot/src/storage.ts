import { Snowflake } from "discord-api-types/v10";
import { redisClient } from "./util/redis";
import { MessageData } from "./commands";

export interface TokensType {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  settings?: {
    offset: number;
    timezone: string;
    continent: string;
    country?: string;
    showcountry: boolean;
  };
}

export async function getTokens(userId: Snowflake): Promise<TokensType | null> {
  if (!redisClient)
    throw new Error("tried to getTokens while redis is unavailable");

  return await redisClient.get<TokensType>(`dc-oauth:${userId}`);
}
export async function setTokens(
  userId: Snowflake,
  tokens: TokensType
): Promise<string | null> {
  if (!redisClient)
    throw new Error("tried to setTokens while redis is unavailable");

  return await redisClient.set(`dc-oauth:${userId}`, JSON.stringify(tokens));
}
export async function delTokens(userId: Snowflake): Promise<number> {
  if (!redisClient)
    throw new Error("tried to delTokens while redis is unavailable");

  return await redisClient.del(`dc-oauth:${userId}`);
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

export async function getUpdateState(
  state: string
): Promise<UpdateStates | null> {
  if (!redisClient)
    throw new Error("tried to getUpdateState while redis is unavailable");

  return await redisClient.get<UpdateStates>(`ustate:${state}`);
}
export async function setUpdateState(
  state: string,
  data: UpdateStates
): Promise<string | null> {
  if (!redisClient)
    throw new Error("tried to setUpdateState while redis is unavailable");

  return await redisClient.set(`ustate:${state}`, JSON.stringify(data), {
    pxat: Date.now() + 3 * 60_000,
  });
}
export async function delUpdateState(state: string): Promise<number> {
  if (!redisClient)
    throw new Error("tried to delUpdateState while redis is unavailable");

  return await redisClient.del(`ustate:${state}`);
}
