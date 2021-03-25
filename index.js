// Imports and definitions
const Discord = require('discord.js');
const handler = require('./handler.js');
const utils = require('./utils.js');
var config = require('./resources/config.json');
const api = require('./api');
require('dotenv').config()

const client = new Discord.Client({ partials: ['REACTION', 'CHANNEL', 'MESSAGE'], messageCacheLifetime: 60, messageSweepInterval: 20 });
client.commands = new Discord.Collection();

// CommandHandler
var nwordRegex = new RegExp(config.nwordRegex, "gi");
client.on('message', message => {
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
    // N-Word Detection
    if (message.content.match(nwordRegex)) { //imma push the fix to git
        switch (global.Servers[message.guild.id].nword) {
            case "1":
                message.delete();
                message.channel.send("You can't say the n-word on this server!")
                break;
            case "2":
                if (message.member.bannable) message.member.ban({ reason: "You are not allowed to say the n-word here!" })
                message.channel.send("You can't say the n-word on this server!")
                break;
        }
    }
    handler.handleCommand(client, message);
});

// Ready event
client.on('ready', () => {
    console.log(`Successfully logged in as ${client.user.tag} at ${utils.curTime()}`);
    console.timeEnd("Started in");
    client.user.setActivity(`Starting up...`, { type: "WATCHING", });
    utils.discordLoggedIn();
    utils.updateActivity(client, config.prefixes);
});

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
/* client.on("debug", (e) => console.info(e)); */

// Load fonts and db and login to the Discord API
try {
    utils.errorListerners(client);
    utils.loadFonts();
    utils.initFirebase().then(() => {
        console.log("Initialized firebase");
        console.time("Started in");
        handler.registerCommands(client);
        handler.registerEvents(client);
        client.login(process.env.TOKEN).then(() => {
            api.init();
        }).catch((err) => { utils.discordException(client, err) });
    });
} catch (err) { console.error(`Something went wrong trying to log in.\n${err}`); }