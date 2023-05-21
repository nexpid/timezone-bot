import {
  ApplicationCommandOptionType,
  MessageFlags,
  APIApplicationCommandInteractionDataSubcommandOption,
  Routes,
  APIRole,
  PermissionFlagsBits,
} from "discord-api-types/v10";
import { Command, CommandContext, getCooldown, setCooldown } from ".";
import { getTokens, setUpdateState } from "../storage";
import { prettifyOffset } from "../util/timezones";
import { revokeAccessToken, setMetadata } from "../oauth2";
import { REST } from "../util/rest";
import { PermissionsBitField } from "../util/bitfield";
import { parseURL } from "..";

new Command({
  name: "timezone",
  run: async (ctx: CommandContext) => {
    const rest = new REST();

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

    async function getLinkedRole(): Promise<APIRole | undefined> {
      const roles: APIRole[] = await rest.get(Routes.guildRoles(ctx.guild), {
        headers: {
          Authorization: `Bot ${ctx.env.discord_token}`,
        },
      });
      return roles.find((x) =>
        x.name.toLowerCase().replace(/ +/g, "").includes("timezone")
      );
    }

    if (subcommand.name === "info") {
      const linkedRole = await getLinkedRole();

      return {
        content: `**Timezones** is _an open-source Discord bot which gives your members the ability to pin their timezone to their profile._\n\n> ${
          linkedRole
            ? `💡 To link your timezone, head over to **Linked Roles** and select **${linkedRole.name}**!`
            : `❌ This server doesn't have **Timezones** set up! ${
                isMod
                  ? "Run </timezone setup:0> to setup **Timezones**"
                  : "Contact a moderator to get this fixed"
              }.`
        }`,
        flags: MessageFlags.Ephemeral,
      };
    } else if (subcommand.name === "setup") {
      /*if (!isMod) return {
        content: `🔨 Missing \`**Manage Server**\` permission to run this command`,
        flags: MessageFlags.Ephemeral
      }

      const linkedRole = await getLinkedRole();
      const isForce =
        (subcommand.options?.find((x) => x.name === "force")
          ?.value as boolean) ?? false;

      if (linkedRole && !isForce) return {
        content: `❌ This server already has a role which may be linked to **Timezones**, <@&${linkedRole.id}>`,
        flags: MessageFlags.Ephemeral
      }

      const newRole = */

      return {
        content: `*hey there, you stumbled upon an unreleased command!*\n*if you need more info about Timezones, [read the GitHub page](https://github.com/Gabe616/timezone-bot#readme)*`,
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
        `${parseURL(ctx.env.api_url)}/discord-oauth-callback`
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
