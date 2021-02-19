var Discord = require('discord.js')

/**
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 */

exports.run = (message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return false

    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

    switch (args[1]) {
        case "s":

            global.Servers[message.guild.id].remInvState = global.Servers[message.guild.id].remInvState ? !global.Servers[message.guild.id].remInvState : true

            message.channel.send(`The bot will no${global.Servers[message.guild.id].remInvState ? "w" : " longer"} delete Invite Links!`)

            return true;

            break;
        case "roles":

            if (!global.Servers[message.guild.id].allowedInvRoles) global.Servers[message.guild.id].allowedInvRoles = []

            switch (args[2]) {
                case "a":
                case "add":
                    if (!message.mentions.roles.first()) {
                        message.channel.send("You need to mention a role!")
                        return false
                    }

                    var target = message.mentions.roles.first()

                    if (global.Servers[message.guild.id].allowedInvRoles.includes(target.id)) {
                        message.channel.send("This role is already allowed to send invite links!")
                        return false
                    }

                    global.Servers[message.guild.id].allowedInvRoles.push(target.id)

                    message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`Members with the ${target} role will now be able to send invite links!`))

                    return true;

                    break;
                case "d":
                case "remove":
                case "delete":
                case "r":

                    if (!message.mentions.roles.first()) {
                        message.channel.send("You need to mention a role!")
                        return false
                    }

                    var target = message.mentions.roles.first()

                    if (!global.Servers[message.guild.id].allowedInvRoles.includes(target.id)) {
                        message.channel.send("This role is already unable to send invite links!")
                        return false
                    }

                    global.Servers[message.guild.id].allowedInvRoles.splice(global.Servers[message.guild.id].allowedInvRoles.indexOf(target.id), 1)

                    message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`Members with the ${target} role will not be able to send invite links!`))

                    return true;


                    break;
            }

            break;
        case "channels":

            if (!global.Servers[message.guild.id].allowedInvChannels) global.Servers[message.guild.id].allowedInvChannels = []

            switch (args[2]) {
                case "a":
                case "add":
                    if (!message.mentions.channels.first()) {
                        message.channel.send("You need to mention a channel!")
                        return false
                    }

                    var target = message.mentions.channels.first()

                    if (global.Servers[message.guild.id].allowedInvChannels.includes(target.id)) {
                        message.channel.send("Sending invites in this channel is already allowed!")
                        return false
                    }

                    global.Servers[message.guild.id].allowedInvChannels.push(target.id)

                    message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`Sending invite links in ${target} is now allowed!`))

                    return true;

                    break;
                case "d":
                case "remove":
                case "delete":
                case "r":

                    if (!message.mentions.channels.first()) {
                        message.channel.send("You need to mention a role!")
                        return false
                    }

                    var target = message.mentions.channels.first()

                    if (!global.Servers[message.guild.id].allowedInvChannels.includes(target.id)) {
                        message.channel.send("Sending invites in this channel is already disallowed!")
                        return false
                    }

                    global.Servers[message.guild.id].allowedInvChannels.splice(global.Servers[message.guild.id].allowedInvChannels.indexOf(target.id), 1)

                    message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`Sending invite links in ${target} is now disallowed!`))

                    return true;


                    break;
            }

            break;
        default: 
            if (!global.Servers[message.guild.id].allowedInvRoles) global.Servers[message.guild.id].allowedInvRoles = []
            if (!global.Servers[message.guild.id].allowedInvChannels) global.Servers[message.guild.id].allowedInvChannels = []

            var embed = new Discord.MessageEmbed().setColor("3d7b2f").setTitle("Current prefernces for Invite Links:")

            embed.description = `State: ${global.Servers[message.guild.id].remInvState ? "\`Enabled\`" : "\`Disabled\`"}\n\n`
            embed.description += `${global.Servers[message.guild.id].allowedInvRoles.length > 0 ? "Allowed roles: " + global.Servers[message.guild.id].allowedInvRoles.map(x => "<@&" + x + ">").join(", ") : "No role is allowed to send invite links!"}\n\n`
            embed.description += `${global.Servers[message.guild.id].allowedInvChannels.length > 0 ? "Allowed channels: " + global.Servers[message.guild.id].allowedInvChannels.map(x => "<#" + x + ">").join(", ") : "You can't send invite links in any channel!"}`

            message.channel.send(embed)
            break;
    }
}

exports.help = {
    name: "reminvite"
}