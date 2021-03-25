const Discord = require('discord.js');
const utils = require('../../utils.js');

module.exports = {
    name: 'ask',
    args: 1,
    stats: true,
    description: 'Ask me something!',
    execute(client, message, args) {
        var msg = message.cleanContent;
        msg = Discord.Util.removeMentions(msg)
        msg = msg.split(" ")
        const respones = ["Absolutely!", "Oh hell no!", "Calm down, the CEO of bad ideas", "Hell Yes!", "Yes", "What were you even thinking?", "Yeah, sure", "I don't know, not gonna lie...", "No", "False", "True", "Just no.", "Oh lord, YES!"]
        message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setTitle(msg.slice(1, msg.length).join(" ")).setDescription(respones[Math.floor(Math.random() * respones.length)]))
    }
}