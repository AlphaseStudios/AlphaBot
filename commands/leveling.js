const Discord = require('discord.js');

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 */

exports.run = (args, message) => {
    var guild = message.guild.id;
    if (!message.member.hasPermission("ADMINISTRATOR")) return;

    switch (args[1]) {
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
            return true;
            break;
        case "togglemsg":
            if (!global.Servers[guild].shoutLvl) {
                global.Servers[guild].shoutLvl = true;
            } else {
                global.Servers[guild].shoutLvl = false;
            }
            message.channel.send(`Set the \`Send Level Up message\` setting to  \`${global.Servers[guild].shoutLvl}\``)
            return true;
            break;
        case "channel":
            if (!message.mentions.channels.first()) {
                delete global.Servers[guild].shoutC
                message.channel.send("The Bot will now send a level up message in the same channel as the user level up in!")
            } else {
                global.Servers[guild].shoutC = message.mentions.channels.first().id
                message.channel.send(`The bot will now send level-up messages in ${message.mentions.channels.first()}!`)
            }
            return true;
            break;
        case "multiplier":
            var arg = parseFloat(args[2]);
            if (!isNaN(arg)) {
                if (arg < 0.5 || arg > 2) {
                    message.channel.send("The Multiplier cannot be bigger than 2 or smaller than 0.5!")
                    return false;
                }
                global.Servers[guild].multiplier = arg;
                message.channel.send(`Set the multiplier to \`x${arg}\`!`)
                return true;
            }
            return false;
            break;
        case "events":
            if (global.Servers[guild].events) {
                global.Servers[guild].events = false
            } else {
                global.Servers[guild].events = true;
            }

            message.channel.send(`Changed the enable events setting to: \`${global.Servers[guild].events}\``)
            return true;
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
                .setColor("#3D7B2F")
                .setDescription(`
                    Level-up message: ${lMsg}\n\n
                    Level-up message channel: \`${channel}\`\n\n
                    Send Level-up message: \`${togglemsg}\`\n\n
                    Multiplier: \`x${multiplier}\`\n\n
                    Enable Events: \`${eventsSetting}\`
                `)
            message.channel.send(embed);
            return false;
            break;
    }
}

exports.help = {
    name: "leveling"
}