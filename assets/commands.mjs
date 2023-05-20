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
        name: "remove",
        description: "Remove your current timezone",
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: "update",
        description: "Update your timezone",
        type: ApplicationCommandOptionType.Subcommand,
      },
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
    ],
  },
];
