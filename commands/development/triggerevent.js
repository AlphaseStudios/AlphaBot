const Discord = require('discord.js');

module.exports = {
    name: 'triggerevent',
    description: 'Trigger a event.',
    devOnly: true,
    execute(client, message, args) {
        var events = JSON.parse(fs.readFileSync("./events.json"))
        var rarity = Object.keys(events)[Math.floor(Math.random() * Object.keys(events).length)]
        events = events[rarity]
        var event = events[Math.floor(Math.random() * events.length)]
        var embed = new Discord.MessageEmbed().setColor("#FF0000")
            .setTitle(`${rarity} event time!`)
            .setDescription(`${event.title}\n\n${event.body}`)
            .setFooter(`Max [ ${event.entries} ] entries`);

        message.channel.send(embed).then(bMsg => {
            var collector = message.channel.createMessageCollector(m => m.content.toLowerCase() == event.collect, { time: 10000, max: event.entries })
            var usersToReward = []

            collector.on('collect', msg => {
                if (usersToReward.indexOf(msg.member.id) == -1) {
                    usersToReward.push(msg.member.id)
                    msg.react('✅')
                }
            })

            collector.on('end', (collected, reason) => {
                if (usersToReward.length > 0) {
                    var em = new Discord.MessageEmbed().setColor("#FF0000")
                        .setTitle(`The event has ended!`)
                        .setDescription("");

                    for (var userR of usersToReward) {

                        var reward = Math.floor(Math.random() * (event.rewardMax - event.rewardMin + 1) + event.rewardMin)
                        global.Users[message.guild.id][userR].xp += reward
                        em.description += `<@!${userR}> has recieved ${reward} XP!\n`

                        var userLevel = global.Users[message.guild.id][userR].lvl
                        var neededXP = userLevel > 36 ? 100000 : levels[userLevel]

                        // Check if user leveled up
                        if (global.Users[message.guild.id][userR].xp >= neededXP) {
                            global.Users[message.guild.id][userR].xp -= neededXP
                            global.Users[message.guild.id][userR].lvl++;
                            userLevel++;

                            // Check if announcing level ups is enabled
                            if (global.Servers[message.guild.id].shoutLvl) {
                                // Default level up message
                                var msg = `<@!${userR}> Has advanced to level ${userLevel}`

                                // Check if a custom level up message exists, if yes, use it.
                                if (global.Servers[message.guild.id].lvlMsg) {
                                    msg = global.Servers[message.guild.id].lvlMsg
                                    msg = msg.replace(/\{user\}/gmi, `<@!${userR}>`)
                                    msg = msg.replace(/\{user.tag\}/gmi, `<@!${message.author.tag}>`)
                                    msg = msg.replace(/\{level\}/gmi, `${userLevel}`)
                                    msg = msg.replace(/\{((guild)|(server))\}/gmi, `<@!${message.guild.name}>`)
                                }

                                // Check if any specific channel was set to the level-up announcement channel, if yes send it there, if not send it in the same channel the user has leveled up in.
                                if (global.Servers[message.guild.id].shoutC && message.guild.channels.cache.has(global.Servers[message.guild.id].shoutC)) {
                                    var c = message.guild.channels.cache.get(global.Servers[message.guild.id].shoutC)
                                    c.send(msg);
                                } else {
                                    message.channel.send(msg)
                                }
                            }

                            // Check if server has milestones
                            if (global.Servers[message.guild.id].milestones) {

                                //if yes, check if user has reached them.
                                if (global.Servers[message.guild.id].milestones[userLevel.toString()]) {
                                    // add the milestone role.
                                    try {
                                        message.member.roles.add(global.Servers[message.guild.id].milestones[userLevel.toString()])
                                    } catch { }
                                }
                            }
                        }
                        firebase.database().ref().child('Users').child(message.guild.id).update(global.Users[message.guild.id])
                    }
                    message.channel.send(em)
                }
                bMsg.edit("`THE EVENT HAS ENDED, NO FURTHER ENTRIES WILL BE ACCEPTED`", embed)
            })
        })
    }
}