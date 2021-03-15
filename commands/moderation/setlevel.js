module.exports = {
    name: 'setlvl',
    description: 'Generates you a guild invite link.',
    aliases: ['setlevel'],
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return false;
        if (!message.mentions.members.first()) { message.channel.send("You need to mention a member!"); return false }
        var target = message.mentions.members.first()

        if (isNaN(parseInt(args[2]))) { message.channel.send("Enter a valid number!"); return false; }
        if (parseInt(args[2]) < 0 || parseInt(args[2]) > 65536 || !isFinite(parseInt(args[2]))) { message.channel.send("Enter a valid between 0 and 65,536!"); return false; }
        if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {}
        if (!global.Users[message.guild.id][target.id]) global.Users[message.guild.id][target.id] = {}
        global.Users[message.guild.id][target.id].lvl = parseInt(args[2])
        global.Users[message.guild.id][target.id].xp = 0

        message.channel.send(`Successfully set ${target}'s level to: ${parseInt(args[2])}!`)
        firebase.database().ref().child('Users').update(global.Users);
    },
};