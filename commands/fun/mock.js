const Discord = require('discord.js');
const utils = require('../../utils.js');

module.exports = {
    name: 'mock',
    args: -1,
    usage: '<message>',
    description: 'Mock a message!',
    stats: true,
    execute(client, message, args) {
        var Tmsg = args.join(" ")
        var fMsg = "";
        for (var i = 0; i < Tmsg.length; i++) {
            if (i % 2 == 0) {
                fMsg += Tmsg[i].toLowerCase();
            } else {
                fMsg += Tmsg[i].toUpperCase();
            }
        }
        var msg = `${Discord.Util.removeMentions(fMsg)}\n\n- ${message.author.tag}, ${new Date().getFullYear()}`;
        message.channel.send(msg);
        message.delete();
    }
}