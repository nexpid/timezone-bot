import {
  ApplicationCommandOptionType,
  MessageFlags,
  APIApplicationCommandInteractionDataSubcommandOption,
} from "discord-api-types/v10";
import { Command, CommandContext, getCooldown, setCooldown } from ".";
import { getTokens, setUpdateState } from "../storage";
import { prettifyOffset } from "../util/timezones";
import { revokeAccessToken, setMetadata } from "../oauth2";

new Command({
  name: "timezone",
  run: async (ctx: CommandContext) => {
    const subcommand = ctx.arguments.find(
      (x) => x.type === ApplicationCommandOptionType.Subcommand
    ) as APIApplicationCommandInteractionDataSubcommandOption;
    if (!subcommand) return;

    const cool = getCooldown(ctx.command.name, ctx.user.id);
    if (cool)
      return {
        content: `⌚ You're on cooldown for **\`${
          Math.floor(cool / 100) / 10
        }s\`**`,
        flags: MessageFlags.Ephemeral,
      };
    setCooldown(ctx.command.name, ctx.user.id, 1.5);

    if (subcommand.name === "check") {
      const userId =
        (subcommand.options?.find((x) => x.name === "user")?.value as string) ??
        ctx.user.id;
      const member =
        userId === ctx.user.id ? ctx.member : ctx.resolved?.members?.[userId];
      const user =
        userId === ctx.user.id ? ctx.user : ctx.resolved?.users?.[userId];
      if (!member || !user)
        return {
          content: `❌ Discord API error! (member/user not in ctx.resolved)`,
          flags: MessageFlags.Ephemeral,
        };

      const display = member.nick ?? user.username;
      const tokens = await getTokens(userId);
      if (!tokens || !tokens.settings)
        return {
          content: `❌ ${
            userId === ctx.user.id ? "You don't" : `**${display}** doesn't`
          } have a timezone set!`,
          flags: MessageFlags.Ephemeral,
        };

      return {
        content: `${
          userId === ctx.user.id ? "You're" : `**${display}** is`
        } on **UTC${prettifyOffset(tokens.settings.offset)}** (${
          tokens.settings.showcountry
            ? `${tokens.settings.country}, ${tokens.settings.continent}`
            : tokens.settings.continent
        })`,
        flags: MessageFlags.Ephemeral,
      };
    } else if (subcommand.name === "update") {
      const tokens = await getTokens(ctx.user.id);
      if (!tokens)
        return {
          content: `❌ You don't have a timezone set!`,
          flags: MessageFlags.Ephemeral,
        };

      const state = crypto.randomUUID();
      const url = new URL(
        `${
          ctx.env.api_url.endsWith("/")
            ? ctx.env.api_url.slice(0, -1)
            : ctx.env.api_url
        }/discord-oauth-callback`
      );
      url.searchParams.set("state", state);
      url.searchParams.set("update", "true");

      await setUpdateState(state, {
        userid: ctx.user.id,
        actions: [
          {
            type: "editinteraction",
            data: {
              token: ctx.webhook.token,
              message: {
                content: "✅ Updated your timezone!",
              },
            },
          },
        ],
      });

      return {
        content: `⌚ Use [**this link**](<${url.toString()}>) to update your timezone. (link expires <t:${Math.floor(
          (Date.now() + 3 * 60_000) / 1000
        )}:R>)`,
        flags: MessageFlags.Ephemeral,
      };
    } else if (subcommand.name === "remove") {
      const tokens = await getTokens(ctx.user.id);
      if (!tokens)
        return {
          content: "❌ You don't have a timezone set!",
          flags: MessageFlags.Ephemeral,
        };

      await setMetadata(ctx.env, ctx.user.id, tokens);
      await revokeAccessToken(ctx.env, ctx.user.id, tokens);

      return {
        content: "✅ Removed your timezone data!",
        flags: MessageFlags.Ephemeral,
      };
    } else return;
  },
});
