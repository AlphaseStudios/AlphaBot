const Discord = require('discord.js');

module.exports = {
    name: 'embed',
    args: 0,
    guildOnly: true,
    description: 'Make a nice embed for your server.',
    execute(client, message, args) {
        message.channel.send('')
    },
};