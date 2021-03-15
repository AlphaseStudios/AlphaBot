const Discord = require('discord.js');

module.exports = {
    name: 'noxp',
    description: 'Generates you a guild invite link.',
    guildOnly: true,
    execute(client, message, args) {
        //Check if user has the Manage Server permission.
        if (!message.member.hasPermission("MANAGE_GUILD")) return;
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
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`You need to mention a channel!`))
                }

                //Get index of mentioned channel
                var indexOfChannel = global.Servers[message.guild.id].noxp.indexOf(targetChannel.id);

                //Check if it exists in the NOXP array
                if (indexOfChannel > -1) {
                    //If yes, delete it
                    global.Servers[message.guild.id].noxp.splice(indexOfChannel, 1);

                    //Successful deletion prompt
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`Users will now gain XP by chatting in ${targetChannel}!`))
                    firebase.database().ref().child("Servers").update(global.Servers)
                }
                //If not:
                else {
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`${targetChannel} doesn't exist in the Channel XP Blacklist!`))
                }
                break;
            case "a":
            case "add":

                var targetChannel = message.mentions.channels.first();

                //If user hasn't mentioned a channel, return
                if (!targetChannel) {
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`You need to mention a channel!`))
                }

                //Get index of mentioned channel
                var indexOfChannel = global.Servers[message.guild.id].noxp.indexOf(targetChannel.id);


                //Check if it exists in the NOXP array
                if (indexOfChannel > -1) {
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`${targetChannel} is already in the Channel XP Blacklist!`))
                }
                //If not:
                else {
                    global.Servers[message.guild.id].noxp.push(targetChannel.id);
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`Users will no longer gain XP by chatting in ${targetChannel}!`))
                    firebase.database().ref().child("Servers").update(global.Servers)
                }

                break;
            default:
                if (global.Servers[message.guild.id].noxp.length <= 0) {
                    message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`There are no channels in the XP Blacklist!`))
                }
                else {
                    msg = ""
                    var i = 1;
                    for (var c of global.Servers[message.guild.id].noxp) {
                        if (message.guild.channels.cache.has(c)) {
                            msg += `${i}. <#${c}>\n\n`
                            i++;
                        }
                    }

                    var embed = new Discord.MessageEmbed().setColor("#FF0000").setDescription(msg.length > 0 ? msg : "There are no channels in the XP Blacklist!")

                    if (msg == "") {
                        msg = "There are no channels in the XP Blacklist!"
                    }
                    else {
                        embed.setTitle("Channels in the XP Blacklist:")
                    }

                    message.channel.send(embed)
                }
                break;
        }
    }
};