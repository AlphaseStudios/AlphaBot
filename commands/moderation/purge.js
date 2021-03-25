module.exports = {
    name: 'clear',
    aliases: ['purge', 'delete'],
    usage: '<amount>',
    args: 1,
    guildOnly: true,
    description: 'Clear a given amount of messages.',
    execute(client, message, args) {
        message.react('✅');
        setTimeout(function () { !isNaN(args[0]) && parseInt(args[0]) < 100 ? message.channel.bulkDelete(parseInt(args[0]) + 1) : message.channel.send("The amount has to be a number less then 100!"); }, 500);
    },
};