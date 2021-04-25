// Imports and definitions
const Discord = require("discord.js");
const handler = require("./handler.js");
const utils = require("./utils.js");
const debug = require("./debugger.js");
var config = require("./resources/config.json");
const api = require("./api");
require("dotenv").config();

const client = new Discord.Client({
  partials: ["REACTION", "CHANNEL", "MESSAGE"],
  messageCacheLifetime: 60,
  messageSweepInterval: 20,
});
client.commands = new Discord.Collection();

// CommandHandler
client.on("message", (message) => {
  handler.handleCommand(client, message);
});

// Ready event
client.on("ready", () => {
  debug.sendInfo("Fired 'ready' event", 0);

  debug.sendInfo(
    `Successfully logged in as ${client.user.tag} at ${utils.curTime()}`
  );
  debug.timeEnd("Started in");
  client.user.setActivity(`Starting up...`, { type: "WATCHING" });

  debug.sendInfo("Updated bot activity", 0);
  utils.discordLoggedIn();
  utils.updateActivity(client, config.prefixes);
});

client.on("error", (e) => debug.sendErr("Discord Error:", e));
client.on("warn", (e) => debug.sendWarn(e));
client.on("debug", (e) => debug.sendInfo(e, -1));

// Load fonts, db and login in to the Discord API
try {
  debug.setLevel(0); // Default debugger level

  utils.errorListeners(client);
  utils.loadFonts();
  debug.time("Initialized firebase in");
  utils.initFirebase().then(() => {
    debug.timeEnd("Initialized firebase in");
    debug.time("Started in");

    debug.sendInfo("Registering commands", 0);
    handler.registerCommands(client);

    debug.sendInfo("Registering events", 0);
    handler.registerEvents(client);

    debug.sendInfo("Logging in", 0);
    client
      .login(process.env.TOKEN)
      .then(() => {
        debug.sendInfo("Initializing API");
        api.init();
      })
      .catch((err) => {
        utils.discordException(client, err);
      });
  });
} catch (err) {
  debug.sendErr(`Something went wrong trying to log in.`, err, true);
}