import {
  APIInteractionResponseCallbackData,
  APIApplicationCommandInteractionDataOption,
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  ApplicationCommandType,
  InteractionResponseType,
  MessageFlags,
  APIUser,
  APIInteractionGuildMember,
  APIChannel,
  APIInteractionDataResolved,
} from "discord-api-types/v10";
import { Env } from "..";

export const Commands: Command[] = [];
export const CmdCooldowns: { [key: string]: { [key: string]: number } } = {};

export interface CommandOptions {
  name: string;
  run: (
    ctx: CommandContext
  ) => Promise<ParsableResponse | undefined> | (ParsableResponse | undefined);
}
export interface CommandContext {
  command: {
    id: string;
    name: string;
    type: ApplicationCommandType;
  };
  webhook: {
    token: string;
  };
  user: APIUser;
  member: APIInteractionGuildMember;
  channel: Partial<APIChannel> & Pick<APIChannel, "id" | "type">;
  guild: string;
  resolved?: APIInteractionDataResolved;

  arguments: APIApplicationCommandInteractionDataOption[];
  env: Env;
}

export function makeContext(
  data: APIChatInputApplicationCommandInteraction,
  env: Env
): CommandContext {
  const user = data.user ?? data.member?.user;
  if (!user || !data.member) throw new Error("user not available");
  if (!data.guild_id) throw new Error("guild not available");

  return {
    command: {
      id: data.data.id,
      name: data.data.name,
      type: data.data.type,
    },
    webhook: {
      token: data.token,
    },
    user,
    member: data.member,
    channel: data.channel,
    guild: data.guild_id,
    resolved: data.data.resolved,

    arguments: data.data.options ?? [],
    env,
  };
}

export type ParsableResponse =
  | APIInteractionResponseChannelMessageWithSource
  | MessageData
  | string;

export type APIResponseThingy =
  APIInteractionResponseChannelMessageWithSource & {
    cache: number;
  };

export function parseResponse(message?: ParsableResponse): APIResponseThingy {
  let data: APIResponseThingy = {
    data: {},
    type: InteractionResponseType.ChannelMessageWithSource,
    cache: Math.floor(Math.random() * 1000000000),
  };

  if (message) {
    if (typeof message === "object") {
      if ("type" in message) data.type = message.type;
      if ("data" in message) data.data = message.data;
      else if (!("type" in message) && !("data" in message))
        data.data = message;
    } else if (typeof message === "string") {
      data.data.content = message;
    }
  } else {
    data.data.content =
      "https://cdn.discordapp.com/attachments/983040961087164478/1108773615085813801/16844226281029786.mp4";
    data.data.flags = MessageFlags.Ephemeral;
  }

  return data;
}

export type MessageData = APIInteractionResponseCallbackData;

export class Command {
  name: string;
  run: (
    ctx: CommandContext
  ) => Promise<ParsableResponse | undefined> | (ParsableResponse | undefined);

  constructor(opt: CommandOptions) {
    this.name = opt.name;
    this.run = opt.run;

    Commands.push(this);
    CmdCooldowns[this.name] = {};
  }
}

export function getCooldown(command: string, user: string): number | undefined {
  const cld = CmdCooldowns[command]?.[user];
  if (!cld) return;
  if (Date.now() > cld) {
    delete CmdCooldowns[command]?.[user];
    return;
  }

  return cld - Date.now();
}
export function setCooldown(command: string, user: string, time: number): void {
  if (!CmdCooldowns[command]) CmdCooldowns[command] = {};
  CmdCooldowns[command][user] = Date.now() + time * 1000;
}
