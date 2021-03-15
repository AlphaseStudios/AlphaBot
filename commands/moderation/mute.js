const Discord = require('discord.js')
const firebase = require('firebase-admin')
var db = firebase.database()

module.exports = {
    name: 'mute',
    description: 'Mutes a member.',
    aliases: ['shut'],
    usage: '<@member>',
    guildOnly: true,
    execute(client, message, args) {
        if (!message.mentions.members.first() || !message.member.hasPermission("MUTE_MEMBERS")) return null;
        var target = message.mentions.members.first();
        if (!target) {
            message.channel.send("You need to mention a target!")
            return;
        }
        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

        if (!global.Servers[message.guild.id].mute || !message.guild.roles.cache.has(global.Servers[message.guild.id].mute)) {
            message.guild.roles.create({
                data: {
                    name: "Mute",
                    permissions: ['READ_MESSAGE_HISTORY', 'ADD_REACTIONS']
                }
            }).then(role => {
                global.Servers[message.guild.id].mute = role.id;
                db.ref("Servers/").child(message.guild.id).update(global.Servers[message.guild.id])
                target.roles.add(role)
            })
        }
        else {
            var r = global.Servers[message.guild.id].mute
            target.roles.add(r)
        }

        var roles = []
        let roleArr = target.roles.cache.array()

        roleArr.forEach(element => {

            if (element != message.guild.roles.everyone) {
                roles.push(element.id)
                target.roles.remove(element);
            }
        });

        if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {}
        if (!global.Users[message.guild.id][target.id]) global.Users[message.guild.id][target.id] = {}
        global.Users[message.guild.id][target.id].roles = roles;
        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(`Successfully Muted ${target.user.tag}!`))
        firebase.database().ref().child('Users').update(global.Users)
    }
};