const Discord = require('discord.js');
const utils = require('../../utils.js');

module.exports = {
    name: 'rps',
    aliases: ['rockpaperscissors'],
    args: 1,
    description: 'Ask me something!',
    stats: true,
    execute(client, message, args) {
        if (args[1].match(/(r(ock)?)|(p(aper)?)|(s(cissors)?)/gmi)) {
            var choice = ""
            if (args[1].toLowerCase().startsWith("r")) choice = "Rock :moyai:"
            else if (args[1].toLowerCase().startsWith("p")) choice = "Paper :roll_of_paper:"
            else if (args[1].toLowerCase().startsWith("s")) choice = "Scissors :scissors:"

            var myChoice = ["Rock :moyai:", "Paper :roll_of_paper:", "Scissors :scissors:"][Math.floor(Math.random() * 3)]

            if ((choice == "Rock :moyai:" && myChoice == "Paper :roll_of_paper:") || (choice == "Paper :roll_of_paper:" && myChoice == "Scissors :scissors:") || (choice == "Scissors :scissors:" && myChoice == "Rock :moyai:")) {
                message.channel.send(new Discord.MessageEmbed().setColor("8b0000").setDescription(`You chose: ${choice}.\n\nI chose ${myChoice}.\n\nYou Lose!`))
            } else if (choice == myChoice) {
                message.channel.send(new Discord.MessageEmbed().setColor("CCCC00").setDescription(`You chose: ${choice}.\n\nI chose ${myChoice}.\n\nIt's a tie!`))
            } else {
                message.channel.send(new Discord.MessageEmbed().setColor("#FF0000").setDescription(`You chose: ${choice}.\n\nI chose ${myChoice}.\n\nYou Win!`))
            }
        } else {
            message.channel.send("Please try again, but also choose `rock`, `paper` or `scissors`!")
        }
    }
}