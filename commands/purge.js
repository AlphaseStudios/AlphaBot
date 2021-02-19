var Discord = require('discord.js')

/**
 * @param {Discord.Message} message
 * @param {Discord.Client} client
 */

exports.run = (message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return;
    if (isNaN(args[1])) { message.channel.send("Please mention a valid amount of messages for me to delete!"); return };
    var amount = parseInt(args[1])
    message.delete();

	if(amount > 100) {
		message.channel.send("The specified amount of messages to delete is too high!");
		return;
	}

	message.channel.bulkDelete(amount, true)
    /* while (amm > 0) {
        message.channel.bulkDelete(amm > 100 ? 100 : amm, true)
        amm -= 100;
    } */

    message.channel.send(`Deleted \`${amount}\` messages!`).then(msg => { setTimeout(() => {msg.delete()}, 4000)})
    
}

exports.help = {
    name: "purge"
}