client.on('message', message => {
    // N-Word Detection
    if (message.content.match(nwordRegEx)) {
        switch (global.Servers[message.guild.id].nword) {
            case "1":
                message.delete();
                return;
            case "2":
                if (message.member.bannable) {
                    var reg = new RegExp(nwordRegEx)
                    reg.test(message.content)
                    var firstIndx = message.content.search(nwordRegEx)
                    message.member.ban({ reason: `Said the N-Word. Detected: "${message.content.substr(firstIndx, reg.lastIndex - firstIndx)}"` })
                    message.delete()
                }
                return;
        }
    }

    if (message.content.match(inviteRegEx))
        if (global.Servers[message.guild.id].remInvState)
            if (global.Servers[message.guild.id].allowedInvChannels) {
                if (!global.Servers[message.guild.id].allowedInvChannels.includes(message.channel.id)) {

                    if (global.Servers[message.guild.id].allowedInvRoles) {
                        var mRoles = message.member.roles.cache.array().map(x => x.id)
                        var aRoles = global.Servers[message.guild.id].allowedInvRoles

                        var _delete = true;

                        for (var role of mRoles) {
                            if (aRoles.includes(role)) {
                                _delete = false
                            }
                        }

                        if (_delete) message.delete()
                    }
                    else {
                        message.delete()
                    }
                }
            }
            else {
                if (global.Servers[message.guild.id].allowedInvRoles) {
                    var mRoles = message.member.roles.cache.array().map(x => x.id)
                    var aRoles = global.Servers[message.guild.id].allowedInvRoles

                    var _delete = true;

                    for (var role of mRoles) {
                        if (aRoles.includes(role)) {
                            _delete = false
                        }
                    }

                    if (_delete) message.delete()
                }
                else {
                    message.delete()
                }
            }

    if (!global.Users) return;

    var msgCnt = message.content.substring(0, 3)
    if (msgCnt.match(/(51\.)|(ff\.)|(52\.)/gmi) || skipServers.includes(message.guild.id.toString())) return;

    // Check if member claimed XP
    if (!dontGiveXPto) dontGiveXPto = {};
    if (!dontGiveXPto[message.guild.id]) dontGiveXPto[message.guild.id] = {};

    if (dontGiveXPto[message.guild.id][message.member.id] == undefined) {
        // If not, add them to the claimed XP obj
        dontGiveXPto[message.guild.id][message.member.id] = Date.now();
        if (!global.Users[message.guild.id]) global.Users[message.guild.id] = {}

        // Check if user has a data obj, if not, create one
        if (!global.Users[message.guild.id][message.member.id]) {
            global.Users[message.guild.id][message.member.id] = {
                lvl: 0,
                xp: 0,
                warns: [],
                roles: []
            }
            firebase.database().ref().child('Users').update(global.Users)
        }

        // Check if XP claiming is blocked in that channel
        try {
            if (global.Servers[message.guild.id].noxp.indexOf(message.channel.id) > -1) return;
        } catch { }

        // XP Reward
        var rnd = (Math.floor(Math.random() * 16) + 10)

        // XP Multiplier
        if (global.Servers[message.guild.id].multiplier && !Number.isNaN(global.Servers[message.guild.id].multiplier)) {
            rnd *= global.Servers[message.guild.id].multiplier;
        }
        // add Reward
        global.Users[message.guild.id][message.member.id].xp += rnd


        var userLevel = global.Users[message.guild.id][message.member.id].lvl
        var neededXP = userLevel > 36 ? 100000 : levels[userLevel]

        // Check if user leveled up
        if (global.Users[message.guild.id][message.member.id].xp >= neededXP) {
            global.Users[message.guild.id][message.member.id].xp -= neededXP
            if (global.Users[message.guild.id][message.member.id].lvl >= 65535) {
                message.channel.send("Your level is so big, you can't go further anymore! You really are special.")
            }
            else {
                global.Users[message.guild.id][message.member.id].lvl++;
                userLevel++;

                // Check if announcing level ups is enabled
                if (global.Servers[message.guild.id].shoutLvl) {
                    // Default level up message
                    var msg = `<@!${message.member.id}> Has advanced to level ${userLevel}`

                    // Check if a custom level up message exists, if yes, use it.
                    if (global.Servers[message.guild.id].lvlMsg) {
                        msg = global.Servers[message.guild.id].lvlMsg
                        msg = msg.replace(/\{user\}/gmi, `<@!${message.member.id}>`)
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
        }
        firebase.database().ref().child('Users').child(message.guild.id).update(global.Users[message.guild.id])
    }


    // EVENTS //

    if (!eventCooldown[message.guild.id] && global.Servers[message.guild.id].events) {
        if (Math.floor(Math.random() * 26) == 14) {
            eventCooldown[message.guild.id] = Date.now()
            var events = JSON.parse(fs.readFileSync("events.json"))
            var rarity = Object.keys(events)[Math.floor(Math.random() * Object.keys(events).length)]
            events = events[rarity]
            var event = events[Math.floor(Math.random() * events.length)]
            var embed = new Discord.MessageEmbed().setColor("3d7b2f")
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
                        var em = new Discord.MessageEmbed().setColor("3d7b2f")
                            .setTitle(`The event has ended!`)
                            .setDescription("");

                        for (var userR of usersToReward) {

                            var reward = Math.floor(Math.random() * (event.rewardMax - event.rewardMin + 1) + event.rewardMin)
                            global.Users[message.guild.id][userR].xp += reward
                            em.description += `<@!${userR}> has recieved ${reward} XP!\n`

                            var userLevel = global.Users[message.guild.id][userR].lvl
                            var neededXP = userLevel > 36 ? 100000 : levels[userLevel]

                            // Check if user leveled up
                            if (global.Users[message.guild.id][message.member.id].xp >= neededXP) {
                                global.Users[message.guild.id][message.member.id].xp -= neededXP
                                if (global.Users[message.guild.id][message.member.id].lvl >= 65535) {
                                    message.channel.send("Your level is so big, you can't go further anymore! You really are special.")
                                }
                                else {
                                    global.Users[message.guild.id][message.member.id].lvl++;
                                    userLevel++;

                                    // Check if announcing level ups is enabled
                                    if (global.Servers[message.guild.id].shoutLvl) {
                                        // Default level up message
                                        var msg = `<@!${message.member.id}> Has advanced to level ${userLevel}`

                                        // Check if a custom level up message exists, if yes, use it.
                                        if (global.Servers[message.guild.id].lvlMsg) {
                                            msg = global.Servers[message.guild.id].lvlMsg
                                            msg = msg.replace(/\{user\}/gmi, `<@!${message.member.id}>`)
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
})

/* function getKeyByValue(object, valueToFind) {
    return Object.keys(object).find(key => Object.keys(object[key]).find(key_ => object[key][key_] == valueToFind));
}

function decimalToHexString(number) {
    if (number < 0) {
        number = 0xFFFFFFFF + number + 1;
    }

    return number.toString(16).toUpperCase();
}

function SecondsToMaxTimeUnit(seconds) {
    if (seconds > 60 * 60) {
        return seconds / (60 * 60) + "h"
    } else if (seconds > 60) {
        return seconds / 60 + "m"
    } else {
        return seconds + "s"
    }
} */