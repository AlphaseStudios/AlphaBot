const Discord = require("discord.js")
const firebase = require('firebase-admin')

module.exports = {
    name: 'reminvite',
    description: 'Removes a invite link.',
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return;

        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

        switch (args[0]) {
            case "s":
                global.Servers[message.guild.id].remInvState = global.Servers[message.guild.id].remInvState ? !global.Servers[message.guild.id].remInvState : true
                message.channel.send(`The bot will no${global.Servers[message.guild.id].remInvState ? "w" : " longer"} delete Invite Links!`)

                firebase.database().ref().child("Servers").update(global.Servers)
                break;
            case "roles":

                if (!global.Servers[message.guild.id].allowedInvRoles) global.Servers[message.guild.id].allowedInvRoles = []

                switch (args[1]) {
                    case "a":
                    case "add":
                        if (!message.mentions.roles.first()) {
                            message.channel.send("You need to mention a role!")
                        }

                        var target = message.mentions.roles.first()

                        if (global.Servers[message.guild.id].allowedInvRoles.includes(target.id)) {
                            message.channel.send("This role is already allowed to send invite links!")
                        }

                        global.Servers[message.guild.id].allowedInvRoles.push(target.id)
                        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`Members with the ${target} role will now be able to send invite links!`))
                        firebase.database().ref().child("Servers").update(global.Servers)
                        break;
                    case "d":
                    case "remove":
                    case "delete":
                    case "r":
                        if (!message.mentions.roles.first()) {
                            message.channel.send("You need to mention a role!")
                        }
                        var target = message.mentions.roles.first()
                        if (!global.Servers[message.guild.id].allowedInvRoles.includes(target.id)) {
                            message.channel.send("This role is already unable to send invite links!")
                        }
                        global.Servers[message.guild.id].allowedInvRoles.splice(global.Servers[message.guild.id].allowedInvRoles.indexOf(target.id), 1)
                        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`Members with the ${target} role will not be able to send invite links!`))
                        firebase.database().ref().child("Servers").update(global.Servers)
                        break;
                }
                break;
            case "channels":
                if (!global.Servers[message.guild.id].allowedInvChannels) global.Servers[message.guild.id].allowedInvChannels = []
                switch (args[1]) {
                    case "a":
                    case "add":
                        if (!message.mentions.channels.first()) {
                            message.channel.send("You need to mention a channel!")
                        }
                        var target = message.mentions.channels.first()
                        if (global.Servers[message.guild.id].allowedInvChannels.includes(target.id)) {
                            message.channel.send("Sending invites in this channel is already allowed!")
                        }
                        global.Servers[message.guild.id].allowedInvChannels.push(target.id)
                        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`Sending invite links in ${target} is now allowed!`))
                        firebase.database().ref().child("Servers").update(global.Servers)

                        break;
                    case "d":
                    case "remove":
                    case "delete":
                    case "r":
                        if (!message.mentions.channels.first()) {
                            message.channel.send("You need to mention a role!")
                        }
                        var target = message.mentions.channels.first()

                        if (!global.Servers[message.guild.id].allowedInvChannels.includes(target.id)) {
                            message.channel.send("Sending invites in this channel is already disallowed!")
                        }
                        global.Servers[message.guild.id].allowedInvChannels.splice(global.Servers[message.guild.id].allowedInvChannels.indexOf(target.id), 1)
                        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`Sending invite links in ${target} is now disallowed!`))
                        firebase.database().ref().child("Servers").update(global.Servers)
                }
                break;
            default:
                if (!global.Servers[message.guild.id].allowedInvRoles) global.Servers[message.guild.id].allowedInvRoles = []
                if (!global.Servers[message.guild.id].allowedInvChannels) global.Servers[message.guild.id].allowedInvChannels = []
                var embed = new Discord.MessageEmbed().setColor("#FF0000").setTitle("Current prefernces for Invite Links:")
                embed.description = `State: ${global.Servers[message.guild.id].remInvState ? "\`Enabled\`" : "\`Disabled\`"}\n\n`
                embed.description += `${global.Servers[message.guild.id].allowedInvRoles.length > 0 ? "Allowed roles: " + global.Servers[message.guild.id].allowedInvRoles.map(x => "<@&" + x + ">").join(", ") : "No role is allowed to send invite links!"}\n\n`
                embed.description += `${global.Servers[message.guild.id].allowedInvChannels.length > 0 ? "Allowed channels: " + global.Servers[message.guild.id].allowedInvChannels.map(x => "<#" + x + ">").join(", ") : "You can't send invite links in any channel!"}`
                message.channel.send(embed)
                break;
        }
    },
};