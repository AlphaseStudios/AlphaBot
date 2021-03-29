const Discord = require('discord.js');
const fs = require('fs');
const config = require('../../resources/config.json');

module.exports = {
    name: 'help',
    usage: '[category]',
    aliases: ['ineedmechanic'],
    description: 'Shows you a list of all commands.',
    execute(client, message, args) {
        const embed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle(':gear: Help')
            .setDescription('Note: `<...>` is a required argument and `[...]` is a optional argument.\nWant to get to the old docs? Click [here](https://51devs.xyz/bot/docs/)')
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));

        const type = ["commands"];
        const folders = fs.readdirSync(`./${type}/`);
        for (sub of folders) {
            if (sub.endsWith('.js')) {
                const item = require(`../../${type}/${sub}`);
                handle(item);
            }
            let files = fs.readdirSync(`./${type}/${sub}`).filter(file => file.endsWith('.js'));
            for (file of files) {
                const item = require(`../../${type}/${sub}/${file}`);
                handle(item);
            }
        }

        function handle(command) {
            if (!command.devOnly) {
                if (command.usage == null) command.usage = "";
                if (args.length == 0) {
                    embed.addField(`**${config.prefixes[0]}${command.name}**`, `\`\`\`txt\n${command.description}\`\`\``, true);
                } else {
                    if (command.aliases == null) command.aliases = [];
                    if (args[0].toLowerCase() == command.name || command.aliases.includes(args[0].toLowerCase())) {
                        if (command.aliases == null) command.aliases = ["none"];
                        embed.addField("Name", `\`\`\`txt\n${config.prefixes[0]}${command.name} ${command.usage}\`\`\``, true)
                            .addField("Description", `\`\`\`txt\n${command.description}\`\`\``)
                            .addField("Aliases", `\`\`\`txt\n${command.aliases.join(', ')}\`\`\``, true)
                            .addField("DMable", `\`\`\`txt\n${!command.guildOnly ? 'yes' : 'no'}\`\`\``, true);
                    }
                }
            }
        }
        message.channel.send(embed);
    }
};