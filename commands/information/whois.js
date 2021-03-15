const Discord = require('discord.js');

module.exports = {
    name: 'whois',
    usage: '<@user>',
    args: 1,
    guildOnly: true,
    description: 'Get information about something',
    execute(client, message, args) {
        const status = {
            online: "<:online:759034055231799316> Online",
            idle: "<:idle:759034016404996136> Idle",
            dnd: "<:dnd:759033963233673257> Do Not Disturb",
            offline: "<:offline:759033991226458132> Offline/Invisible",
            streaming: "<:streaming:759033930866229249> Streaming"
        }

        var target = message.mentions.users.first() ? message.mentions.users.first() : message.author;
        var targetStatus, targetGame;
        for (var i in target.presence.activities) {
            switch (target.presence.activities[i].type) {
                case "CUSTOM_STATUS":
                    targetStatus = (target.presence.activities[i].emoji ? target.presence.activities[i].emoji.name + " " : "") + target.presence.activities[i].state;
                    break;
                case "LISTENING":
                    targetGame = `Listening to **${target.presence.activities[i].details}** by **${target.presence.activities[i].state}** on Spotify`
                    break;
                case "PLAYING":
                    targetGame = `**Playing** ${target.presence.activities[i].name}`
                    break;
            }
        }
        var embed = new Discord.MessageEmbed().setTitle(`${target.tag}'s Info`).setColor("#FF0000").setThumbnail(target.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
            .setDescription(`${target.bot ? "User is a bot! :robot:\n\n" : ""}
                    :hash: UUID:\n${target.id}\n\n
                    :bar_chart: Presence:\n${status[target.presence.status]}\n\n
                    :joystick: Activity:\n${targetGame == null ? "User Not Doing Anything" : targetGame}\n\n
                    💬 Custom Status:\n${targetStatus == null ? "User hasn't set a custom status" : targetStatus}\n\n
                    :inbox_tray: User Created at: ${target.createdAt.getDate()}/${target.createdAt.getMonth() + 1}/${target.createdAt.getFullYear()}, ${target.createdAt.toLocaleTimeString()}`)
        message.channel.send(embed)
    },
};