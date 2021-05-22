import { Message } from "discord.js";
import { Command, Client } from "../../helpers/interfaces";

export const command: Command = {
  "name": "test",
  "description": "A test command",
  "run": (client: Client, message: Message) => {
    let clean = message.cleanContent.trim();
    clean = clean.split(" ").splice(1).join(" ");
    if (clean == "") throw new Error("Cannot send an empty message.");
    message.channel.send(clean);
  }
};