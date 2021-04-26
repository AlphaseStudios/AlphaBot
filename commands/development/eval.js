const debug = require("../../debugger.js");

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
      console.normalLog = console.log;
      console.log = function(msg) {
        console.normalLog(msg);
        return msg;
      };
      res = eval(code);
      console.log = console.normalLog;
    } catch (err) {
      res = `Error while executing eval:\n${err.stack}`;
      type = "cs";
    }

    await message.channel.send(`\`\`\`${type}\n${res}\n\`\`\``);
    await message.react("✅");
    message.reactions.cache.get("⏳").users.remove(client.user);
  },
};
