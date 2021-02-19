const Discord = require('discord.js');

/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Array} args
 */

exports.run = (args, message) => {

    //Check if user has the Manage Server permission.
    if (!message.member.hasPermission("MANAGE_GUILD")) return false;

    //Check if Server Data & NOXP data exist, if not, create them.
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
    if (!global.Servers[message.guild.id].noxp) global.Servers[message.guild.id].noxp = [];


    switch (args[1]) {
        case "r":
        case "remove":
        case "delete":

            var targetChannel = message.mentions.channels.first();

            //If user hasn't mentioned a channel, return
            if (!targetChannel) {
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`You need to mention a channel!`))
                return false;
            }

            //Get index of mentioned channel
            var indexOfChannel = global.Servers[message.guild.id].noxp.indexOf(targetChannel.id);

            //Check if it exists in the NOXP array
            if (indexOfChannel > -1)
            {
                //If yes, delete it
                global.Servers[message.guild.id].noxp.splice(indexOfChannel, 1);
                
                //Successful deletion prompt
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`Users will now gain XP by chatting in ${targetChannel}!`))
                return true;
            }
            //If not:
            else {
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`${targetChannel} doesn't exist in the Channel XP Blacklist!`))
                return false;
            }

            break;

        case "a":
        case "add":

            var targetChannel = message.mentions.channels.first();

            //If user hasn't mentioned a channel, return
            if (!targetChannel) {
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`You need to mention a channel!`))
                return false;
            }

            //Get index of mentioned channel
            var indexOfChannel = global.Servers[message.guild.id].noxp.indexOf(targetChannel.id);


            //Check if it exists in the NOXP array
            if (indexOfChannel > -1) {
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`${targetChannel} is already in the Channel XP Blacklist!`))
                return false;
            }
            //If not:
            else {
                global.Servers[message.guild.id].noxp.push(targetChannel.id);
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`Users will no longer gain XP by chatting in ${targetChannel}!`))
                return true;
            }

            break;
        default:
            if (global.Servers[message.guild.id].noxp.length <= 0) {
                message.channel.send(new Discord.MessageEmbed().setColor("3d7b2f").setDescription(`There are no channels in the XP Blacklist!`))
                return false;
            }
            else {
                msg = ""
                var i = 1;
                for (var c of global.Servers[message.guild.id].noxp) {
                    if (message.guild.channels.cache.has(c))
                    {
                        msg += `${i}. <#${c}>\n\n`
                        i++;
                    }
                }

                var embed = new Discord.MessageEmbed().setColor("3d7b2f").setDescription(msg.length > 0 ? msg : "There are no channels in the XP Blacklist!")

                if (msg == "") {
                    msg = "There are no channels in the XP Blacklist!"
                }
                else {
                    embed.setTitle("Channels in the XP Blacklist:")
                }

                message.channel.send(embed)
                return false;
            }



            break;
    }
}

exports.help = {
    name: "noxp"
}