const Discord = require('discord.js');

module.exports = {
    name: 'leveling',
    usage: '<togglemsg|msg|multiplier|channel|events>',
    description: 'Configure the leveling mechanics.',
    guildOnly: true,
    execute(client, message, args) {
        var guild = message.guild.id;
        if (!message.member.hasPermission("ADMINISTRATOR")) return;

        if (!global.Servers[guild]) global.Servers[guild] = {}
                

        switch (args[0]) {
            case "msg":
                var msg = args.filter(arg => args.indexOf(arg) > 1).join(" ");
                if (msg != "") {
                    global.Servers[guild].lvlMsg = msg;
                    message.channel.send(`Set the level up message to \`${msg}\`!`)
                } else {
                    delete global.Servers[guild].lvlMsg;
                    message.channel.send(`Set the level up message to \`default message\`!`)
                }
                message.channel.send(`Tip: You can use {user} to reference the user and {level} to reference the level`)
                firebase.database().ref().child("Servers").update(global.Servers)
                break;
            case "togglemsg":
                if (!global.Servers[guild].shoutLvl) {
                    global.Servers[guild].shoutLvl = true;
                } else {
                    global.Servers[guild].shoutLvl = false;
                }
                message.channel.send(`Set the \`Send Level Up message\` setting to  \`${global.Servers[guild].shoutLvl}\``)
                firebase.database().ref().child("Servers").update(global.Servers)
                break;
            case "channel":
                if (!message.mentions.channels.first()) {
                    delete global.Servers[guild].shoutC
                    message.channel.send("The Bot will now send a level up message in the same channel as the user level up in!")
                } else {
                    global.Servers[guild].shoutC = message.mentions.channels.first().id
                    message.channel.send(`The bot will now send level-up messages in ${message.mentions.channels.first()}!`)
                }
                firebase.database().ref().child("Servers").update(global.Servers)
                break;
            case "multiplier":
                var arg = parseFloat(args[1]);
                if (!isNaN(arg)) {
                    if (arg < 0.5 || arg > 2) {
                        message.channel.send("The Multiplier cannot be bigger than 2 or smaller than 0.5!")
                    }
                    global.Servers[guild].multiplier = arg;
                    message.channel.send(`Set the multiplier to \`x${arg}\`!`)
                    firebase.database().ref().child("Servers").update(global.Servers)

                }
                break;
            case "events":
                if (global.Servers[guild].events) {
                    global.Servers[guild].events = false
                } else {
                    global.Servers[guild].events = true;
                }

                message.channel.send(`Changed the enable events setting to: \`${global.Servers[guild].events}\``)
                firebase.database().ref().child("Servers").update(global.Servers)
                break;
            default:
                var lMsg, multiplier, channel, togglemsg, eventsSetting;

                if (!global.Servers[guild].lvlMsg) lMsg = `Default message`
                else lMsg = global.Servers[guild].lvlMsg;

                if (global.Servers[guild].multiplier) multiplier = global.Servers[guild].multiplier;
                else multiplier = 1

                if (!global.Servers[guild].shoutC) channel = "Not set"
                else channel = message.guild.channels.cache.get(global.Servers[guild].shoutC).name;

                if (global.Servers[guild].shoutLvl) togglemsg = true
                else togglemsg = false;

                if (global.Servers[guild].events) eventsSetting = true;
                else eventsSetting = false;

                var embed = new Discord.MessageEmbed()
                    .setTitle(`${message.guild.name}'s Leveling system preferences`)
                    .setColor("#FF0000")
                    .setDescription(`
                    Level-up message: ${lMsg}\n\n
                    Level-up message channel: \`${channel}\`\n\n
                    Send Level-up message: \`${togglemsg}\`\n\n
                    Multiplier: \`x${multiplier}\`\n\n
                    Enable Events: \`${eventsSetting}\`
                `)
                message.channel.send(embed);
                break;
        }
    },
};