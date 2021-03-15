const Discord = require('discord.js');
const config = require('../../resources/config.json');

module.exports = {
    name: 'info',
    description: 'Get information about the bot.',
    execute(client, message, args) {
        var embed = new Discord.MessageEmbed().setColor("#FF0000").setTitle("__Bot Info__")
        let ver = config.version;
        let totalSeconds = client.uptime / 1000;
        let days = Math.floor(totalSeconds / 86400);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        let uptime = ``;

        if (days != 0) { uptime += `${days} Day(s), `; }
        if (hours != 0 || days > 0) { uptime += `${hours} Hour(s), `; }
        if (days > 0 || hours > 0 || minutes > 0) { uptime += `${minutes} Minute(s), `; }
        uptime += `${seconds} Second(s)`;
        var usersAmm = 0;
        client.guilds.cache.array().forEach(guild => {
            if (guild.id != "264445053596991498" && guild.id != "110373943822540800") {
                if (typeof (guild.memberCount) == "number")
                    usersAmm += guild.memberCount
            }
        })

        message.channel.send("***Collecting Data...***").then(msg => {
            embed.setThumbnail(client.user.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
                .setDescription(`Uptime: ${uptime}\n\n
                        :inbox_tray: Ping: ${msg.createdTimestamp - message.createdTimestamp}ms\n\n
                        :control_knobs: Servers: ${client.guilds.cache.size}\n\n
                        :busts_in_silhouette: Users: ${usersAmm}\n\n
                        :toolbox: Version: ${ver}\n\n
                        :link: Links:\n[Invite](https://discordapp.com/oauth2/authorize?client_id=687228371016351760&scope=bot&permissions=805314622) | [Support Server](https://discord.gg/RReQ7kW)`)
            msg.edit(embed)
        })
    },
};