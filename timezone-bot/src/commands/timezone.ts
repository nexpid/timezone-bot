import {
  ApplicationCommandOptionType,
  MessageFlags,
  APIApplicationCommandInteractionDataSubcommandOption,
  APIRole,
  PermissionFlagsBits,
} from "discord-api-types/v10";
import { Command, CommandContext, getCooldown, setCooldown } from ".";
import { getTokens, setUpdateState } from "../storage";
import { prettifyOffset } from "../util/timezones";
import { revokeAccessToken, setMetadata } from "../oauth2";
import { PermissionsBitField } from "../util/bitfield";
import { Env, parseURL } from "..";

new Command({
  name: "timezone",
  run: async (env: Env, ctx: CommandContext) => {
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

    const isMod = new PermissionsBitField(ctx.member.permissions).has(
      PermissionFlagsBits.ManageGuild,
      true
    );

    // TODO make this work perhaps
    const getLinkedRole = async (): Promise<APIRole | undefined> => undefined;

    if (subcommand.name === "info") {
      return {
        content: [
          "**Timezones** is _an open-source Discord bot which gives your members the ability to pin their timezone to their profile._\n",
          "💡 Don't know what to do? If this server has **Timezones** set up, click on the server name and select **Linked Roles** from the dropdown. If **Timezones** doesn't appear, contact a server moderator to run </timezone setup:0>!\n",
          '🔗 **[GitHub](https://github.com/nexpid/timezone-bot "Timezones GitHub")**',
        ].join("\n"),
        flags: MessageFlags.Ephemeral,
      };
    } else if (subcommand.name === "setup") {
      if (!isMod)
        return {
          content:
            "❌ You must have the **Manage Server** permission to run this command!",
          flags: MessageFlags.Ephemeral,
        };

      return {
        content: [
          "**Timezones** can be setup in 3 easy steps:",
          "1. Create a new role and call it whatever you want (it's recommended to include the word **`Timezone`** in some way)",
          "2. Go to the Links tab > Add requirement > select **Timezones**",
          "3. You're all done! Now head to your server's Linked Roles and you'll see timezones available",
        ].join("\n"),
        flags: MessageFlags.Ephemeral,
      };
    } else if (subcommand.name === "check") {
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
      const tokens = await getTokens(env, userId);
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
      const tokens = await getTokens(env, ctx.user.id);
      if (!tokens)
        return {
          content: `❌ You don't have a timezone set!`,
          flags: MessageFlags.Ephemeral,
        };

      const state = crypto.randomUUID();
      const url = new URL(
        `${parseURL(ctx.env.api_url)}/discord-oauth-callback`
      );
      url.searchParams.set("state", state);
      url.searchParams.set("update", "true");

      await setUpdateState(env, state, {
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
      const tokens = await getTokens(env, ctx.user.id);
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
