const Discord = require("discord.js");
const fs = require("fs");
const jimp = require("jimp");
/**
 * @param {Discord.Client} client
 * @param {Discord.Message} message
 * @param {Discord.Member} target
 */

exports.run = (message, lvls) => {
    var target = message.mentions.members.first() ? message.mentions.members.first() : message.member;

    if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {}
    if (!global.Users[message.guild.id][target.user.id]) global.Users[message.guild.id][target.user.id] = { xp: 0, lvl: 0, warns: [], roles: [] }

    // Check if user has an avatar, if yes set path to it, if no, use the default gray avvy.
    var path = target.user.displayAvatarURL({ format: "png", size: 128})

    var userLevel_fake = global.Users[message.guild.id][target.id].lvl > 36 ? 36 : global.Users[message.guild.id][target.id].lvl
    // Load Avvy
    jimp.read(path, (err, avvy) => {
        if (err) throw err;
        avvy.resize(128, 128)
        // Load level progress bar
        jimp.read("./dot.png", (err, dot) => {
            if (err) throw err;
            var dotLength = Math.ceil(290 * ((1 / lvls[userLevel_fake]) * global.Users[message.guild.id][target.id].xp))
            dotLength = Number.isNaN(dotLength) ? 291 : dotLength > 291 ? 291 : dotLength < 1 ? 1 : dotLength
            dot.resize(dotLength, 14)
            // Load background
            jimp.read("./grayimage.png", (err, img) => {
                if (err) throw err;
                //var MaxXP = lvls[global.Users[message.guild.id][target.id].lvl] == undefined ? "INFINITY " : lvls[global.Users[message.guild.id][target.id].lvl]
                img
                    .composite(avvy, 25, 35)
                    .composite(dot, 175, 149)
                    .print(global.robotoBlackBig, 174, 115, `LEVEL ${global.Users[message.guild.id][target.id].lvl}`)
                    .print(global.robotoBlackSmall, 174, 105, `${global.Users[message.guild.id][target.id].xp}XP / ${lvls[userLevel_fake]}XP`)
                    .print(global.robotoBlackSmall, 174, 33, { text: `${target.user.username.split('#')[0]}'s Stats`})
                    //target.joinedAt.toLocaleDateString('en-GB') didn't display the correct format (DD/MM/YYYY), had to use this...
                    .print(global.robotoBlackSmall, 174, 55, `Join Date: ${target.joinedAt.getDate()}/${target.joinedAt.getMonth() + 1}/${target.joinedAt.getFullYear()} (DD/MM/YYYY)`)
                    .write(`./imgs/${target.id}.png`, () => {
                        message.channel.send(new Discord.MessageAttachment(`./imgs/${target.id}.png`)).then(() => {
                            fs.unlinkSync(`./imgs/${target.id}.png`)
                        })
                    })
            })
        })
    })
}

exports.help = {
    name: "level"
}