import { Command } from "../helpers/interfaces";

export const command: Command = {
  "name": "say",
  "description": "A say command",
  "run": (client, message) => {
    let clean = message.cleanContent.trim();
    clean = clean.split(" ").splice(1).join(" ");
    if (clean == "") throw new Error("Cannot send an empty message.");
    message.channel.send(clean);
  }
};