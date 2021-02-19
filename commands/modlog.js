const Discord = require('discord.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 */

exports.run = (message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return false;
    if (args[1] == "d")
    {
        if (!global.Servers[message.guild.id]) return false;
        if (!global.Servers[message.guild.id].modlog) return false;
        var temp = new Discord.MessageEmbed()
            .setTitle("Task Successful!")
            .setDescription("The bot will no longer send logs.")
            .setColor("#3D7B2F");
        message.channel.send(temp)
        delete global.Servers[message.guild.id].modlog
        return true
    }
    if (message.mentions.channels.first())
    {
        var temp = new Discord.MessageEmbed()
            .setTitle("Task Successful!")
            .setDescription(`The bot will now send logs in ${message.mentions.channels.first()}`)
            .setColor("#3D7B2F");
        message.channel.send(temp)
        global.Servers[message.guild.id].modlog = message.mentions.channels.first().id
        return true
    }
    var msg = "The bot doesn't send logs anywhere!"
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
    if (global.Servers[message.guild.id].modlog) {
        msg = `The bot sends logs in <#${global.Servers[message.guild.id].modlog}>`
    }
    message.channel.send(new Discord.MessageEmbed().setColor('3d7b2f').setDescription(msg))
    return false

}

exports.help = {
    name: "modlog"
}