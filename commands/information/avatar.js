const Discord = require('discord.js');

module.exports = {
    name: 'avatar',
    aliases: ['pfp', 'profilepicture'],
    usage: '<@user>',
    args: 1,
    description: 'Gives you a users avatar.',
    execute(client, message, args) {
        var target = message.mentions.members.first() ? message.mentions.members.first().user : message.author;
        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(`${target.tag}'s PFP:`).setImage(target.displayAvatarURL({ format: "png", size: 512, dynamic: true })))
    }
}