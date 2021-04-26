const debug = require("../../debugger.js");
const Discord = require("discord.js");
module.exports = {
  name: "eval",
  description: "Eval a line of code.",
  devOnly: true,
  args: -1,
  async execute(client, message, args) {
    await message.react("⏳");

    let code = args.join(" ");
    let res;
    let type = "txt";

    let found = code.match(/\`{3}js\n((?:.*\n* *)*)\n\`{3}/);
    if (found != null) code = found[1];

    try {
      if (code.includes("console.log")) {
        var embed = new Discord.MessageEmbed()
          .setColor("#ff9900")
          .setTitle("Information")
          .setDescription(
            "\`console.log(...);\` will not show output. You can do \`debug.sendInfo(...)\` instead!"
          )
          .setTimestamp()
          .setFooter(
            `Executed by ${message.author.username}`,
            message.author.avatarURL({ format: "png" })
          );
        message.channel.send(embed=embed);
      }

      let out = "";

      // Override default behaviour
      const sendInfo = debug.sendInfo;
      let = debug.sendInfo = function(msg) {
        let res = debug.send(`Received message from eval: ${msg}`, 0, "EVAL", "\u001b[36m");
        out += `${res}\n`;
        return out;
      }
      
      // Run actual code 
      res = eval(code);

      // Reset debug.sendInfo
      debug.sendInfo = sendInfo;
    } catch (err) {
      res = `Error while executing eval:\n${err.stack}`;
      type = "cs";
    }

    await message.channel.send(
      `Console output:\n\`\`\`${type}\n${res}\n\`\`\``
    );
    await message.react("✅");
    message.reactions.cache.get("⏳").users.remove(client.user);
  },
};