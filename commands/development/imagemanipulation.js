const Discord = require("discord.js");
const Canvas = require("canvas");
require("dotenv").config();

const lvls = [
  75,
  300,
  675,
  1200,
  1875,
  2700,
  3675,
  4800,
  6075,
  7500,
  9075,
  10800,
  12675,
  14700,
  16875,
  19200,
  21675,
  24300,
  27075,
  30000,
  33075,
  36300,
  39675,
  43200,
  46875,
  50700,
  54675,
  58800,
  63075,
  67500,
  72075,
  76800,
  81675,
  86700,
  91875,
  97200,
  100000,
];

module.exports = {
  name: "image",
  description: "Make a request to a webserver!",
  devOnly: true,
  guildOnly: true,
  args: 0,
  async execute(client, message, args) {
    var target = message.mentions.members.first()
      ? message.mentions.members.first()
      : message.member;
    if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {};
    if (!global.Users[message.guild.id][target.user.id])
      global.Users[message.guild.id][target.user.id] = {
        xp: 0,
        lvl: 0,
        warns: [],
        roles: [],
      };
    // Check if user has an avatar, if yes set path to it, if no, use the default gray avvy.
    var path = target.user.displayAvatarURL({
      format: "png",
      size: 128,
    });
    var userLevelFake =
      global.Users[message.guild.id][target.id].lvl > 36
        ? 36
        : global.Users[message.guild.id][target.id].lvl;

    var levelLength = Math.ceil(
      290 *
        ((1 / lvls[userLevelFake]) *
          global.Users[message.guild.id][target.id].xp)
    );
    levelLength = Number.isNaN(levelLength)
      ? 360
      : levelLength > 360
      ? 360
      : levelLength < 1
      ? 1
      : levelLength;

    // Pass the entire Canvas object because you'll need to access its width, as well its context
    const applyText = (canvas, text) => {
      const ctx = canvas.getContext("2d");

      // Declare a base size of the font
      let fontSize = 28;

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

    /*const background = await Canvas.loadImage("./resources/wallpaper.png");
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); */

    ctx.fillStyle = "#121212";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2.5, 170);
    ctx.lineTo(canvas.width / 2.5 + 360, 170);
    ctx.stroke();

    ctx.shadowColor = "#00b330";
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#00b330";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2.5, 170);
    ctx.lineTo(canvas.width / 2.5 + levelLength, 170);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Slightly smaller text placed above the member's display name
    ctx.font = "30px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${message.author.username} is`,
      canvas.width / 2.54,
      canvas.height / 3.39
    );

    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${global.Users[message.guild.id][target.id].xp}XP / ${
        lvls[userLevelFake]
      }XP`,
      canvas.width / 2.55,
      canvas.height / 1.15
    );

    // Add an exclamation point here and below
    ctx.font = "55px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `Level ${global.Users[message.guild.id][target.id].lvl}`,
      canvas.width / 2.58,
      canvas.height / 1.8
    );

    ctx.beginPath();
    ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();

    const avatar = await Canvas.loadImage(
      message.author.displayAvatarURL({
        format: "png",
      })
    );
    ctx.drawImage(avatar, 25, 25, 200, 200);

    const attachment = new Discord.MessageAttachment(
      canvas.toBuffer(),
      "welcome-image.png"
    );

    message.channel.send(
      `Welcome to the server, ${message.author.username}!`,
      attachment
    );
  },
};
