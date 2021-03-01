const Discord = require('discord.js');

module.exports = {
    name: 'vote',
    description: 'Vote for our bot on top.gg!',
    execute(client, message, args) {
        var embed = new Discord.MessageEmbed()
            .setColor("#FF0000")
            .setTitle("Upvote 51st Bot at")
            .setDescription(`top.gg - [here](https://top.gg/bot/687228371016351760/vote)`)
        message.channel.send(embed)
    }
}