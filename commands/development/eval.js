module.exports = {
  name: "eval",
  description: "Eval a line of code.",
  devOnly: true,
  args: -1,
  async execute(client, message, args) {
    
    await message.react("⏳");
    await message.channel.send(`\`\`\`txt\n${eval(args.join(" "))}\n\`\`\``);
    await message.react("✅");

    message.reactions.cache.get("⏳").users.remove(client.user);
  },
};