const Discord = require("discord.js");
const Canvas = require("canvas");
require("dotenv").config();

module.exports = {
  name: "image",
  description: "Make a request to a webserver!",
  devOnly: true,
  guildOnly: true,
  args: 0,
  async execute(client, message, args) {
    // Pass the entire Canvas object because you'll need to access its width, as well its context
    const applyText = (canvas, text) => {
      const ctx = canvas.getContext("2d");

      // Declare a base size of the font
      let fontSize = 70;

      do {
        // Assign the font to the context and decrement it so it can be measured again
        ctx.font = `${(fontSize -= 10)}px sans-serif`;
        // Compare pixel width of the text to the canvas minus the approximate avatar size
      } while (ctx.measureText(text).width > canvas.width - 300);

      // Return the result to use in the actual canvas
      return ctx.font;
    };

    const canvas = Canvas.createCanvas(700, 250);
    const ctx = canvas.getContext("2d");

    const background = await Canvas.loadImage("./resources/wallpaper.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#74037b";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Slightly smaller text placed above the member's display name
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      "Welcome to the server,",
      canvas.width / 2.5,
      canvas.height / 3.5
    );

    // Add an exclamation point here and below
    ctx.font = applyText(canvas, `${message.author.displayName}!`);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${message.author.displayName}!`,
      canvas.width / 2.5,
      canvas.height / 1.8
    );

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(
      message.author.displayAvatarURL({ format: "jpg" })
    );
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "welcome-image.png"
    );

    message.channel.send(
      `Welcome to the server, ${message.author.displayName}!`,
      attachment
    );
  },
};
