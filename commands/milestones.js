var Discord = require('discord.js')
var firebase = require('firebase-admin')

if (firebase.apps.length == 0) {
    // Firebase initialization
    firebase.initializeApp({
        credential: firebase.credential.cert("/../ultraSectertKeyYouShouldNotSee.json"),
        databaseURL: "https://discordbot-58332.firebaseio.com"
    });
}


var db = firebase.database()

/**
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 */

exports.run = (message, args) => {
    if (!message.member.hasPermission("MANAGE_GUILD")) return false;
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
    
    if (!args[1])
    {
        if (!global.Servers[message.guild.id].milestones || Object.keys(global.Servers[message.guild.id].milestones).length <= 0) message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription("There are no milestones in this server!"))
        else {
            var msg = "\n\n";
            var _keys = Object.keys(global.Servers[message.guild.id].milestones);
            for (var _key in global.Servers[message.guild.id].milestones)
            {
                msg += `At level \`${_key}\`:\n\n<@&${global.Servers[message.guild.id].milestones[_key]}>\n\n`
            }
            message.channel.send(new Discord.MessageEmbed()
            .setTitle(`Milestones in ${message.guild.name}:`)
            .setColor("3d7b2f")
            .setDescription(msg))
        }
        return false;
    }
    else if (args[1] == "add") {
        if (!message.mentions.roles.first()) { message.channel.send("Please mention a role!"); return false; }
        if (isNaN(parseInt(args[3]))) { message.channel.send("Please mention a level!"); return false; }
        if (parseInt(args[3]) > 24 || parseInt(args[3]) < 0) { message.channel.send("Please mention a level between 0 and 24!"); return false; }

        if (!global.Servers[message.guild.id].milestones) global.Servers[message.guild.id].milestones = {}
        global.Servers[message.guild.id].milestones[parseInt(args[3]).toString()] = message.mentions.roles.first().id;

        message.channel.send(new Discord.MessageEmbed()
        .setColor('3d7b2f')
        .setDescription(`Now users will get the ${message.mentions.roles.first()} role at level ${parseInt(args[3])}!`))

        return true;
    }
}

exports.help = {
    name: "milestones"
}