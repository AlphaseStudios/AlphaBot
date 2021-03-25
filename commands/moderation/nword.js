const Discord = require('discord.js')
const firebase = require('firebase-admin')

module.exports = {
    name: 'nword',
    description: 'Configure the n-word filter.',
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return;
        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
        if (!args[0]) {
            var embed = new Discord.MessageEmbed().setTitle("The Current N-Word Filter Type is:").setColor("#FF0000");
            switch (global.Servers[message.guild.id].nword) {
                case "0":
                default:
                    embed.setDescription("0: No Filter\n\n\n\nAll Types:\n\n0: No Filter\n\n1: Delete Message\n\n2: Ban User")
                    break;
                case "1":
                    embed.setDescription("1: Delete Message\n\n\n\nAll Types:\n\n0: No Filter\n\n1: Delete Message\n\n2: Ban User")
                    break;
                case "2":
                    embed.setDescription("2: Ban User\n\n\n\nAll Types:\n\n0: No Filter\n\n1: Delete Message\n\n2: Ban User")
                    break;
            }
            message.channel.send(embed);
        }
        else {
            var temp = new Discord.MessageEmbed().setTitle("The N-Word Filter Type was set to:").setColor("#FF0000");
            switch (args[0]) {
                case "0":
                    global.Servers[message.guild.id].nword = "0";
                    temp.setDescription("0: No Filter")
                    break;
                case "1":
                    global.Servers[message.guild.id].nword = "1";
                    temp.setDescription("1: Delete Message")
                    break;
                case "2":
                    global.Servers[message.guild.id].nword = "2";
                    temp.setDescription("2: Ban User")
                    break;
                default:
                    temp.setTitle("I Didn't Quite Understand that :thinking:")
                    message.channel.send(temp)
                    return;
            }
            message.channel.send(temp)
            firebase.database().ref().child("Servers").update(global.Servers);
        }
        
    },
};