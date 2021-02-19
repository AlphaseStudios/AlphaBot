const Discord = require("discord.js");
const fs = require("fs");
const jimp = require("jimp");
/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Member} target
 */

exports.run = (message, client) => {
    if (!message.mentions.members.first())
    {
        message.reply("You need to mention another member!")
        message.delete();
        return;
    }
    var target = message.mentions.members.first();

    if (target.id == client.user.id) { message.channel.send("Hey! I never lie! :("); return; }
    if (target.id == message.member.id) { message.channel.send("Stop lying to yourself..."); return;}
    // Check if user has an avatar, if yes set path to it, if no, use the default gray avvy.
    var path = target.user.displayAvatarURL({ format: "png", size: 128})

    jimp.read("./liar.jpg", (err, liarImg) => {
        if (err) throw err;
        jimp.read(path, (err, avvy) => {
            if (err) throw err
            avvy.resize(128, 128)
            liarImg
                .composite(avvy, 175, 75)
                .print(global.robotoWhite, 455, 50, `${message.author.username}`)
                .write(`./imgs/l${message.member.id}.png`, () => {
                    message.channel.send(new Discord.MessageAttachment(`./imgs/l${message.member.id}.png`)).then(() => {
                        fs.unlinkSync(`./imgs/l${message.member.id}.png`)
                    })
                })
        })
    })

}

exports.help = {
    name: "liar"
}