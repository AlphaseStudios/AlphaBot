const Discord = require('discord.js')

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 */

exports.run = (message, args) => {
    var usrCount = message.guild.members.cache.filter(mmbr => !mmbr.user.bot).size;
    if (args[1] == "c")
    {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return;
        message.guild.channels.create(`Member Count: ${usrCount}`, {type: 'voice'}).catch(err => { message.channel.send("Unable to create channel!") }).then(vc => {
            vc.setPosition(0);
            vc.updateOverwrite(message.guild.roles.everyone, {CONNECT: false}).then(() => { message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setTitle("Channel Created Successfully!"))})
        })
    }
    else {
        message.channel.send(new Discord.MessageEmbed().setDescription(`This server, ${message.guild.name}, has a total of ${message.guild.members.cache.size} members, out of them ${message.guild.members.cache.size - usrCount} are bots and ${usrCount} are actual, living, human beings.`).setFooter("I assume...").setColor("3d7b2f"))
    }
}

exports.help = {
    name: "members"
}