// Imports and definitions
const fs = require('fs');
const Discord = require('discord.js');
const config = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Find all commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const _commandFiles = fs.readdirSync('./commands/other/').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
for (const file of _commandFiles) {
    const command = require(`./commands/other/${file}`);
    client.commands.set(command.name, command);
}
const cooldowns = new Discord.Collection();

// Events
client.on('ready', () => {
    console.log(`Successfully logged in as ${client.user.tag} at ${curTime()}`);
});

// CommandHandler
client.on('message', message => {
    // Init
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;
    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    // GuildOnly
    if (!command) return;
    if (command.guildOnly && message.channel.type === 'dm') {
        var embed = new Discord.MessageEmbed()
            .setColor('#fa3c3c')
            .setTitle('Error')
            .setDescription("I am unable to execute this command in DMs.")
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));
        return message.channel.send(embed);
    }

    if (command.permissions) {
        const authorPerms = message.channel.permissionsFor(message.author);
        if (!authorPerms || !authorPerms.has(command.permissions)) {
            return message.reply('You can not do this!');
        }
    }

    // Arguments
    if (command.args) {
        if (args.length != command.args) {
            let reply = `You didn't provide any arguments, ${message.author}!`;
            if (command.usage) reply += `\nThe proper usage would be: \`${config.prefix}${command.name} ${command.usage}\``;

            var embed = new Discord.MessageEmbed()
                .setColor('#fa3c3c')
                .setTitle("Error")
                .setDescription(reply);
            return message.channel.send(embed);
        }
    }

    // Cooldown
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Execute
    try { command.execute(client, message, args); }
    catch (err) {
        var embed = new Discord.MessageEmbed()
            .setColor('#fa3c3c')
            .setTitle('Error')
            .setDescription("Something went wrong trying to execute the command. The devs have been notified about this issue. Please try again later.")
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));

        var devEmbed = new Discord.MessageEmbed()
            .setColor('#fa3c3c')
            .setTitle(`${err.name}`)
            .setDescription(err.stack)
            .addFields(
                { name: "Short", value: err.message, inline: true },
                { name: "Information", value: `Occurred in: ${command.name}.\nOccurred at: ${curTime()}\nExecuted by: ${message.author.tag}\nExecuted in: ${message.guild.name}`, inline: true }
            )
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));

        message.channel.send(embed);
        client.users.fetch("414585685895282701")
            .then(userObj => userObj.send(devEmbed))
            .catch(console.err);
        console.error(err);
    }
});

function curTime() { return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''); }
// Login into Discord API
try { client.login(config.token); } catch (err) { console.error(`Something went wrong trying to log in.\n${err}`); }