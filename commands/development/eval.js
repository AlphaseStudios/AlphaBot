const debug = require("../../debugger.js");
const Discord = require("discord.js")
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
      if(code.includes("console.log")) {
        embed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle(':gear: Help')
            .setDescription('Note: `<...>` is a required argument and `[...]` is a optional argument.\nWant to get to the old docs? Click [here](https://51devs.xyz/bot/docs/)')
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, 
        message.channel.send(embed=embed)
      }
      res = eval(code);
    } catch (err) {
      res = `Error while executing eval:\n${err.stack}`;
      type = "cs";
    }

    await message.channel.send(`Console output:\n\`\`\`${type}\n${res}\n\`\`\``);
    await message.react("✅");
    message.reactions.cache.get("⏳").users.remove(client.user);
  },
};
