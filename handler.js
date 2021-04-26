const fs = require("fs");
const Discord = require("discord.js");
const utils = require("./utils.js");
const config = require("./resources/config.json");
const debug = require("./debugger.js");
const cooldowns = new Discord.Collection();

function handleCommand(client, message) {
  // Init command
  if (message.content.split(" ").length == 1) {
    if (message.mentions.members != null) {
      if (message.mentions.members.has(client.user)) {
        message.channel.send("Hey!\nMy prefixes are: `a.` and `ab.`");
        return;
      }
    }
  }

  for (prefix of utils.getPrefixes()) {
    if (message.content.toLowerCase().startsWith(prefix) && !message.author.bot)
      handle();
  }

  function handle() {
    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/ +/);
    const commandName = args.shift().toLowerCase();
    /* const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)); */
    const command =
      client.commands.get(commandName) ||
      client.commands.find(
        (cmd) => cmd.group && cmd.name && cmd.name.includes(commandName)
      ) ||
      client.commands.find(
        (cmd) => cmd.aliases && cmd.aliases.includes(commandName)
      );
    if (!command) return;
    command.name = commandName;

    // GuildOnly
    if (command.guildOnly && message.channel.type === "dm") {
      var embed = new Discord.MessageEmbed()
        .setColor("#fa3c3c")
        .setTitle("Error")
        .setDescription("I am unable to execute this command in DMs.")
        .setTimestamp()
        .setFooter(
          `Executed by ${message.author.username}`,
          message.author.avatarURL({ format: "png" })
        );
      return message.channel.send(embed);
    }
    // command perms
    if (command.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(command.permissions)) {
        return message.reply("You can not do this!");
      }
    }

    // DevOnly
    if (command.devOnly) {
      if (utils.getDevs().includes(message.author.id)) {
        var embed = new Discord.MessageEmbed()
          .setColor("#ff9900")
          .setTitle("Information")
          .setDescription(
            "You are executing this command in devOnly mode. This means, the bot currently registers you as a Developer. If you think this is a mistake, please contact us [here](https://alphase/com/contact/)!"
          )
          .setTimestamp()
          .setFooter(
            `Executed by ${message.author.username}`,
            message.author.avatarURL({ format: "png" })
          );
        message.channel.send(embed);
      } else return;
    }

    // Arguments
    if (command.args) {
      if (command.args != -1) {
        if (args.length != command.args) {
          let reply = `You didn't provide any arguments, ${message.author}!`;
          if (command.usage)
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;

          var embed = new Discord.MessageEmbed()
            .setColor("#fa3c3c")
            .setTitle("Error")
            .setDescription(reply);
          return message.channel.send(embed);
        }
      } else {
        if (args.length == 0) {
          return message.channel.send(
            `You forgot to provide the \`${command.usage}\` argument.`
          );
        }
      }
    }

    // Cooldown
    if (!cooldowns.has(command.name))
      cooldowns.set(command.name, new Discord.Collection());
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(
          `please wait ${timeLeft.toFixed(
            1
          )} more second(s) before reusing the \`${command.name}\` command.`
        );
      }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    // Stats for fun commands
    if (command.stats == true) {
      utils.addStats(command.name.toLowerCase());
    }

    // Execute
    try {
      if (command.parseCommands == true) {
        command.execute(client, command.name, message, args);
      } else {
        command.execute(client, message, args);
      }
    } catch (err) {
      utils.discordException(client, err, message, command);
    }
  }
}

function registerCommands(client) {
  register(client, "commands");
}
function registerEvents(client) {
  register(client, "events");
}
function register(client, type) {
  const folders = fs.readdirSync(`./${type}`);

  for (sub of folders) {
    if (sub.endsWith(".js")) {
      try {
        const item = require(`./${type}/${sub}`);
        handleItem(item);
      } catch (err) {
        debug.sendErr(
          `Error while registering ${type.slice(0, -1)} ${sub}`,
          err,
          true
        );
      }
    } else {
      let files = fs
        .readdirSync(`./${type}/${sub}`)
        .filter((file) => file.endsWith(".js"));
      for (file of files) {
        try {
          const item = require(`./${type}/${sub}/${file}`);
          handleItem(item);
        } catch (err) {
          debug.sendErr(`Something went wrong... shutting down!`, err, true);
        }
      }
    }
  }

  function handleItem(item) {
    switch (type) {
      case "events":
        item.registerEvents(client);
        break;
      case "commands":
        client.commands.set(item.name, item);
        break;
      default:
        return;
    }
  }
}

module.exports = { handleCommand, registerCommands, registerEvents };
