const Discord = require("discord.js")

exports.run = (message) => {
    message.channel.send("Heres my invitelink:\nhttps://discord.com/oauth2/authorize?client_id=687228371016351760&scope=bot&permissions=8");
}

exports.help = {
    name: "invite"
}