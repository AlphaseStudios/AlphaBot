const Discord = require('discord.js');
const utils = require('../../utils.js');
const axios = require('axios')
const fs = require('fs')
require('dotenv').config();

module.exports = {
    name: 'request',
    aliases: ['axios', 'curl'],
    usage: '-m (METHOD) -h (URL including path)',
    description: 'Make a request to a webserver!',
    args: -1,
    parseCommands: true,
    execute(client, command, message, args) {
        var method = getArgument("m");
        var url = getArgument("h");
        message.channel.send(`Information\nMETHOD: ${method}\nURL: ${url}`);
        if (method.toLowerCase() == 'get') {
            message.channel.send("Making request...")
                .then((msg) => {
                    axios.get(url)
                        .then((res) => {
                            if (res.status != 200) msg.edit(`The server responded with a ${res.status} (${res.statusText})`)
                            r = Math.floor(Math.random() * Math.floor(999999999999));
                            fs.writeFile(`./resources/${r}.json`, JSON.stringify(res.data), null, () => {
                                message.channel.send('JSON:', { files: [`./resources/${r}.json`] }).then(() => {
                                    fs.unlink(`./resources/${r}.json`, () => {
                                        msg.edit("Uploaded successfully!");
                                    });
                                });
                            });

                        })
                        .catch((err) => {
                            message.channel.send(`\`\`\`log\n${err.stack}\`\`\``);
                            console.log(err);
                        });
                });
        } else if (method.toLowerCase() == 'post') {
            msg.channel.send("I am currently unable to do POST requests.")
        }

        /* var url = `https://duckduckgo.com/?q=${escape(args.join(" "))}&format=json`; */
        /* message.channel.send("Searching the web...")
            .then((msg) => {
                axios.get(url)
                    .then((res) => {
                        if (res.status != 200) message.channel.send(`The server responded with a ${res.status} (${res.statusText})`)
                        /* console.log(response.data); */
        /* var embed = new Discord.MessageEmbed().setTitle(`Search results for \'${args.join(" ")}\'`);
        var results = res.data['items'];
        for (i in results) {
            if (!results[i].title.includes('porn') || !results[i].snippet.includes('porn')) {
                embed.addField(`${results["Abstract"]}`, `${results["AbstractText"]}\n[Follow](${results["AbstractURL"]})`);
            }
        }
        msg.edit(embed);
    })
                    .catch((err) => {
        utils.discordException(client, err, message, command);
    });
}); * /
 */

        function getArgument(arg, all) {
            if (arg == null) return null;
            arg = `-${arg}`;
            for (i in args) {
                i = parseInt(i);
                if (args[i] == arg) {
                    if (args[i + 1] == null) return null;
                    if (all == true) return args.slice(i + 1, args.length).join(" ");
                    return args[i + 1];
                }
            }
        }
    },
};