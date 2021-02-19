var Discord = require('discord.js')


/**
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 */

exports.run = (message) => {
    if (!message.member.hasPermission("MUTE_MEMBERS")) return false;
    var target = message.mentions.members.first();
    if (!target)
    {
        message.channel.send("You need to mention a member!")
        return false;
    }
    if (!global.Users[message.guild.id] || !global.Users[message.guild.id][target.id] || global.Users[message.guild.id][target.id].roles.length == 0) {
        message.channel.send("This member is not muted!")
        return false;
    }

    try {
        var r = message.guild.roles.cache.get(global.Servers[message.guild.id].mute);
        target.roles.remove(r)
        
        global.Users[message.guild.id][target.id].roles.forEach(element => {
            target.roles.add(element)
        });

        global.Users[message.guild.id][target.id].roles = []

        message.channel.send(new Discord.MessageEmbed().setColor("3D7B2F").setTitle(`Successfully Unmuted ${target.user.tag}!`))
        return true;
    } 
    catch (e) { 
        message.channel.send(new Discord.MessageEmbed().setColor("3D7B2F").setTitle(`Something went wrong!`).setDescription("Please try again..."))
        return false;
    }
}


exports.help = {
    name: "unmute"
}