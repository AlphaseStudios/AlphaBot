const Discord = require('discord.js');

module.exports = {
    name: 'say',
    usage: '<message>',
    args: -1,
    description: 'Makes the bot say something.',
    execute(client, message, args) {
        args = Discord.Util.removeMentions(args)
        const embed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Say')
            .setDescription(args.join(" "))
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));
        message.channel.send(embed)
    },
};