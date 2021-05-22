import Discord from "discord.js";
import { Client } from "./helpers/interfaces";
import { handle, registerAll } from "./helpers/handler";
import * as db from "./helpers/database";
import { config as dotenvconfig } from "dotenv";
dotenvconfig();

const client = new Discord.Client as Client;
client.commands = new Discord.Collection();
registerAll(client, "commands").then(() => {
  initClient();
}).catch((err) => { throw new Error(err); });

client.on("message", (message: Discord.Message) => { handle(client, message); });

function initClient () {
  db.init().then(() => {
    console.log("db init");
    console.log(db.getDB());

    client.login(process.env.BOT_TOKEN_BETA);
  }).catch((err) => { throw new Error(err); });
}