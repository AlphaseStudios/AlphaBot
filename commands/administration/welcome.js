const Discord = require("discord.js")
module.exports = {
    name: 'welcome',
    description: 'Customize the welcome-message.',
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return;
        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
        switch (args[0]) {
            case "wc":
                if (!message.mentions.channels.first()) {
                    var temp = new Discord.MessageEmbed()
                        .setTitle("You Need To Mention a Channel!")
                        .setColor("#FF0000");
                    message.channel.send(temp);
                    return;
                }

                global.Servers[message.guild.id].wchannel = message.mentions.channels.first().id.toString();
                var temp = new Discord.MessageEmbed()
                    .setTitle(`Set The Welcome channel to #${message.mentions.channels.first().name} successfully!`)
                    .setColor("#FF0000");
                message.channel.send(temp)
                break;

            case "fc":
                if (!message.mentions.channels.first()) {
                    var temp = new Discord.MessageEmbed()
                        .setTitle("You Need To Mention a Channel!")
                        .setColor("#FF0000");
                    message.channel.send(temp);
                    return;
                }

                global.Servers[message.guild.id].fchannel = message.mentions.channels.first().id.toString();
                var temp = new Discord.MessageEmbed()
                    .setTitle(`Set The Farewell channel to #${message.mentions.channels.first().name} successfully!`)
                    .setColor("#FF0000");
                message.channel.send(temp)
                break;

            case "f":
                var msg = ''
                for (var i = 1; i < args.length; i++) {
                    msg += args[i]
                    if (i != args.length - 1) {
                        msg += " ";
                    }
                }
                if (args[0] == null) {
                    msg = "Default Message"
                }
                global.Servers[message.guild.id].fMsg = msg;
                var embed = new Discord.MessageEmbed()
                    .setTitle("Task Successful!")
                    .setDescription(`Successfully Set The Farewell Message to "${msg}"!`)
                    .setColor("#FF0000")
                    .setFooter("Tip: You can user {user} to display the user's name and {server} to display the server's name");
                message.channel.send(embed);
                break;

            case "w":
                var msg = ''
                for (var i = 1; i < args.length; i++) {
                    msg += args[i]
                    if (i != args.length - 1) {
                        msg += " ";
                    }
                }
                if (args[1] == null) {
                    msg = "Default Message"
                }
                global.Servers[message.guild.id].wMsg = msg;
                var embed = new Discord.MessageEmbed()
                    .setTitle("Task Successful!")
                    .setDescription(`Successfully Set The Welcome Message to "${msg}"!`)
                    .setColor("#FF0000")
                    .setFooter("Tip: You can user {user} to display the user's name and {server} to display the server's name");
                message.channel.send(embed);
                break;

            case "t":
                if (!global.Servers[message.guild.id].enableWelcome) {
                    global.Servers[message.guild.id].enableWelcome = 0;
                }

                var temp = new Discord.MessageEmbed()
                    .setColor("#FF0000");

                switch (global.Servers[message.guild.id].enableWelcome) {
                    case 1:
                        global.Servers[message.guild.id].enableWelcome = 0
                        temp.setTitle("Welcome & Farewell Messages are now: disabled")
                        break;
                    case 0:
                        global.Servers[message.guild.id].enableWelcome = 1
                        temp.setTitle("Welcome & Farewell Messages are now: Enabled")
                        break;
                }
                message.channel.send(temp);
                break;

            case "r":
                var temp = new Discord.MessageEmbed()
                    .setColor("#FF0000");
                if (!global.Servers[message.guild.id].role) {
                    global.Servers[message.guild.id].role = message.guild.roles.everyone.id;
                }
                if (!message.mentions.roles.first()) {
                    temp.setTitle(`The Bot Will No Longer Give a Role to newcomers`)
                    global.Servers[message.guild.id].role = message.guild.roles.everyone.id;
                }
                else {
                    temp.setTitle("Task Successful!")
                    temp.setDescription(`The Bot Will Now Give The ${message.mentions.roles.first()} role to newcomers`)
                    global.Servers[message.guild.id].role = message.mentions.roles.first().id;
                }
                message.channel.send(temp)
                break;

            default:
                var w = "Default"
                var f = "Default"
                var wc = "Not Set";
                var fc = "Not Set";
                var s = "Disabled";
                var r = "None";
                if (global.Servers[message.guild.id].wMsg != " " && global.Servers[message.guild.id].wMsg) {
                    w = global.Servers[message.guild.id].wMsg;
                }
                if (global.Servers[message.guild.id].fMsg != " " && global.Servers[message.guild.id].fMsg) {
                    f = global.Servers[message.guild.id].fMsg;
                }
                if (global.Servers[message.guild.id].wchannel) {
                    var temp = message.guild.channels.cache.get(global.Servers[message.guild.id].wchannel);
                    wc = temp != null ? temp : wc;
                }
                if (global.Servers[message.guild.id].fchannel) {
                    var temp = message.guild.channels.cache.get(global.Servers[message.guild.id].fchannel);
                    fc = temp != null ? temp : fc
                }

                if (wc != "Not Set" && fc == "Not Set") {
                    fc = wc
                }
                if (global.Servers[message.guild.id].enableWelcome == 1) {
                    s = "Enabled"
                }
                if (global.Servers[message.guild.id].role) {
                    if (global.Servers[message.guild.id].role != message.guild.roles.everyone.id) {
                        r = message.guild.roles.cache.get(global.Servers[message.guild.id].role)
                    }
                }
                var embed = new Discord.MessageEmbed()
                    .setTitle(`${message.guild.name}'s Welcome & Farewell Preferences`)
                    .setDescription(`Welcome Channel: ${wc}\n\nFarewell Channel: ${fc}\n\nWelcome Message: ${w}\n\nFarewell Message: ${f}\n\nState: ${s}\n\nRole To Give: ${r}`)
                    .setColor("#FF0000");
                message.channel.send(embed);
                break;
        }
        args[0] != null && args[0].match(/\b((w)|(fc)|(wc)|(f)|(r)|(t))\b/gmi) ? firebase.database().ref().child('Servers').update(global.Servers) : null;
    },
};