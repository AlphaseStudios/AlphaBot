const Discord = require("discord.js")
module.exports = {
    name: 'geninvite',
    description: 'Generates you a guild invite link.',
    guildOnly: true,
    execute(client, message, args) {
        inv = message.channel.createInvite()
            .then(invite => {
                message.channel.send(`Heres a invite link to this server: ${invite.url}.`)
            })
            .catch(console.error);
    },
};