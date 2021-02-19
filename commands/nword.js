const Discord = require('discord.js')



/**
 * @param {Discord.Client} client;
 * @param {Discord.Message} message;
 */

exports.run = (message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) return false;
    if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

    if (args[1] == null)
    {
        var embed = new Discord.MessageEmbed().setTitle("The Current N-Word Filter Type is:").setColor("#3D7B2F");

        switch (global.Servers[message.guild.id].nword)
        {
            case "0":
            default:
                embed.setDescription("0: No Filter\n\n\n\nAll Types:\n\n0: No Filter\n\n1: Delete Message and Warn User\n\n2: Ban User")
                break;
            case "1":
                embed.setDescription("1: Delete Message and Warn User\n\n\n\nAll Types:\n\n0: No Filter\n\n1: Delete Message and Warn User\n\n2: Ban User")
                break;
            case "2":
                embed.setDescription("2: Ban User\n\n\n\nAll Types:\n\n0: No Filter\n\n1: Delete Message and Warn User\n\n2: Ban User")
                break;
        }
        message.channel.send(embed);
        return false
    }


    var temp = new Discord.MessageEmbed().setTitle("The N-Word Filter Type was set to:").setColor("#3D7B2F");

    switch(args[1])
    {
        case "0":
            global.Servers[message.guild.id].nword = "0";
            temp.setDescription("0: No Filter")
            break;
        case "1":
            global.Servers[message.guild.id].nword = "1";
            temp.setDescription("1: Delete Message and Warn User")
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
    return true;
}

exports.help = {
    name: "nword"
}