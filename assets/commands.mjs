import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
} from "discord-api-types/v10";

export default [
  {
    name: "timezone",
    type: ApplicationCommandType.ChatInput,
    description: "Manage timezones",
    options: [
      {
        name: "info",
        description: "Get more information about Timezones",
        type: ApplicationCommandOptionType.Subcommand,
      },
      /*{
        name: "setup",
        description: "🔨 Setup Timezones for this server",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "force",
            description:
              "Force Timezones to create a new role even if one exists",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
          },
        ],
      },*/
      {
        name: "check",
        description: "Check someone's timezone",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: "user",
            description: "The user",
            type: ApplicationCommandOptionType.User,
            required: false,
          },
        ],
      },
      {
        name: "update",
        description: "Update your timezone",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "remove",
        description: "Remove your current timezone",
        type: ApplicationCommandOptionType.Subcommand,
      },
    ],
  },
];
