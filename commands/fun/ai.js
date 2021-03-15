const utils = require('../../utils.js');

module.exports = {
    name: 'ai',
    stats: true,
    description: 'Whats your chance of surviving?',
    execute(client, message, args) {
        var embed = new Discord.MessageEmbed()
            .setTitle("AI Has overtaken the world!")
            .setDescription(`Your chance of surviving is: ${Math.floor(Math.random() * 100)}%`)
            .setColor("#FF0000");
        message.channel.send(embed);
    }
}