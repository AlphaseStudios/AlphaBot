var Discord = require('discord.js')
module.exports = {
    name: 'milestones',
    description: 'Configures milestones for your server!',
    usage: '<a|r> (a = add; r = remove)\nAdding: 51.milestones a <@role> <level (1-24)> Removing: 51.milestones r <level>',
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("MANAGE_GUILD")) return;
        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}

        if (!args[0]) {
            if (!global.Servers[message.guild.id].milestones || Object.keys(global.Servers[message.guild.id].milestones).length <= 0) message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription("There are no milestones in this server!"))
            else {
                var msg = "\n\n";
                var _keys = Object.keys(global.Servers[message.guild.id].milestones);
                for (var _key in global.Servers[message.guild.id].milestones) {
                    msg += `At level \`${_key}\`:\n\n<@&${global.Servers[message.guild.id].milestones[_key]}>\n\n`
                }
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`Milestones in ${message.guild.name}:`)
                    .setColor("#FF0000")
                    .setDescription(msg))
            }
        }
        else if (args[0] == "add") {
            if (!message.mentions.roles.first()) { message.channel.send("Please mention a role!"); return; }
            if (isNaN(parseInt(args[2]))) { message.channel.send("Please mention a level!"); return; }
            if (parseInt(args[2]) > 24 || parseInt(args[2]) < 0) { message.channel.send("Please mention a level between 0 and 24!"); return; }

            if (!global.Servers[message.guild.id].milestones) global.Servers[message.guild.id].milestones = {}
            global.Servers[message.guild.id].milestones[parseInt(args[2]).toString()] = message.mentions.roles.first().id;

            message.channel.send(new Discord.MessageEmbed()
                .setColor('3d7b2f')
                .setDescription(`Now users will get the ${message.mentions.roles.first()} role at level ${parseInt(args[2])}!`))

            firebase.database().ref().child('Servers').update(global.Servers)
        }
    },
};