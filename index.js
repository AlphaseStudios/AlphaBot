const firebase = require("firebase-admin");
const Discord = require("discord.js")
const fs = require('fs');
const jimp = require('jimp');
const fetch = require('node-fetch')
const DiscordOauth2 = require('discord-oauth2')

var client = new Discord.Client({ partials: ['REACTION', 'CHANNEL', 'MESSAGE'], fetchAllMembers: true, messageCacheLifetime: 60, messageSweepInterval: 20 });
var stats = JSON.parse(fs.readFileSync('stats.json'))

client.commands = new Discord.Collection();

const oauth = new DiscordOauth2({
    clientId: "687228371016351760",
    clientSecret: process.env.clientSecret,
    redirectUri: "http://localhost/callback"
})


// Firebase initialization
firebase.initializeApp({
    credential: firebase.credential.cert(JSON.parse(process.env.FB)),
    databaseURL: "https://discordbot-58332.firebaseio.com"
});

var db = firebase.database()


async function LoadDB() {
    await db.ref().once('value').then(function(snapshot) {
        global.Servers = snapshot.val().Servers;
        global.Users = snapshot.val().Users;
        client.login(process.env.TOKEN)
    })
}
LoadDB()

const prefixes = ["a.", "ap."]
const levels = [75, 300, 675, 1200, 1875, 2700, 3675, 4800, 6075, 7500, 9075, 10800, 12675, 14700, 16875, 19200, 21675, 24300, 27075, 30000, 33075, 36300, 39675, 43200, 46875, 50700, 54675, 58800, 63075, 67500, 72075, 76800, 81675, 86700, 91875, 97200, 100000]
const skipServers = ["387812458661937152", "264445053596991498", "446425626988249089", "110373943822540800"]
const nwordRegEx = /n(i|\||l|1|\!)+g+(a|e+r)(?!.*((rd)|(ia)))/gmi
const inviteRegEx = /((http(s)*\:\/\/discord(app)*\.com\/invite\/)|(discord\.gg\/))[A-z\d]+/gmi
const ver = "6.8.1"
const changeLog =
    `\`\`\`Update v${ver}!\`\`\`\n
\`Changelog:\`
\t - The bot is now able to remove Invite Links! run \`51.help mod\` to know more about it!
\t - Fixed the bot logging \`undefined\` when a role is deleted.
\t - Now when a user is banned for saying the N-Word it will also provide what the bot thought is the N-Word. If a user is falsely banned, please report it in the Support Server ASAP.
`

//Copy this longer dash when you need it lmao
//—

process.on('uncaughtException', (err, origin) => {
    postException(err.stack)
})

process.on('unhandledRejection', (reason, promise) => {
    if (reason.stack.split("\n")[0].includes("Missing Access")) return
    postException(reason.stack)
})

function postException(err, loc = null) {
    let devs = ["332567411620577280", "414585685895282701"];

    if (loc) {
        var embed = new Discord.MessageEmbed()
            .setColor('#fa3c3c')
            .setTitle('Error')
            .setDescription("Something went wrong trying to execute the command. The devs have been notified about this issue. Please try again later.")
            .setTimestamp()
        loc.send(embed)
    }

    for (dev of devs) {
        client.users.fetch(dev).then((user) => {
            //.setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));

            var devEmbed = new Discord.MessageEmbed()
                .setColor('#fa3c3c')
                .setTitle(`${err.name ? err.name : "An Error has occured!"}`)
                .setDescription(err.stack ? err.stack : err)
				/*.addFields(
					{ name: "Short", value: err.stack.split("\n").splice(0,3).join("\n"), inline: true },
					//{ name: "Information", value: `Occurred in: ${command.name}.\nOccurred at: ${curTime()}`/*`\nExecuted by: ${message.author.tag}\nExecuted in: ${message.guild.name}`, inline: true }
                )*/
                .setTimestamp()
            //.setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));
            user.send(devEmbed);
        });
    }

    console.error(err)
}


let express = require("express"),
    http = require('http'),
    app = express();

let listener = app.listen(process.env.PORT);

app.use(function(req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')//http:51stDashboard.iljabusch.repl.co');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});


var { urlencoded, json } = require('body-parser');
app.use(urlencoded({ extended: false }))
app.use(json())

app.get("/", (req, res) => {
    res.sendStatus(200)
})


/* 
    Description: Returns the access token
    Parameters: refresh token
*/
app.post("/api/discord/get/token", (request, response) => {
    const options = {
        method: "POST"
    }

    let params = new URLSearchParams();
    params.append('client_id', "687228371016351760")
    params.append('client_secret', process.env.clientSecret)
    params.append('code', request.body.token)
    params.append('grant_type', "authorization_code")
    params.append('redirect_uri', "http://127.0.0.1:5500/oauth/callback/index.html")
    options.body = params

    fetch("https://discordapp.com/api/oauth2/token", options)
        .then(res => res.json())
        .then(json => {
            if (json.error) {
                response.json(json)
            }
            else {
                json.access_token = encrypt(json.access_token)
                response.json(json)
            }

        })
});

/* 
    Description: Returns all the guilds the user is in
    Parameters: refresh token
*/
app.post("/api/discord/get/user/guilds", (request, response) => {
    let token = decrypt(JSON.parse(request.body.token))
    oauth.getUserGuilds(token).then(res => {
        var servs = res.filter(serv => serv.owner || new Discord.Permissions(serv.permissions).serialize().ADMINISTRATOR)
        response.json(servs)
    })
})

/* 
    Description: Returns data about a user
    Parameters: access token
*/
app.post("/api/discord/get/user", (request, response) => {
    let token = decrypt(JSON.parse(request.body.token))
    oauth.getUser(token).then(res => {
        response.json(res)
    })
})

/* 
    Description: Returns data about a guild
    Parameters: access token, guild id
*/
app.post("/api/discord/get/guild", (request, response) => {
    var serv = { dt: global.Servers[request.body.server] }
    var goodData = {}

    let token = decrypt(JSON.parse(request.body.token))
    oauth.getUser(token).then(res => {
        client.guilds.fetch(request.body.server).then(guild => {

            /* DATA FILTERING, TO PROVIDE ONLY NEEDED DATA */
            goodData.roles = guild.roles.cache.array().filter(r => r.id != guild.roles.everyone.id).map(r => {
                return {
                    id: r.id,
                    name: r.name,
                    color: r.hexColor
                }
            })
            goodData.channels = guild.channels.cache.array().filter(x => x.type === "news" || x.type === "text").map(function(x) {
                return { id: x.id, name: x.name }
            })

            goodData.id = guild.id
            goodData.name = guild.name
            serv.server = goodData
            /* END */

            if (guild.owner.id == res.id) {
                response.json(serv)
            }
            else {
                guild.members.fetch(res.id).then(guildMember => {
                    if (guildMember.hasPermission("ADMINISTRATOR")) {
                        response.json(serv)
                    }
                    else {
                        response.json({ error: "401", message: "Unauthorized", details: "You need to be an administrator in that server or own it!" })
                    }
                }).catch(e => { response.json({ error: "500", message: "Internal Server Error", details: "Something went wrong on our side!" }) })
            }
        }).catch(e => {
            response.json({ error: "404", message: "Not Found", details: "That server doesn't seem to exist, or the bot is not there!" })
        })
    })
})

/* 
    Description: Saves given data
    Parameters: access token, guild id, newData Object
*/
app.post("/api/discord/post/save_data", (request, response) => {
    let token = decrypt(JSON.parse(request.body.token))

    oauth.getUser(token).then(res => {
        client.guilds.fetch(request.body.server).then(guild => {

            if (guild.owner.id == res.id) {
                global.Servers[request.body.server] = request.body.data
                firebase.database().ref().child(`Servers/${request.body.server}`).update(request.body.data)
            }
            else {
                guild.members.fetch(res.id).then(guildMember => {
                    if (guildMember.hasPermission("ADMINISTRATOR")) {
                        global.Servers[request.body.server] = request.body.data
                        firebase.database().ref().child('Servers').child(request.body.server).set(request.body.data)
                    }
                    else {
                        response.json({ error: "401", message: "Unauthorized", details: "You need to be an administrator in that server or own it!" })
                    }
                }).catch(e => { response.json({ error: "500", message: "Internal Server Error", details: "Something went wrong on our side!" }) })
            }
        }).catch(e => {
            response.json({ error: "404", message: "Not Found", details: "That server doesn't seem to exist, or the bot is not there!" })
        })
    })
})

var rLimit = {}
var dontGiveXPto = {}
var eventCooldown = {}

client.on('ready', async () => {
    // Load Jimp fonts globally
    jimp.loadFont("./fonts/Roboto/Roboto-LightWhite.ttf.fnt").then(font => global.robotoWhite = font)
    jimp.loadFont("./fonts/Roboto/Roboto-Light.ttf.fnt").then(font => global.robotoBlackBig = font)
    jimp.loadFont("./fonts/RobotoSmall/Roboto-Light.ttf.fnt").then(font => global.robotoBlackSmall = font)

    //Set status to streaming
    client.user.setActivity(`Starting up...`, {
        type: "WATCHING",
    })

    let prefixIndex = 0;
    // Update status every 10 seconds
    setInterval(() => {
        if (prefixIndex >= prefixes.length) prefixIndex = 0;
        client.user.setActivity(`${client.guilds.cache.size} Guilds [ ${prefixes[prefixIndex]}help ]`, {
            type: "WATCHING"
        });
        prefixIndex++;
    }, 10000);

    // Load all commands
    let folders = ["commands", "events"]
    folders.map((folder) => {
        fs.readdir(`./${folder}`, (err, files) => {
            if (err) console.error(err);
            let jsfiles = files.filter(f => f.split(".").pop() === "js");
            if (jsfiles.length <= 0) {
                console.log("Nothing to load!");
                return;
            }
            commSize = jsfiles.length
            console.log(`Loading ${jsfiles.length} commands!`);
            jsfiles.forEach((file, i) => {
                let props = require(`./${folder}/${file}`);
                switch(folder) {
                    case ("commands"):
                        client[folder].set(props.help.name, props);
                        break;
                    case ("events"):
                        props.registerEvents(client);
                }
            });
        });
    });

    // Iterate through people who have already claimed XP
    setInterval(() => {
        for (var key in dontGiveXPto) {
            for (var uKey in dontGiveXPto[key]) {
                if (dontGiveXPto[key][uKey] - Date.now() <= 60) {
                    delete dontGiveXPto[key].uKey;
                }
            }
        }
    }, 5 * 1000);

    setInterval(() => {
        for (var guild of client.guilds.cache.array()) {
            let c = guild.channels.cache.find(chnl => chnl.name.includes("Member Count:"))//chnl.name == `Member Count: ${usrCount-1}`)
            if (c) {
                var usrCount = guild.members.cache.filter(mmbr => !mmbr.user.bot).size;
                c.edit({ name: `Member Count: ${usrCount}` })
            }
        }

    }, 60 * 1000 * 5)
})




client.on('message', message => {
    if (!global) return;
    if (message.author.bot || message.channel.type === "dm") return

    for (prefix of prefixes) {
        try {
            if (message.content.toLowerCase().startsWith(prefix)) {
                let args = message.content.substring(prefix.length).split(" ")
                args = args.filter(arg => arg != "")

                // Case if bot is still loading
                if (client.commands.size < 16) {
                    message.channel.send("The Bot has Just Started working and it wasn't fully loaded yet. please wait a few moments before performing this command again.")
                    return;
                }

                let cmd = client.commands.get(args[0].toLowerCase())
                switch (args[0]) {
                    case "welcome":
                        if (cmd.run(message, args)) {
                            firebase.database().ref().child('Servers').update(global.Servers)
                        }
                        break;
                    case "level":
                        cmd.run(message, levels)
                        break;
                    case "liar":
                        cmd.run(message, client)

                        stats["Liar"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "setlvl":
                    case "setlevel":
                        cmd = client.commands.get("setlvl")
                        if (cmd.run(message, args)) {
                            firebase.database().ref().child('Users').update(global.Users)
                        }
                        break;
                    case "mute":
                        var saveArr = cmd.run(message, args);
                        if (saveArr != null && saveArr.length > 0) {
                            firebase.database().ref().child('Users').update(global.Users)
                        }
                        break;
                    case "unmute":
                        if (cmd.run(message)) {
                            firebase.database().ref().child('Users').update(global.Users)
                        }
                        break;
                    case "coinflip":
                        var rnd = Math.floor(Math.random() * 2)
                        rnd = rnd == 1 ? "Tails! :credit_card:" : "Heads! :moyai:"

                        message.channel.send(rnd)

                        stats["C_Flip"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "ask":
                        if (args.length > 1) {
                            var msg = message.cleanContent;
                            msg = Discord.Util.removeMentions(msg)
                            msg = msg.split(" ")
                            const respones = ["Absolutely!", "Oh hell no!", "Calm down, the CEO of bad ideas", "Hell Yes!", "Yes", "What were you even thinking?", "Yeah, sure", "I don't know, not gonna lie...", "No", "False", "True", "Just no.", "Oh lord, YES!"]
                            message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setTitle(msg.slice(1, msg.length).join(" ")).setDescription(respones[Math.floor(Math.random() * respones.length)]))
                        } else {
                            message.channel.send("Try asking again, but this time actually ask something!")
                        }

                        stats["Ask"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "clapify":
                        if (args.join(" ").match(nwordRegEx)) return

                        if (args.length > 1) {
                            var msg = ":clap: " + args.slice(1, args.length).join(" :clap: ") + " :clap:"
                            msg = Discord.Util.removeMentions(msg)
                            if (msg.length > 2000) { message.channel.send("Your message has exceeded the 2000 character limit!"); return }
                            message.channel.send(msg + `\n\n- ${message.author.tag}`)
                            message.delete().catch();
                        } else {
                            message.channel.send("Please try again, but this time, give me something to clapify!")
                        }

                        stats["Clap"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "mock":
                        if (args.join(" ").match(nwordRegEx)) return

                        if (args.length > 1) {
                            var Tmsg = args.slice(1, args.length).join(" ")
                            var fMsg = "";
                            for (var i = 0; i < Tmsg.length; i++) {
                                if (i % 2 == 0) {
                                    fMsg += Tmsg[i].toLowerCase();
                                } else {
                                    fMsg += Tmsg[i].toUpperCase();
                                }
                            }
                            var msg = `${Discord.Util.removeMentions(fMsg)}\n\n- ${message.author.tag}`
                            if (msg.length > 2000) { message.channel.send("Your message has exceeded the 2000 character limit!"); return }
                            message.channel.send(msg)
                            message.delete();
                        } else {
                            message.channel.send("Please try again, but this time, give me something to mock!")
                        }

                        stats["Mock"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "rps":
                        if (args[1] && args[1].match(/(r(ock)?)|(p(aper)?)|(s(cissors)?)/gmi)) {
                            var choice = ""
                            if (args[1].toLowerCase().startsWith("r")) choice = "Rock :moyai:"
                            else if (args[1].toLowerCase().startsWith("p")) choice = "Paper :roll_of_paper:"
                            else if (args[1].toLowerCase().startsWith("s")) choice = "Scissors :scissors:"

                            var myChoice = ["Rock :moyai:", "Paper :roll_of_paper:", "Scissors :scissors:"][Math.floor(Math.random() * 3)]

                            if ((choice == "Rock :moyai:" && myChoice == "Paper :roll_of_paper:") || (choice == "Paper :roll_of_paper:" && myChoice == "Scissors :scissors:") || (choice == "Scissors :scissors:" && myChoice == "Rock :moyai:")) {
                                message.channel.send(new Discord.MessageEmbed().setColor("8b0000").setDescription(`You chose: ${choice}.\n\nI chose ${myChoice}.\n\nYou Lose!`))
                            } else if (choice == myChoice) {
                                message.channel.send(new Discord.MessageEmbed().setColor("CCCC00").setDescription(`You chose: ${choice}.\n\nI chose ${myChoice}.\n\nIt's a tie!`))
                            } else {
                                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`You chose: ${choice}.\n\nI chose ${myChoice}.\n\nYou Win!`))
                            }
                        } else {
                            message.channel.send("Please try again, but also choose `rock`, `paper` or `scissors`!")
                        }

                        stats["RPS"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "milestones":
                        if (cmd.run(message, args)) {
                            firebase.database().ref().child('Servers').update(global.Servers)
                        }
                        break;
                    case "ai":
                        var embed = new Discord.MessageEmbed()
                            .setTitle("AI Has overtaken the world!")
                            .setDescription(`Your chance of surviving is: ${Math.floor(Math.random() * 100)}%`)
                            .setColor("#3D7B2F");
                        message.channel.send(embed);

                        stats["RPS"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "ban":
                        if (!message.member.hasPermission("BAN_MEMBERS")) return;
                        if (!message.mentions.members.first() || !message.mentions.members.first().bannable) { message.channel.send("Please mention a member I can ban!"); return; }
                        var reason = "No reason specified.";
                        if (args.length > 2) reason = args.filter(arg => args.indexOf(arg) > 1 && !arg.includes(message.mentions.members.first().id)).join(" ")
                        message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setTitle(`Banned ${message.mentions.members.first().user.tag}!`).setDescription(`Reason: ${reason}`))
                        message.mentions.members.first().ban({ reason: reason })
                        break;
                    case "kick":
                        if (!message.member.hasPermission("KICK_MEMBERS")) return;
                        if (!message.mentions.members.first() || !message.mentions.members.first().kickable) { message.channel.send("Please mention a member I can kick!"); return; }
                        var reason = "No reason specified.";
                        if (args.length > 2) reason = args.filter(arg => args.indexOf(arg) > 1 && !arg.includes(message.mentions.members.first().id)).join(" ")
                        message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setTitle(`Kicked ${message.mentions.members.first().user.tag}!`).setDescription(`Reason: ${reason}`))
                        message.mentions.members.first().kick({ reason: reason })
                        break;
                    case "purge":
                    case "delete":
                        cmd = client.commands.get("purge");
                        cmd.run(message, args);
                        break;
                    case "help":
                        message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setTitle("Command List").setURL("https://51devs.xyz/bot/docs/"))
                        break;
                    case "info":
                        var embed = new Discord.MessageEmbed().setColor("3d7b2f").setTitle("__Bot Info__")

                        //#region Uptime Calculations
                        let totalSeconds = client.uptime / 1000;
                        let days = Math.floor(totalSeconds / 86400);
                        let hours = Math.floor(totalSeconds / 3600);
                        totalSeconds %= 3600;
                        let minutes = Math.floor(totalSeconds / 60);
                        let seconds = Math.floor(totalSeconds % 60);
                        let uptime = ``; // = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds`;

                        if (days != 0) {
                            uptime += `${days} Day(s), `;
                        }
                        if (hours != 0 || days > 0) {
                            uptime += `${hours} Hour(s), `;
                        }
                        if (days > 0 || hours > 0 || minutes > 0) {
                            uptime += `${minutes} Minute(s), `;
                        }
                        uptime += `${seconds} Second(s)`;
                        //#endregion

                        var usersAmm = 0;

                        client.guilds.cache.array().forEach(guild => {
                            if (guild.id != "264445053596991498" && guild.id != "110373943822540800") {
                                if (typeof (guild.memberCount) == "number")
                                    usersAmm += guild.memberCount
                            }
                        })

                        message.channel.send("***Collecting Data...***").then(msg => {
                            embed.setThumbnail(client.user.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
                                .setDescription(`Uptime: ${uptime}\n\n
                        :inbox_tray: Ping: ${msg.createdTimestamp - message.createdTimestamp}ms\n\n
                        :control_knobs: Servers: ${client.guilds.cache.size}\n\n
                        :busts_in_silhouette: Users: ${usersAmm}\n\n
                        :toolbox: Version: ${ver}\n\n
                        :link: Links:\n[Invite](https://discordapp.com/oauth2/authorize?client_id=687228371016351760&scope=bot&permissions=805314622) | [Support Server](https://discord.gg/RReQ7kW)`)
                                .setFooter(`Bot Created By: ${client.users.cache.get("332567411620577280").tag}`, client.users.cache.get("332567411620577280").displayAvatarURL({ format: "png", size: 512, dynamic: true }))

                            msg.edit(embed)
                        })

                        break;
                    case "whois":
                        console.log("Hi")
                        const status = {
                            online: "<:online:759034055231799316> Online",
                            idle: "<:idle:759034016404996136> Idle",
                            dnd: "<:dnd:759033963233673257> Do Not Disturb",
                            offline: "<:offline:759033991226458132> Offline/Invisible",
                            streaming: "<:streaming:759033930866229249> Streaming"
                        }

                        var target = message.mentions.users.first() ? message.mentions.users.first() : message.author;
                        var targetStatus, targetGame;
                        for (var i in target.presence.activities) {
                            switch (target.presence.activities[i].type) {
                                case "CUSTOM_STATUS":
                                    targetStatus = (target.presence.activities[i].emoji ? target.presence.activities[i].emoji.name + " " : "") + target.presence.activities[i].state;
                                    break;
                                case "LISTENING":
                                    targetGame = `Listening to **${target.presence.activities[i].details}** by **${target.presence.activities[i].state}** on Spotify`
                                    break;
                                case "PLAYING":
                                    targetGame = `**Playing** ${target.presence.activities[i].name}`
                                    break;
                            }
                        }
                        var embed = new Discord.MessageEmbed().setTitle(`${target.tag}'s Info`).setColor("3d7b2f").setThumbnail(target.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
                            .setDescription(`${target.bot ? "User is a bot! :robot:\n\n" : ""}
                    :hash: UUID:\n${target.id}\n\n
                    :bar_chart: Presence:\n${status[target.presence.status]}\n\n
                    :joystick: Activity:\n${targetGame == null ? "User Not Doing Anything" : targetGame}\n\n
                    💬 Custom Status:\n${targetStatus == null ? "User hasn't set a custom status" : targetStatus}\n\n
                    :inbox_tray: User Created at: ${target.createdAt.getDate()}/${target.createdAt.getMonth() + 1}/${target.createdAt.getFullYear()}, ${target.createdAt.toLocaleTimeString()}`)
                        message.channel.send(embed)
                        break;
                    case "members":
                        cmd.run(message, args)
                        break;
                    case "meme":
                        cmd.run(message);

                        stats["Meme"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "modlog":
                    case "auditlog":
                        cmd = client.commands.get("modlog")
                        if (cmd.run(message, args)) {
                            firebase.database().ref().child("Servers").update(global.Servers)
                        }
                        break;
                    case "nuke":
                        cmd.run(message);
                        break;
                    case "nword":
                        if (cmd.run(message, args)) {
                            firebase.database().ref().child("Servers").update(global.Servers)
                        }
                        break;
                    case "pn":
                        if (cmd.run(message, args, changeLog)) {
                            firebase.database().ref().child("Servers").update(global.Servers)
                        }
                        break;
                    case "sendnotes":
                        if (message.author.id != "332567411620577280") return;
                        for (var g in global.Servers) {
                            if (global.Servers[g].pnc) {
                                if (client.guilds.cache.has(g)) {
                                    if (client.guilds.cache.get(g).channels.cache.has(global.Servers[g].pnc)) {
                                        client.guilds.cache.get(g).channels.cache.get(global.Servers[g].pnc).send(changeLog)
                                    }
                                }
                            }
                        }
                        break;
                    case "testnotes":
                        if (message.author.id != "332567411620577280") return;

                        message.channel.send(changeLog)
                        break;
                    case "leveling":
                        if (cmd.run(args, message)) {
                            firebase.database().ref().child("Servers").update(global.Servers)
                        }
                        break;
                    case "noxp":
                        if (cmd.run(args, message)) {
                            firebase.database().ref().child("Servers").update(global.Servers)
                        }
                        break;
                    case "website":
                    case "web":
                    case "site":
                        message.channel.send(new Discord.MessageEmbed(new Discord.MessageEmbed().setURL("https://51devs.xyz").setColor("3d7b2f").setTitle("Check out our website!")))
                        break;
                    case "tictactoe":
                        cmd.run(message, args)

                        stats["TTT"]++
                        fs.writeFileSync("stats.json", JSON.stringify(stats))

                        break;
                    case "avvy":
                    case "pfp":
                    case "avatar":
                        var target = message.mentions.members.first() ? message.mentions.members.first().user : message.author;
                        message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setTitle(`${target.tag}'s PFP:`).setImage(target.displayAvatarURL({ format: "png", size: 512, dynamic: true })))
                        break;
                    case "rr":
                    case "reactionrole":
                        client.commands.get("rr").run(message, args)
                        break;
                    case "vote":
                        var embed = new Discord.MessageEmbed()
                            .setColor("3D7B2F")
                            .setTitle("Upvote 51st Bot at")
                            .setDescription(`top.gg - [here](https://top.gg/bot/687228371016351760/vote)`)
                        message.channel.send(embed)
                        break;
                    case "triggerevent":
                        if (message.author.id != "332567411620577280") return;

                        var events = JSON.parse(fs.readFileSync("events.json"))
                        var rarity = Object.keys(events)[Math.floor(Math.random() * Object.keys(events).length)]
                        events = events[rarity]
                        var event = events[Math.floor(Math.random() * events.length)]
                        var embed = new Discord.MessageEmbed().setColor("3d7b2f")
                            .setTitle(`${rarity} event time!`)
                            .setDescription(`${event.title}\n\n${event.body}`)
                            .setFooter(`Max [ ${event.entries} ] entries`);

                        message.channel.send(embed).then(bMsg => {
                            var collector = message.channel.createMessageCollector(m => m.content.toLowerCase() == event.collect, { time: 10000, max: event.entries })
                            var usersToReward = []

                            collector.on('collect', msg => {
                                if (usersToReward.indexOf(msg.member.id) == -1) {
                                    usersToReward.push(msg.member.id)
                                    msg.react('✅')
                                }
                            })

                            collector.on('end', (collected, reason) => {
                                if (usersToReward.length > 0) {
                                    var em = new Discord.MessageEmbed().setColor("3d7b2f")
                                        .setTitle(`The event has ended!`)
                                        .setDescription("");

                                    for (var userR of usersToReward) {

                                        var reward = Math.floor(Math.random() * (event.rewardMax - event.rewardMin + 1) + event.rewardMin)
                                        global.Users[message.guild.id][userR].xp += reward
                                        em.description += `<@!${userR}> has recieved ${reward} XP!\n`

                                        var userLevel = global.Users[message.guild.id][userR].lvl
                                        var neededXP = userLevel > 36 ? 100000 : levels[userLevel]

                                        // Check if user leveled up
                                        if (global.Users[message.guild.id][userR].xp >= neededXP) {
                                            global.Users[message.guild.id][userR].xp -= neededXP
                                            global.Users[message.guild.id][userR].lvl++;
                                            userLevel++;

                                            // Check if announcing level ups is enabled
                                            if (global.Servers[message.guild.id].shoutLvl) {
                                                // Default level up message
                                                var msg = `<@!${userR}> Has advanced to level ${userLevel}`

                                                // Check if a custom level up message exists, if yes, use it.
                                                if (global.Servers[message.guild.id].lvlMsg) {
                                                    msg = global.Servers[message.guild.id].lvlMsg
                                                    msg = msg.replace(/\{user\}/gmi, `<@!${userR}>`)
                                                    msg = msg.replace(/\{user.tag\}/gmi, `<@!${message.author.tag}>`)
                                                    msg = msg.replace(/\{level\}/gmi, `${userLevel}`)
                                                    msg = msg.replace(/\{((guild)|(server))\}/gmi, `<@!${message.guild.name}>`)
                                                }

                                                // Check if any specific channel was set to the level-up announcement channel, if yes send it there, if not send it in the same channel the user has leveled up in.
                                                if (global.Servers[message.guild.id].shoutC && message.guild.channels.cache.has(global.Servers[message.guild.id].shoutC)) {
                                                    var c = message.guild.channels.cache.get(global.Servers[message.guild.id].shoutC)
                                                    c.send(msg);
                                                } else {
                                                    message.channel.send(msg)
                                                }
                                            }

                                            // Check if server has milestones
                                            if (global.Servers[message.guild.id].milestones) {

                                                //if yes, check if user has reached them.
                                                if (global.Servers[message.guild.id].milestones[userLevel.toString()]) {
                                                    // add the milestone role.
                                                    try {
                                                        message.member.roles.add(global.Servers[message.guild.id].milestones[userLevel.toString()])
                                                    } catch { }
                                                }
                                            }
                                        }
                                        firebase.database().ref().child('Users').child(message.guild.id).update(global.Users[message.guild.id])
                                    }
                                    message.channel.send(em)
                                }
                                bMsg.edit("`THE EVENT HAS ENDED, NO FURTHER ENTRIES WILL BE ACCEPTED`", embed)
                            })
                        })
                        break;
                    case "reminvites":
                    case "delinvites":
                    case "reminvite":
                    case "delinvite":
                        cmd = client.commands.get("reminvite")
                        if (cmd.run(message, args)) {
                            firebase.database().ref().child("Servers").update(global.Servers)
                        }
                        break;
                }
            }
        } catch (e) {
            message.channel.send(new Discord.MessageEmbed().setColor("8b0000").setTitle("Something went wrong!").setDescription(`Error message: ${e.message}\n\nI have contacted the developer!`))
            postException(e.stack, message.channel)
        }
    }
})

client.on('message', message => {
    if (!global) return;

    if (message.author.bot || message.channel.type === "dm") return;
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

    // N-Word Detection
    if (message.content.match(nwordRegEx)) {
        switch (global.Servers[message.guild.id].nword) {
            case "1":
                message.delete();
                return;
                break;
            case "2":
                if (message.member.bannable) {
                    var reg = new RegExp(nwordRegEx)
                    reg.test(message.content)
                    var firstIndx = message.content.search(nwordRegEx)
                    message.member.ban({ reason: `Said the N-Word. Detected: "${message.content.substr(firstIndx, reg.lastIndex - firstIndx)}"` })
                    message.delete()
                }
                return;
                break;
        }
    }

    if (message.content.match(inviteRegEx))
        if (global.Servers[message.guild.id].remInvState)
            if (global.Servers[message.guild.id].allowedInvChannels) {
                if (!global.Servers[message.guild.id].allowedInvChannels.includes(message.channel.id)) {

                    if (global.Servers[message.guild.id].allowedInvRoles) {
                        var mRoles = message.member.roles.cache.array().map(x => x.id)
                        var aRoles = global.Servers[message.guild.id].allowedInvRoles

                        var _delete = true;

                        for (var role of mRoles) {
                            if (aRoles.includes(role)) {
                                _delete = false
                            }
                        }

                        if (_delete) message.delete()
                    }
                    else {
                        message.delete()
                    }
                }
            }
            else {
                if (global.Servers[message.guild.id].allowedInvRoles) {
                    var mRoles = message.member.roles.cache.array().map(x => x.id)
                    var aRoles = global.Servers[message.guild.id].allowedInvRoles

                    var _delete = true;

                    for (var role of mRoles) {
                        if (aRoles.includes(role)) {
                            _delete = false
                        }
                    }

                    if (_delete) message.delete()
                }
                else {
                    message.delete()
                }
            }

    if (!global.Users) return;

    var msgCnt = message.content.substring(0, 3)
    if (msgCnt.match(/(51\.)|(ff\.)|(52\.)/gmi) || skipServers.includes(message.guild.id.toString())) return;

    // Check if member claimed XP
    if (!dontGiveXPto) dontGiveXPto = {};
    if (!dontGiveXPto[message.guild.id]) dontGiveXPto[message.guild.id] = {};

    if (dontGiveXPto[message.guild.id][message.member.id] == undefined) {
        // If not, add them to the claimed XP obj
        dontGiveXPto[message.guild.id][message.member.id] = Date.now();
        if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {}

        // Check if user has a data obj, if not, create one
        if (!global.Users[message.guild.id][message.member.id]) {
            global.Users[message.guild.id][message.member.id] = {
                lvl: 0,
                xp: 0,
                warns: [],
                roles: []
            }
            firebase.database().ref().child('Users').update(global.Users)
        }

        // Check if XP claiming is blocked in that channel
        try {
            if (global.Servers[message.guild.id].noxp.indexOf(message.channel.id) > -1) return;
        } catch { }

        // XP Reward
        var rnd = (Math.floor(Math.random() * 16) + 10)

        // XP Multiplier
        if (global.Servers[message.guild.id].multiplier && !Number.isNaN(global.Servers[message.guild.id].multiplier)) {
            rnd *= global.Servers[message.guild.id].multiplier;
        }
        // add Reward
        global.Users[message.guild.id][message.member.id].xp += rnd


        var userLevel = global.Users[message.guild.id][message.member.id].lvl
        var neededXP = userLevel > 36 ? 100000 : levels[userLevel]

        // Check if user leveled up
        if (global.Users[message.guild.id][message.member.id].xp >= neededXP) {
            global.Users[message.guild.id][message.member.id].xp -= neededXP
            if (global.Users[message.guild.id][message.member.id].lvl >= 65535) {
                message.channel.send("Your level is so big, you can't go further anymore! You really are special.")
            }
            else {
                global.Users[message.guild.id][message.member.id].lvl++;
                userLevel++;

                // Check if announcing level ups is enabled
                if (global.Servers[message.guild.id].shoutLvl) {
                    // Default level up message
                    var msg = `<@!${message.member.id}> Has advanced to level ${userLevel}`

                    // Check if a custom level up message exists, if yes, use it.
                    if (global.Servers[message.guild.id].lvlMsg) {
                        msg = global.Servers[message.guild.id].lvlMsg
                        msg = msg.replace(/\{user\}/gmi, `<@!${message.member.id}>`)
                        msg = msg.replace(/\{user.tag\}/gmi, `<@!${message.author.tag}>`)
                        msg = msg.replace(/\{level\}/gmi, `${userLevel}`)
                        msg = msg.replace(/\{((guild)|(server))\}/gmi, `<@!${message.guild.name}>`)
                    }

                    // Check if any specific channel was set to the level-up announcement channel, if yes send it there, if not send it in the same channel the user has leveled up in.
                    if (global.Servers[message.guild.id].shoutC && message.guild.channels.cache.has(global.Servers[message.guild.id].shoutC)) {
                        var c = message.guild.channels.cache.get(global.Servers[message.guild.id].shoutC)
                        c.send(msg);
                    } else {
                        message.channel.send(msg)
                    }
                }

                // Check if server has milestones
                if (global.Servers[message.guild.id].milestones) {

                    //if yes, check if user has reached them.
                    if (global.Servers[message.guild.id].milestones[userLevel.toString()]) {
                        // add the milestone role.
                        try {
                            message.member.roles.add(global.Servers[message.guild.id].milestones[userLevel.toString()])
                        } catch { }
                    }
                }
            }
        }

        firebase.database().ref().child('Users').child(message.guild.id).update(global.Users[message.guild.id])
    }


    // EVENTS //

    if (!eventCooldown[message.guild.id] && global.Servers[message.guild.id].events) {
        if (Math.floor(Math.random() * 26) == 14) {
            eventCooldown[message.guild.id] = Date.now()
            var events = JSON.parse(fs.readFileSync("events.json"))
            var rarity = Object.keys(events)[Math.floor(Math.random() * Object.keys(events).length)]
            events = events[rarity]
            var event = events[Math.floor(Math.random() * events.length)]
            var embed = new Discord.MessageEmbed().setColor("3d7b2f")
                .setTitle(`${rarity} event time!`)
                .setDescription(`${event.title}\n\n${event.body}`)
                .setFooter(`Max [ ${event.entries} ] entries`);

            message.channel.send(embed).then(bMsg => {
                var collector = message.channel.createMessageCollector(m => m.content.toLowerCase() == event.collect, { time: 10000, max: event.entries })
                var usersToReward = []

                collector.on('collect', msg => {
                    if (usersToReward.indexOf(msg.member.id) == -1) {
                        usersToReward.push(msg.member.id)
                        msg.react('✅')
                    }
                })

                collector.on('end', (collected, reason) => {
                    if (usersToReward.length > 0) {
                        var em = new Discord.MessageEmbed().setColor("3d7b2f")
                            .setTitle(`The event has ended!`)
                            .setDescription("");

                        for (var userR of usersToReward) {

                            var reward = Math.floor(Math.random() * (event.rewardMax - event.rewardMin + 1) + event.rewardMin)
                            global.Users[message.guild.id][userR].xp += reward
                            em.description += `<@!${userR}> has recieved ${reward} XP!\n`

                            var userLevel = global.Users[message.guild.id][userR].lvl
                            var neededXP = userLevel > 36 ? 100000 : levels[userLevel]

                            // Check if user leveled up
                            if (global.Users[message.guild.id][message.member.id].xp >= neededXP) {
                                global.Users[message.guild.id][message.member.id].xp -= neededXP
                                if (global.Users[message.guild.id][message.member.id].lvl >= 65535) {
                                    message.channel.send("Your level is so big, you can't go further anymore! You really are special.")
                                }
                                else {
                                    global.Users[message.guild.id][message.member.id].lvl++;
                                    userLevel++;

                                    // Check if announcing level ups is enabled
                                    if (global.Servers[message.guild.id].shoutLvl) {
                                        // Default level up message
                                        var msg = `<@!${message.member.id}> Has advanced to level ${userLevel}`

                                        // Check if a custom level up message exists, if yes, use it.
                                        if (global.Servers[message.guild.id].lvlMsg) {
                                            msg = global.Servers[message.guild.id].lvlMsg
                                            msg = msg.replace(/\{user\}/gmi, `<@!${message.member.id}>`)
                                            msg = msg.replace(/\{user.tag\}/gmi, `<@!${message.author.tag}>`)
                                            msg = msg.replace(/\{level\}/gmi, `${userLevel}`)
                                            msg = msg.replace(/\{((guild)|(server))\}/gmi, `<@!${message.guild.name}>`)
                                        }

                                        // Check if any specific channel was set to the level-up announcement channel, if yes send it there, if not send it in the same channel the user has leveled up in.
                                        if (global.Servers[message.guild.id].shoutC && message.guild.channels.cache.has(global.Servers[message.guild.id].shoutC)) {
                                            var c = message.guild.channels.cache.get(global.Servers[message.guild.id].shoutC)
                                            c.send(msg);
                                        } else {
                                            message.channel.send(msg)
                                        }
                                    }

                                    // Check if server has milestones
                                    if (global.Servers[message.guild.id].milestones) {

                                        //if yes, check if user has reached them.
                                        if (global.Servers[message.guild.id].milestones[userLevel.toString()]) {
                                            // add the milestone role.
                                            try {
                                                message.member.roles.add(global.Servers[message.guild.id].milestones[userLevel.toString()])
                                            } catch { }
                                        }
                                    }
                                }
                            }
                            firebase.database().ref().child('Users').child(message.guild.id).update(global.Users[message.guild.id])
                        }
                        message.channel.send(em)
                    }
                    bMsg.edit("`THE EVENT HAS ENDED, NO FURTHER ENTRIES WILL BE ACCEPTED`", embed)
                })
            })
        }
    }
})

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (!newMessage.content || newMessage.channel.type == "dm") return
    // N-Word Detection
    if (newMessage.content.match(nwordRegEx)) {
        switch (global.Servers[newMessage.guild.id].nword) {
            case "1":
                newMessage.delete();
                return;
                break;
            case "2":
                if (newMessage.member.bannable) newMessage.member.ban({ reason: "Said the N-Word" })
                return;
                break;
        }
    }
})


//#region reactionRole
client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.channel.type == "dm" || user.bot) return;

    var guild = reaction.message.guild;

    if (!global.Servers[guild.id] || !global.Servers[guild.id].rr) return;

    var rrDt = global.Servers[guild.id].rr[reaction.message.id]

    if (!rrDt) return;

    var reactionID = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name

    rrDt = rrDt[reactionID]

    if (!rrDt) return

    if (guild.roles.cache.has(rrDt.role)) {
        if (!guild.members.cache.get(user.id).roles.cache.has(rrDt.role)) {
            guild.members.cache.get(user.id).roles.add(rrDt.role)
            if (rrDt.type == 1) {
                reaction.users.remove(user.id)
            }
        }
        else {
            reaction.users.remove(user.id)
        }

    }
});

client.on('messageReactionRemove', (reaction, user) => {
    if (reaction.message.channel.type == "dm" || user.bot) return;

    var guild = reaction.message.guild;

    if (!global.Servers[guild.id] || !global.Servers[guild.id].rr) return;

    var rrDt = global.Servers[guild.id].rr[reaction.message.id]

    if (!rrDt) return;

    var reactionID = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name

    rrDt = rrDt[reactionID]

    if (!rrDt || rrDt.type == 1) return;

    if (guild.roles.cache.has(rrDt.role)) {
        if (guild.members.cache.get(user.id).roles.cache.has(rrDt.role)) {
            guild.members.cache.get(user.id).roles.remove(rrDt.role)
        }
    }
});
//#endregion

//#region modlogs

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    if (!newMember.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    const entry = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE' || 'MEMBER_UPDATE' }).then(audit => {
        var a = audit.entries.first()
        if (a.target.id == newMember.id || a.target.id == oldMember.id) {
            return a;
        } else {
            return null;
        }
    }).catch(() => { return null })

    if (!entry || !entry.changes) return

    var changes = entry.changes
    if (!global.Servers[newMember.guild.id]) global.Servers[newMember.guild.id] = {}
    if (!global.Servers[newMember.guild.id]) global.Servers[newMember.guild.id].modlog = {}

    var modLogChannel = await global.Servers[newMember.guild.id].modlog
    if (modLogChannel == null || !newMember.guild.channels.cache.has(modLogChannel)) return;

    modLogChannel = newMember.guild.channels.cache.get(modLogChannel)

    var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':satellite: Member Updated').setDescription(`Executor: ${entry.executor}`).setThumbnail(entry.target.displayAvatarURL({ format: "png", size: 512, dynamic: true }))

    for (var change of changes) {
        switch (change.key) {
            case '$remove':
                embed.description += `\n\n:chart_with_downwards_trend: Role Removed:\n\t- \`${change.new[0].name}\``
                break;
            case '$add':
                embed.description += `\n\n:chart_with_upwards_trend: Role Added:\n\t- \`${change.new[0].name}\``
                break;
            case 'nick':
                embed.setTitle(':satellite: Nickname Update');
                var newNick = change.new == undefined ? entry.target.username : change.new;
                var oldNick = change.old == undefined ? entry.target.username : change.old;
                embed.description += `\n\n:file_folder: Old Nickname: \`${oldNick}\`\n:file_folder: New Nickname: \`${newNick}\``
                break;
        }
    }

    embed.description += `\n\nTarget: ${entry.target.tag}`
    modLogChannel.send(embed)
})

client.on('channelCreate', async channel => {
    if (!channel || !channel.guild || !channel.guild.me) return;
    if (!channel.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[channel.guild.id]) global.Servers[channel.guild.id] = {}
    if (!global.Servers[channel.guild.id].modlog) global.Servers[channel.guild.id].modlog = {}

    if (channel.type == "dm") return;

    var modLogChannel = global.Servers[channel.guild.id].modlog
    if (modLogChannel == null || !channel.guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = channel.guild.channels.cache.get(modLogChannel)

    const entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' }).then(audit => {
        var a = audit.entries.first()
        if (Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    })

    if (!entry) return

    var changes = entry.changes

    if (entry.reason == "nuke") return

    var details = `\n\n\n\n:rocket: Channel name: \`${channel.name}\`\n\n:question: Channel Type: \`${channel.type}\`\n\n:man_judge: Executor: ${entry.executor}`

    var embed = new Discord.MessageEmbed().setTitle(":satellite: Channel Created").setColor('3d7b2f').setDescription(details);
    if (channel.guild.iconURL()) {
        embed.setThumbnail(channel.guild.iconURL({ size: 128, format: "png", dynamic: true }))
    } else {
        embed.setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
    }
    modLogChannel.send(embed)
})

client.on('channelDelete', async channel => {
    if (!channel.guild.me) return;
    if (!channel.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[channel.guild.id]) global.Servers[channel.guild.id] = {}
    if (!global.Servers[channel.guild.id]) global.Servers[channel.guild.id].modlog = {}

    if (channel.type == "dm") return;

    const entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).then(audit => {
        var a = audit.entries.first()
        if (Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    })

    if (!entry) return

    if (entry.reason == "nuke") return

    var modLogChannel = global.Servers[channel.guild.id].modlog
    if (modLogChannel == null || !channel.guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = channel.guild.channels.cache.get(modLogChannel)


    var details = `\n\n\n\n:file_folder: Channel name: \`${channel.name}\`\n\n:question: Channel Type: \`${channel.type}\`\n\n:man_judge: Executor: ${entry.executor}`

    var embed = new Discord.MessageEmbed().setTitle("Channel Deleted").setColor('3d7b2f').setDescription(details);
    if (channel.guild.iconURL()) {
        embed.setThumbnail(channel.guild.iconURL({ size: 128, format: "png", dynamic: true }))
    } else {
        embed.setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
    }
    modLogChannel.send(embed)
})

client.on('guildBanAdd', async (guild, user) => {
    if (!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
    if (!global.Servers[guild.id]) global.Servers[guild.id].modlog = {}

    const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then(audit => {
        var a = audit.entries.first()
        if (a.target.id == user.id && Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    })

    if (!entry) return;

    var modLogChannel = global.Servers[guild.id].modlog
    if (modLogChannel == null || !guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = guild.channels.cache.get(modLogChannel)

    var embed = new Discord.MessageEmbed()
        .setTitle("<a:banHammer:758603864978489374> User Banned").setColor("3d7b2f")
        .setThumbnail(user.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
        .setDescription(`:hammer: Banned user: \`${entry.target.tag}\`\n\n:question: Reason: \`${entry.reason == null ? "Unspecified" : entry.reason}\`\n\n:man_judge: Executor: ${entry.executor}`)

    modLogChannel.send(embed)

})

client.on('guildBanRemove', async (guild, user) => {
    if (!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
    if (!global.Servers[guild.id]) global.Servers[guild.id].modlog = {}

    const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_REMOVE' }).then(audit => {
        var a = audit.entries.first()
        if (a.target.id == user.id && Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    })

    if (!entry) return;

    var modLogChannel = global.Servers[guild.id].modlog
    if (modLogChannel == null || !guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = guild.channels.cache.get(modLogChannel)

    var embed = new Discord.MessageEmbed()
        .setTitle("<a:banHammer:758603864978489374> Ban Revoked").setColor("3d7b2f")
        .setThumbnail(user.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
        .setDescription(`:hammer: User: \`${entry.target.tag}\`\n\n:man_judge: Executor: ${entry.executor}`)

    modLogChannel.send(embed)
})

client.on('messageDelete', async message => {
    if (message.channel.type == "dm") return;
    if (!message.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id].modlog = {}

    var authorID = message.author ? message.author.id : null;

    const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then(audit => {
        var a = audit.entries.first()
        if (authorID) {
            if (a.target.id == message.author.id && Date.now() - a.createdTimestamp < 20000) {
                return a
            } else {
                return null
            }
        }
        else {
            return false;
        }

    })

    if (entry === false) return;

    var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(":x: Message Deleted")

    var modLogChannel = global.Servers[message.guild.id].modlog
    if (modLogChannel == null || !message.guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = message.guild.channels.cache.get(modLogChannel)

    if (entry) {
        embed.setDescription(`:bust_in_silhouette: Message Author: ${entry.target}\n\n:loudspeaker: Message Location: <#${message.channel.id}>\n\n:man_judge: Executor: ${entry.executor}\n\n💬 Message Content: ${message.content}`)
    } else {
        embed.setDescription(`:bust_in_silhouette: Message Author: ${message.member}\n\n:loudspeaker: Message Location: <#${message.channel.id}>\n\n:man_judge: Executor: Deleted By Author\n\n💬 Message Content: ${message.content}`)
    }

    modLogChannel.send(embed)
})

client.on('roleCreate', async (role) => {
    if (!role.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[role.guild.id]) global.Servers[role.guild.id] = {}
    if (!global.Servers[role.guild.id]) global.Servers[role.guild.id].modlog = {}

    const entry = await role.guild.fetchAuditLogs({ type: 'ROLE_CREATE' }).then(audit => {
        var a = audit.entries.first()
        if (a.target.id == role.id && Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    }).catch(() => { return null })


    if (!entry) return;

    var modLogChannel = global.Servers[role.guild.id].modlog
    if (modLogChannel == null || !role.guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = role.guild.channels.cache.get(modLogChannel)


    var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(":rocket: Role Created")
        .setDescription(`:hash: Role Name: \`${entry.target.name}\`\n\n:rainbow:  Role Color: ${entry.target.hexColor}\n\n:man_judge: Executor: ${entry.executor}`)
        .setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))

    modLogChannel.send(embed)
})

client.on('roleDelete', async (role) => {
    if (!role.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    if (!global.Servers[role.guild.id]) global.Servers[role.guild.id] = {}
    if (!global.Servers[role.guild.id]) global.Servers[role.guild.id].modlog = {}

    const entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).then(audit => {
        var a = audit.entries.first()
        if (a.target.id == role.id && Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    }).catch(() => { return null })

    if (!entry) return;

    var modLogChannel = global.Servers[role.guild.id].modlog
    if (modLogChannel == null || !role.guild.channels.cache.has(modLogChannel)) return;
    modLogChannel = role.guild.channels.cache.get(modLogChannel)

    var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(":x: Role Deleted")
        .setDescription(`:hash: Role Name: \`${role.name}\`\n\n:man_judge: Executor: ${entry.executor}`)
        .setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))

    modLogChannel.send(embed)
})

client.on('roleUpdate', async (oldRole, newRole) => {
    if (!newRole.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    const entry = await newRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' }).then(audit => {
        var a = audit.entries.first()
        if (a.target.id == newRole.id && Date.now() - a.createdTimestamp < 20000) {
            return a
        } else {
            return null
        }
    }).catch(() => { return null })

    if (!entry || !entry.changes || !entry.changes[0]) return

    var changes = entry.changes

    if (!global.Servers[newRole.guild.id]) global.Servers[newRole.guild.id] = {}
    if (!global.Servers[newRole.guild.id]) global.Servers[newRole.guild.id].modlog = {}

    var modLogChannel = await global.Servers[newRole.guild.id].modlog
    if (modLogChannel == null || !newRole.guild.channels.cache.has(modLogChannel)) return;

    modLogChannel = newRole.guild.channels.cache.get(modLogChannel)

    var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':satellite: Role Updated').setDescription(`Executor: ${entry.executor}`)

    if (oldRole.permissions != newRole.permissions) {
        var oldPerms = oldRole.permissions.serialize();
        var newPerms = newRole.permissions.serialize();

        var permsGained = []
        var permsLost = []

        for (var [key, elm] of Object.entries(oldPerms)) {
            if (newPerms[key] !== elm) {
                if (newPerms[key]) {
                    permsGained.push(key)
                } else {
                    permsLost.push(key)
                }
            }
        }

        if (permsGained.length > 0) {
            embed.description += `\n\nPermissions Gained: ${permsGained.map(p => `\`${p}\``)}`
        }

        if (permsLost.length > 0) {
            embed.description += `\n\nPermissions Revoked: ${permsLost.map(p => `\`${p}\``)}`
        }
    }

    for (var change of changes) {
        switch (change.key) {
            case 'name':
                embed.description += `\n\nName Changed: \`${change.old}\` >> \`${change.new}\``
                break;
            case 'color':
                embed.description += `\n\nColor Changed: \`#${decimalToHexString(change.old)}\` >> \`#${decimalToHexString(change.new)}\``
                break;
            case 'hoist':
                embed.description += `\n\nDisplay Separaetly: \`${change.old}\` >> \`${change.new}\``
                break;
            case 'mentionable':
                embed.description += `\n\nCan be @mentioned by anyone: \`${change.old}\` >> \`${change.new}\``
                break;
        }
    }


    embed.description += `\n\nTarget Role: ${entry.target}`
    modLogChannel.send(embed)
    return;
})



client.on('channelUpdate', async (oldC, newC) => {
    if (oldC.type == "dm" || newC.type == "dm") return;

    var guild = client.guilds.cache.get(newC.guild.id)

    if (!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;

    var entry = null

    const sArr = ['CHANNEL_OVERWRITE_UPDATE', 'CHANNEL_UPDATE', 'CHANNEL_OVERWRITE_CREATE', 'CHANNEL_OVERWRITE_DELETE']

    for (var i = 0; i < 3; i++) {
        if (entry != null) break;

        entry = await guild.fetchAuditLogs({ type: sArr[i] }).then(audit => {
            var a = audit.entries.first()
            if (Date.now() - a.createdTimestamp < 20000) {
                //console.log(a)
                return a
            }
            else {
                return null
            }
        }).catch(() => { return null })
    }

    if (!entry || !entry.changes) return

    var changes = entry.changes

    if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
    if (!global.Servers[guild.id]) global.Servers[guild.id].modlog = {}

    var modLogChannel = await global.Servers[guild.id].modlog
    if (modLogChannel == null || !guild.channels.cache.has(modLogChannel)) return;

    modLogChannel = guild.channels.cache.get(modLogChannel)

    var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':rotating_light: Channel Updated').setDescription(`Executor: ${entry.executor}\n\n`)

    var msg = ""
    for (var change of changes) {
        //var title = change.key.split('_').join(' ').toUpperCase()
        switch (change.key) {
            case "allow":
            case "deny":


                //Sort channel overwrites to a nicer object :)
                var perms = {}
                for (var ow of entry.target.permissionOverwrites.array()) {
                    perms[ow.id] = {
                        deny: ow.deny.bitfield,
                        allow: ow.allow.bitfield
                    }
                }

                //Get affected role
                var r = getKeyByValue(perms, change.new)


                var oldO = new Discord.Permissions(change.old).serialize()
                var newO = new Discord.Permissions(change.new).serialize()

                var diffN = []
                var diffO = []

                for (var [key, elm] of Object.entries(oldO)) {
                    if (newO[key] !== elm) {
                        if (newO[key]) {
                            diffN.push(key)
                        }
                        else {
                            diffO.push(key)
                        }
                    }
                }

                if (diffN.length > 0) {

                    if (!msg.includes("Permission Overwrite Updated")) msg += `:inbox_tray: Permission Overwrite Updated:\n\t`
                    if (!msg.includes(r)) {
                        msg += `<@${guild.members.cache.has(r) ? "" : '&'}${r}> -\n`
                    }

                    msg += "\t" + (change.key == "deny" ? "Denied" : "Allowed") + ` Permissions: ${diffN}\n\n`
                }
                break;
            case "name":
                msg += `:globe_with_meridians: Channel Name: \`${change.old}\` >> \`${change.new}\`\n\n`
                break;
            case "rate_limit_per_user":
                var oldL = change.old == 0 ? "Off" : SecondsToMaxTimeUnit(change.old)

                var newL = change.new == 0 ? "Off" : SecondsToMaxTimeUnit(change.new)

                msg += `:alarm_clock: Slowmode: \`${oldL}\` >> \`${newL}\`\n\n`
                break;
            case "nsfw":
                msg += `:underage: NSFW: \`${change.old}\` >> \`${change.new}\`\n\n`
                break;
            case "topic":
                msg += `:scroll: Topic: \`${change.old ? change.old : "unset"}\` >> \`${change.new ? change.new : "unset"}\`\n\n`
                break;
            case "type":
                var cTypes = ["GUILD_TEXT", "DM", "GUILD_VOICE", "GROUP_DM", "GUILD_CATEGORY", "GUILD_NEWS", "GUILD_STORE"]
                msg += `:question: Channel Type: \`${cTypes[change.old]}\` >> \`${cTypes[change.new]}\`\n\n`
                break;
        }
    }



    embed.description += msg + `Target Channel: ${entry.target.type == "voice" ? `\`${entry.target.name}\`` : entry.target}`
    modLogChannel.send(embed)
})


//#endregion

function getKeyByValue(object, valueToFind) {
    return Object.keys(object).find(key => Object.keys(object[key]).find(key_ => object[key][key_] == valueToFind));
}

function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function SecondsToMaxTimeUnit(seconds) {
    if (seconds > 60 * 60) {
        return seconds / (60 * 60) + "h"
    } else if (seconds > 60) {
        return seconds / 60 + "m"
    } else {
        return seconds + "s"
    }
}

function SaveTo(path, data) {
    firebase.database().ref(path).set(data)
}
global.SaveTo = SaveTo;

Array.prototype.hasDupes = function() {
    return !(this.length === new Set(this).size);
}

const crypto = require('crypto');

const algorithm = 'aes-256-ctr';

const secretKey = process.env.encCode.toString();

/**
 * Encrypts a string.
 * @param text The string to be encrypted.
 */
function encrypt(text) {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};


/**
 * Decrypts a hash.
 * @param hash The hash to be decrypted
 */
function decrypt(hash) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};