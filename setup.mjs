import fetch from "node-fetch";
import prompts from "prompts";
import { Routes } from "discord-api-types/v10";
import commands from "./assets/commands.mjs";

const main = async () => {
  const { token } = await prompts({
    name: "token",
    type: "password",
    message: "What's your bot's token?",
  });

  const api = "https://discord.com/api/v10";
  const headers = {
    authorization: `Bot ${token}`,
    "user-agent": "DiscordBot (https://discord.js.org)",
  };

  // validate token
  console.log("validating token...");
  let user = await fetch(api + Routes.user("@me"), {
    method: "GET",
    headers,
  });
  if (!user.ok) return console.log(`invalid token!`, await user.json());
  user = await user.json();

  // add commands
  console.log("adding commands...");
  const commandResponse = await Promise.all(
    commands.map((x) =>
      fetch(api + Routes.applicationCommands(user.id), {
        method: "POST",
        headers: {
          ...headers,
          "content-type": "application/json",
        },
        body: JSON.stringify(x),
      })
    )
  );
  if (!commandResponse.every((x) => x.ok))
    return console.log(
      "error while adding commands!",
      await Promise.all(
        commandResponse.filter((x) => !x.ok).map((x) => x.json())
      )
    );

  // register connection thing-y
  console.log("registering connection thingy...");
  const connectionMetadataResponse = await fetch(
    api + Routes.applicationRoleConnectionMetadata(user.id),
    {
      method: "PUT",
      headers: {
        ...headers,
        "content-type": "application/json",
      },
      body: "[]",
    }
  );
  if (!connectionMetadataResponse.ok)
    return console.log(
      "error while registering connection thingy!",
      await connectionMetadataResponse.json()
    );

  console.log("done!");
};

await main(); // SyntaxError: Illegal return statement ☝🤓
