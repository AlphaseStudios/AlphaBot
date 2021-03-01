const Discord = require('discord.js');
const utils = require('../../utils.js');

module.exports = {
    name: 'clapify',
    aliases: ['clap'],
    usage: '<message>',
    stats: true,
    args: -1,
    description: ':clap: Clapify :clap: something :clap:',
    execute(client, message, args) {
        var msg = ":clap: " + args.join(" :clap: ") + " :clap:"
        msg = Discord.Util.removeMentions(msg)
        message.channel.send(msg + `\n\n- ${message.author.tag}, ${new Date().getFullYear()}`);
        message.delete().catch();
    }
}