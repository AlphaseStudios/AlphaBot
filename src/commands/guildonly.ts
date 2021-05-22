import { Command } from "../helpers/interfaces";

export const command: Command = {
  "name": "guildonly",
  "description": "A guildOnly command",
  "guildOnly": true,
  "run": (client, message) => {
    message.channel.send(`Morning, ${message.author.username}`);
  }
};