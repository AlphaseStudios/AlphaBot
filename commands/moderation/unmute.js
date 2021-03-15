const Discord = require("discord.js")
module.exports = {
    name: 'unmute',
    description: 'Unmute someone.',
    aliases: ['remmute'],
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("MUTE_MEMBERS")) return false;
        var target = message.mentions.members.first();
        if (!target) {
            message.channel.send("You need to mention a member!")
        }
        if (!global.Users[message.guild.id] || !global.Users[message.guild.id][target.id] || global.Users[message.guild.id][target.id].roles.length == 0) {
            message.channel.send("This member is not muted!")
        }

        try {
            var r = message.guild.roles.cache.get(global.Servers[message.guild.id].mute);
            target.roles.remove(r)
            global.Users[message.guild.id][target.id].roles.forEach(element => { target.roles.add(element) });
            global.Users[message.guild.id][target.id].roles = []
            message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(`Successfully Unmuted ${target.user.tag}!`))
            firebase.database().ref().child('Users').update(global.Users)
        }
        catch (e) {
            message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(`Something went wrong!`).setDescription("Please try again..."))
        }
    },
};