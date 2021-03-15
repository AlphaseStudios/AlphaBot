const Discord = require("discord.js")
module.exports = {
    name: 'nuke',
    description: 'Nuke a channel.',
    aliases: ['oopsies'],
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("MANAGE_CHANNELS")) return;
        message.channel.clone({ reason: "nuke" }).then(cloneChannel => {
            cloneChannel.send("KA-   ***Boom!***", new Discord.MessageAttachment("https://media2.giphy.com/media/oQtO6wKK2q0c8/giphy.gif"))
            cloneChannel.setPosition(message.channel.position)
            message.channel.delete("nuke");

            if (!global.Servers[message.guild.id] || !global.Servers[message.guild.id].modlog) return;
            var modLogChannel = global.Servers[message.guild.id].modlog
            if (modLogChannel == null || !message.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = message.guild.channels.cache.get(modLogChannel)
            modLogChannel.send(new Discord.MessageEmbed().setTitle(":boom: Channel Nuked").setDescription(`:judge: Executor: ${message.member}\n\n:boom: Target Channel: #${message.channel.name}`).setColor("#FF0000"))
        });
    },
};