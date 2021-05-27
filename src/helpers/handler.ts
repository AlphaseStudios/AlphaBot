import { promises as fsp } from "fs";
import fs from "fs";
import Discord from "discord.js";
import { getDevs, getPrefixes } from "./utils";
import { Client, Command } from "./interfaces";

/**
 * Register all commands events sub+direct
 * -
 * Returns a promise (error, void)
  */
export function registerAll (client: Client, path: string, prepend = "src", ext = ".ts"): Promise<Error | void> {
  return new Promise((resolve, reject) => {
    register(client, path, prepend, ext).then(() => {
      registerSub(client, path, prepend).then(() => {
        resolve();
      }).catch((err) => {reject(err);});
    }).catch((err) => {reject(err);});
  });
}

/**
 * Register all commands/events in sub folders
 * -
 * Returns a promise (error, void)
 */
export function registerSub (client: Client, path: string, prepend = "src"): Promise<Error | void> {
  return new Promise((resolve, reject) => {
    fsp.readdir(`./${prepend}/${path}`).then((files: Array<string>) => {
      files.map((folder) => {
        if (fs.lstatSync(`./${prepend}/${path}/${folder}`).isDirectory()) {
          console.log(`./${prepend}/${path}/${folder} isDirectory`);
          register(client, `${path}/${folder}`, prepend);
        }
      });
      resolve();
    }).catch((err) => { reject(err); });
  });
}

/**
 * Register all commands/events in a static folder (depth = 1)
 * -
 * Returns a promise (error, void)
 */
export function register (client: Client, path: string, prepend = "src", ext = ".ts"): Promise<Error | void> {
  console.log(path);
  return new Promise((resolve, reject) => {
    fsp.readdir(`./${prepend}/${path}`).then((files: Array<string>) => {
      files.map((file) => {
        console.log(file);
        if (file.endsWith(ext)) {
          const cmd = import(`../${path}/${file}`);
          cmd.then((obj) => {
            client.commands.set(obj.command.name, obj.command);
            console.log(obj.command.name);
          }).catch((err: Error) => {
            reject(err);
          });
        }
      });
      resolve();
    }).catch((err: Error) => {
      reject(err);
    });
  });
}

/**
 * Handle the command
 * -
 * Handle a message, run the command
 */
export function handle (client: Client, message: Discord.Message): void {
  for (const prefix of getPrefixes()) {
    if (message.content.startsWith(prefix)) {
      const args = message.content.substring(prefix.length).split(/ +/);
      const cmd = client.commands.find((x) => {
        if (x.aliases == null) x.aliases = [];
        return x.name == args[0].toLowerCase() || x.aliases.includes(args[0].toLowerCase());
      });

      // Run command if not null
      if (!cmd) return;
      if (checkCommand(client, cmd, message)) {
        try {
          cmd.run(client, message, args);
        } catch (err) {
          message.channel.send(`An error occurred in command ${cmd.name}.\n\`\`\`\n${err.stack}\n\`\`\``);
        }
      }
    }
  }
}

function checkCommand (client: Client, cmd: Command, message: Discord.Message): boolean {
  if (message.author.bot) return false;
  if (cmd.guildOnly && message.channel.type == "dm") {
    message.channel.send("This command does not support direct messaging.");
    return false;
  }
  if (cmd.devOnly && !getDevs().includes(message.author.id)) return false;
  return true;
}
