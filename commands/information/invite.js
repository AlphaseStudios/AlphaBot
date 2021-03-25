const Discord = require('discord.js');

module.exports = {
    name: 'invite',
    description: 'Get the bots invite link.',
    execute(client, message, args) {
        message.channel.send("Heres my invitelink:\nhttps://discord.com/oauth2/authorize?client_id=687228371016351760&scope=bot&permissions=8");
    },
};