// Imports and definitions
const Discord = require("discord.js");
const handler = require("./handler.js");
const utils = require("./utils.js");
const debug = require("./debugger.js");
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
  utils.updateActivity(client, utils.getPrefixes());
});

client.on("error", (e) => debug.sendErr("Discord Error:", e));
client.on("warn", (e) => debug.sendWarn(e));
client.on("debug", (e) => debug.sendInfo(e, -1));

// Load fonts, db and login in to the Discord API
try {
  debug.setLevel(0); // Default debugger level

  // Setting debug log level
  [process.argv[2], process.argv[3]].map((arg) => {
    if (arg != null) {
      if (arg.toLowerCase().includes("level=")) {
        arg = arg.slice(6, arg.length);
        arg = parseInt(arg);
        debug.setLevel(Math.max(-1, Math.min(arg, 3)));
        debug.sendWarn("The given argument level requires a number!");
      }
    }
  });

  // Handling beta version
  let token = process.env.TOKEN;
  if (process.argv[2] != null && process.argv[2].includes("beta")) {
    token = process.env.BETA_TOKEN;
    utils.setProduction(false);
    debug.sendWarn("You are currently using the beta version!");
  }

  // Running bot
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

    debug.sendInfo(
      `Logging in (${utils.isProduction() ? "production" : "beta"})`,
      0
    );
    client
      .login(token)
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
