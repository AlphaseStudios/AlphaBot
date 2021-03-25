module.exports = {
    name: 'website',
    aliases: ['site', 'web'],
    description: 'Gives you a link to our website.',
    execute(client, message, args) {
        message.channel.send("https://51devs.xyz\nNote: We are working on a new site. Coming soon...");
    }
}

module.exports = {
    name: 'source',
    aliases: ['opensource', 'github'],
    description: 'Gives you a link to the source of this project.',
    execute(client, message, args) {
        message.channel.send("Heres a link to my source on GitHub: https://github.com/AlphaseStudios/AlphaBot.");
    }
}