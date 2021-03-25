const Discord = require('discord.js');
const firebase = require('firebase-admin');

module.exports = {
    name: 'auditlog',
    description: 'Define the auditlog channel.',
    aliases: ['modlog'],
    usage: '<#text-channel|d> (d = Unset channel)',
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return;
        if (args[0] == "d") {
            if (!global.Servers[message.guild.id]) return;
            if (!global.Servers[message.guild.id].modlog) return;
            var temp = new Discord.MessageEmbed()
                .setTitle("Task Successful!")
                .setDescription("The bot will no longer send logs.")
                .setColor("#FF0000");
            message.channel.send(temp)
            delete global.Servers[message.guild.id].modlog
            firebase.database().ref().child("Servers").update(global.Servers)
        }
        if (message.mentions.channels.first()) {
            var temp = new Discord.MessageEmbed()
                .setTitle("Task Successful!")
                .setDescription(`The bot will now send logs in ${message.mentions.channels.first().name}`)
                .setColor("#FF0000");
            message.channel.send(temp)
            global.Servers[message.guild.id].modlog = message.mentions.channels.first().id
            firebase.database().ref().child("Servers").update(global.Servers)
        }
        var msg = "The bot doesn't send logs anywhere!"
        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
        if (global.Servers[message.guild.id].modlog) {
            msg = `The bot sends logs in <#${global.Servers[message.guild.id].modlog}>`
        }
        message.channel.send(new Discord.MessageEmbed().setColor('3d7b2f').setDescription(msg))
    },
};