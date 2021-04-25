const jimp = require('jimp');
const firebase = require('firebase-admin');
const stats = require('./resources/stats.json');
const fs = require('fs');
const Discord = require('discord.js');
const debug = require('./debugger.js');
const devs = ["332567411620577280", "414585685895282701"];
var loggedIn = false;
function discordLoggedIn() { loggedIn = true; }
function curTime() { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); }

function loadFonts() {
    jimp.loadFont("./fonts/Roboto/Roboto-LightWhite.ttf.fnt").then(font => global.robotoWhite = font);
    jimp.loadFont("./fonts/Roboto/Roboto-Light.ttf.fnt").then(font => global.robotoBlackBig = font);
    jimp.loadFont("./fonts/RobotoSmall/Roboto-Light.ttf.fnt").then(font => global.robotoBlackSmall = font);
}

async function initFirebase() {
    firebase.initializeApp({
        credential: firebase.credential.cert(JSON.parse(process.env.FB_TOKEN)),
        databaseURL: "https://discordbot-58332.firebaseio.com",
    });
    await firebase.database().ref().once('value').then(function (snapshot) {
        global.Servers = snapshot.val().Servers;
        global.Users = snapshot.val().Users;
    });
}

function errorListeners(client) {
    process.on('uncaughtException', (err, origin) => {
        discordException(client, err)
    });

    process.on('unhandledRejection', (err, promise) => {
        if (err.stack.split("\n")[0].includes("Missing Access")) return
        discordException(client, err)
    });
}

function discordException(client, err, message = null, command = null) {
    if (message != null) {
        var embed = new Discord.MessageEmbed()
            .setColor('#fa3c3c')
            .setTitle('Error')
            .setDescription("Something went wrong trying to execute the command. The devs have been notified about this issue. Please try again later.")
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));
        message.channel.send(embed);
    }

    var devEmbed = new Discord.MessageEmbed()
        .setColor('#fa3c3c')
        .setTitle(`${err.name}`)
        .setDescription(err.stack)
        .addField("Short", err.message, true)
        .setTimestamp();

    if (command != null) devEmbed.addField("Information", `Occurred in: ${command.name}.\nOccurred at: ${curTime()}\nExecuted by: ${message.author.tag}\nExecuted in: ${message.guild.name}`, true);
    if (message != null) devEmbed.setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));

    let devs = ["414585685895282701", "332567411620577280"]
    for (dev of devs) {
        if (loggedIn) {
            client.users.fetch(dev)
                .then(userObj => userObj.send(devEmbed))
                .catch(err => { debug.sendErr('Failed trying to fetch a dev', err) });
        }

        debug.sendErr('DiscordException thrown.', err);
    }
}

function updateActivity(client, prefixes) {
    let prefixIndex = 0;
    // Update status every 10 seconds
    setInterval(() => {
        if (prefixIndex >= prefixes.length) prefixIndex = 0;
        client.user.setActivity(`${client.guilds.cache.size} Guilds [ ${prefixes[prefixIndex]}help ]`, {
            type: "WATCHING"
        });
        prefixIndex++;
    }, 10000);
}

function updateIntervals(client, dontGiveXPto) {
    setInterval(() => {
        for (var key in dontGiveXPto) {
            for (var uKey in dontGiveXPto[key]) {
                if (dontGiveXPto[key][uKey] - Date.now() <= 60) {
                    delete dontGiveXPto[key].uKey;
                }
            }
        }
    }, 5000);

    setInterval(() => {
        for (var guild of client.guilds.cache.array()) {
            let c = guild.channels.cache.find(chnl => chnl.name.includes("Member Count:"))//chnl.name == `Member Count: ${usrCount-1}`)
            if (c) {
                var usrCount = guild.members.cache.filter(mmbr => !mmbr.user.bot).size;
                c.edit({ name: `Member Count: ${usrCount}` })
            }
        }

    }, 300000)
}

function addStats(name) {
    stats[name]++;
    fs.writeFile(
        "./resources/stats.json",
        JSON.stringify(stats),
        {
            encoding: "utf8",
            flag: "w"
        },
        () => { return; }
    );
}

function getDevs() { return devs; }

module.exports = { discordLoggedIn, curTime, loadFonts, initFirebase, errorListeners, discordException, updateActivity, addStats, getDevs }