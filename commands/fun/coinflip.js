const Discord = require('discord.js');
const utils = require('../../utils.js');

module.exports = {
    name: 'coinflip',
    stats: true,
    aliases: ['cflip', 'cp'],
    description: 'Flip a coin!',
    execute(client, message, args) {
        var rnd = Math.floor(Math.random() * 2)
        rnd = rnd == 1 ? "Tails! :credit_card:" : "Heads! :moyai:"

        message.channel.send(rnd)
    }
}