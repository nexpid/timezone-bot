import {
  APIInteractionResponseChannelMessageWithSource,
  APIInteractionResponsePong,
  APIPingInteraction,
  InteractionResponseType,
  InteractionType,
  APIChatInputApplicationCommandInteraction,
} from "discord-api-types/v10";
import { Env } from "..";
import { verify } from "../util/verify";
import { Commands, MessageData, makeContext, parseResponse } from "../commands";

export function rep(
  data:
    | APIInteractionResponseChannelMessageWithSource
    | APIInteractionResponsePong
) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default async (req: Request, env: Env) => {
  const signatureEd = req.headers.get("X-Signature-Ed25519") as string;
  const signatureTs = req.headers.get("X-Signature-Timestamp") as string;

  if (!signatureEd || !signatureTs)
    return new Response("no Signature headers", { status: 401 });

  const verified = await verify(
    signatureEd,
    signatureTs,
    await req.clone().text(),
    env
  );
  if (!verified) return new Response("signature failed", { status: 401 });

  const message = (await req.json()) as
    | APIPingInteraction
    | APIChatInputApplicationCommandInteraction;

  if (message.type == InteractionType.Ping) {
    return rep({
      type: InteractionResponseType.Pong,
    });
  } else if (message.type === InteractionType.ApplicationCommand) {
    const ctx = makeContext(message, env);
    const command = Commands.find(
      (x) => x.name.toLowerCase() === ctx.command.name
    );
    if (!command) return new Response("command not found", { status: 404 });

    try {
      return rep(parseResponse(await command.run(ctx)));
    } catch (e: any) {
      console.error(e.stack);
      return rep({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `❌ \`${e.toString()}\``,
        } as MessageData,
      });
    }
  }
};
