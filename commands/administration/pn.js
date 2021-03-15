const Discord = require('discord.js')

module.exports = {
    name: 'pn',
    description: 'Configure the patch notes.',
    guildOnly: true,
    execute(client, message, args) {
        if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
        if (!args[1]) {
            var temp = new Discord.MessageEmbed().setColor("#FF0000");
            if (!global.Servers[message.guild.id].pnc) {
                temp.setTitle("You Didn't Set A Patch Notes Channel!")
                    .setDescription(`***The Latest Patch Notes are:***\n${notes}`);
            }
            else {
                temp.setTitle(`The Current Patch Notes Channel is: #${message.guild.channels.cache.get(global.Servers[message.guild.id].pnc).name}`)
                    .setDescription(`***The Latest Patch Notes are:***\n${notes}`);
            }
            message.channel.send(temp);
        }
        else if (args[1] == "c") {
            if (!message.member.hasPermission('MANAGE_GUILD')) return;

            var temp = new Discord.MessageEmbed().setColor("#FF0000");

            if (!message.mentions.channels.first()) {
                if (!message.guild.channels.cache.has(global.Servers[message.guild.id].pnc)) {
                    temp.setTitle("You Need To Mention a Channel!")
                }
                else {
                    temp.setTitle("Task Successful!")
                        .setDescription(`The Bot Will no longer send notifications in ${message.guild.channels.cache.get(global.Servers[message.guild.id].pnc)}`);

                    delete global.Servers[message.guild.id].pnc
                    firebase.database().ref().child("Servers").update(global.Servers)
                }

                message.channel.send(temp);
            }
            let target = message.mentions.channels.first();

            global.Servers[message.guild.id].pnc = target.id;
            temp.setTitle("Task Successful!").setDescription(`Set The Patch Notes Channel To: ${target}`)
            target.send(notes)
            message.channel.send(temp)
            firebase.database().ref().child("Servers").update(global.Servers)
        }
    },
};