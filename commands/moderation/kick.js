const Discord = require('discord.js');

module.exports = {
    name: 'kick',
    usage: '<@user> [reason]',
    args: 1,
    guildOnly: true,
    description: 'Kick a member from this server.',
    execute(client, message, args) {
        if (!message.member.hasPermission("KICK_MEMBERS")) return;
        if (!message.mentions.members.first() || !message.mentions.members.first().kickable) { message.channel.send("Please mention a member I can kick!"); return; }
        var reason = "No reason specified.";
        if (args.length > 2) reason = args.filter(arg => args.indexOf(arg) > 1 && !arg.includes(message.mentions.members.first().id)).join(" ")
        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(`Kicked ${message.mentions.members.first().user.tag}!`).setDescription(`Reason: ${reason}`))
        message.mentions.members.first().kick({ reason: reason })
    },
};