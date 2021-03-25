const fs = require('fs');
const Discord = require('discord.js');
/* const config = require('../../resources/config.json'); */
const { Octokit } = require("@octokit/core");
const octokit = new Octokit({
    auth: 'b3d79ec3500b6d412c2222f76533f14d596331f3',
    baseUrl: "https://api.github.com",
})

module.exports = {
    name: 'version',
    aliases: ['ver', 'changelog'],
    description: 'Get the current version information',
    async execute(client, message, args) {
        filename = './resources/response.json';

        fs.stat(filename, async function (err, stats) {
            var mtime = stats.mtime;
            ctime = new Date();
            mtime = new Date(mtime);
            d = ctime.getDay() - mtime.getDay();
            if (d > 1 || d < 0) {
                response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
                    owner: 'AlphaseStudios',
                    repo: 'AlphaBot'
                });
                fs.writeFileSync(filename, JSON.stringify(response));
            }
        });

        const months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        response = fs.readFileSync(filename)
        response = JSON.parse(response);
        data = response['data'][0];
        date = new Date(data['commit']['author']['date']);
        var embed = new Discord.MessageEmbed()
            .setColor('#FF0000')
            .setTitle('Last repo commit')
            .setDescription('Last AlphaBot Github repo commit')
            .addFields(
                { name: 'ID', value: data['sha'].slice(0, 7) },
                { name: 'Date', value: `${months[date.getMonth()]} ${date.getDay()}, ${date.getFullYear()}` },
                { name: 'Message', value: data['commit']['message'] },
            )
            .setTimestamp()
            .setFooter(`Executed by ${message.author.username}`, message.author.avatarURL({ format: "png" }));
        message.channel.send(embed)
    }
};