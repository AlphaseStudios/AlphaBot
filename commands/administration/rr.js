const Discord = require("discord.js")
const firebase = require("firebase-admin")
module.exports = {
    name: 'rr',
    description: 'Make a reactionrole.',
    aliases: ['reactionrole'],
    guildOnly: true,
    execute(client, message, args) {
        if (!message.member.hasPermission("ADMINISTRATOR")) return;

        var guild = message.guild;

        if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
        if (!global.Servers[guild.id].rr) global.Servers[guild.id].rr = {}

        switch (args[0]) {
            case "add":
                if (!message.mentions.channels.first()) {
                    message.channel.send("Please mention a channel!")
                    return false;
                }

                var chnl = message.mentions.channels.first()

                message.channel.send("Please send the ID of the message you want Reaction Roles on\n\n\n\nHow to get the ID of your message: <https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID>")

                var mCollector = message.channel.createMessageCollector(m => m.member == message.member, { time: 15000 })

                var collectedMsg
                var collectedReaction
                var collectedRole
                var collectedType



                //                       //
                // MESSAGE COLLECTION #1 //
                //                       //

                mCollector.on('collect', (cMsg) => {
                    chnl.messages.fetch(cMsg.content).then(fMsg => {
                        if (!fMsg) {
                            message.channel.send(`Please enter the ID of a message that exists in ${chnl}!`)
                            mCollector.dispose(cMsg);
                        }
                        else {
                            collectedMsg = fMsg

                            mCollector.stop("Collected Successfully")

                            message.channel.send("React to this message with the emote you want people to react with!").then(bMsg => {

                                //                     //
                                // REACTION COLLECTION //
                                //                     //

                                var rCollector = bMsg.createReactionCollector((reaction, user) => user.id == message.member.id, { time: 15000 })

                                rCollector.on('collect', (reaction, user) => {
                                    collectedReaction = reaction

                                    rCollector.stop("Collected Successfully")

                                    message.channel.send("Now mention the role you want the user to get once they react").then(bMsg => {
                                        var mCollectorTwo = message.channel.createMessageCollector(m => m.member == message.member, { time: 15000 })

                                        mCollectorTwo.on('collect', (cMsg) => {
                                            if (!collectedRole) {
                                                if (!cMsg.mentions.roles.first()) cMsg.channel.send("You haven't mentioned a role!")
                                                else {
                                                    var tmp = []

                                                    for (const [key, value] of Object.entries(global.Servers[guild.id].rr)) {
                                                        if (key == collectedMsg.id) {
                                                            tmp.push(value.role)
                                                        }
                                                    }

                                                    if (hasDupes(tmp)) {
                                                        message.channel.send("Users can already get this role from a different or a similar emote!");
                                                        mCollectorTwo.resetTimer();
                                                    }
                                                    else {
                                                        collectedRole = cMsg.mentions.roles.first();
                                                        mCollectorTwo.resetTimer();
                                                        message.channel.send("Please enter the type of the RR:\n\n1: \`Verify\` - User gets the role when reacts, and he cant react again or remove the role.\n\n2: \`Choice\` - User gets the role when reacts, user loses the role when removes reaction.")
                                                    }

                                                    function hasDupes(arr) {
                                                        return arr.some((val, i) => arr.indexOf(val) !== i);
                                                    }
                                                }
                                            }
                                            else {
                                                if (isNaN(parseInt(cMsg.content)) || parseInt(cMsg.content) > 2 || parseInt(cMsg.content) < 1) {
                                                    message.channel.send("Please type a number from 1 to 2!")
                                                }
                                                else {
                                                    collectedType = parseInt(cMsg.content)
                                                    fMsg.react(collectedReaction.emoji)


                                                    var emoteID = collectedReaction.emoji.id ? collectedReaction.emoji.id : collectedReaction.emoji.name
                                                    var dt = { role: collectedRole.id, type: collectedType }

                                                    if (!global.Servers[guild.id].rr[collectedMsg.id]) global.Servers[guild.id].rr[collectedMsg.id] = {}
                                                    global.Servers[guild.id].rr[collectedMsg.id][emoteID] = dt

                                                    message.channel.send("Successfully added RR to \`" + collectedMsg.id + "\`!")

                                                    global.SaveTo(`Servers/${message.guild.id}/rr/${collectedMsg.id}/${emoteID}`, dt)

                                                    mCollectorTwo.stop("Collected successfully.")
                                                }
                                            }

                                        })

                                        mCollectorTwo.on('end', (collected, reason) => {
                                            if (reason == "time") {
                                                message.channel.send("You haven't responded in time!")
                                            }
                                        })

                                    })
                                })

                                rCollector.on('end', (collected, reason) => {
                                    if (reason == "time") {
                                        message.channel.send("You haven't responded in time!")
                                    }
                                })
                            })
                        }
                    }).catch(e => { message.channel.send(new Discord.MessageEmbed().setTitle(e.stack.split('\n')[0]).setColor("8b0000")) })
                })

                mCollector.on('end', (collected, reason) => {
                    if (reason == "time") {
                        message.channel.send("You haven't responded in time!")
                    }
                })
                break;

            case "remove":
                var msgID = args[1]
                if (!args[1]) message.channel.send("Please type a message ID!")
                else if (!global.Servers[guild.id].rr[msgID]) message.channel.send("There are no RR configured for this message!")
                else {
                    if (Object.keys(global.Servers[guild.id].rr[msgID]).length > 1) {
                        message.channel.send("There seem to be multiple Reaction Roles configured for this message, react to this message with the reaction you want to remove from that message, or reply with \`*\` to remove all.").then(bMsg => {
                            var rCollector = bMsg.createReactionCollector((reaction, user) => user.id == message.member.id, { time: 15000 })
                            var mCollector = message.channel.createMessageCollector(m => m.member.id == message.member.id && m.content == "*", { time: 15000 })

                            rCollector.on("collect", (reaction, user) => {
                                var cR = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name
                                if (global.Servers[guild.id].rr[msgID][cR]) {

                                    global.SaveTo(`Servers/${message.guild.id}/rr/${msgID}/${cR}`, null)
                                    delete global.Servers[guild.id].rr[msgID][cR]
                                    message.channel.send(`Successfully removed the ${cR} reaction from ${msgID}!`)
                                    mCollector.stop("Successfully collected")
                                    rCollector.stop("Successfully collected")

                                }
                            })

                            rCollector.on('end', (collected, reason) => {
                                if (reason == "time") {
                                    message.channel.send("You haven't responded in time!")
                                }
                            })

                            mCollector.on("collect", msg => {
                                global.SaveTo(`Servers/${message.guild.id}/rr/${msgID}`, null)
                                delete global.Servers[guild.id].rr[msgID]
                                message.channel.send(`Successfully removed all the Reaction Roles from ${msgID}!`)
                                mCollector.stop("Successfully collected")
                                rCollector.stop("Successfully collected")
                            })
                        })
                    }
                    else {
                        global.SaveTo(`Servers/${message.guild.id}/rr/${msgID}`, null)
                        delete global.Servers[guild.id].rr[msgID]
                        message.channel.send(`Successfully removed ${msgID} from the RR!`)
                    }

                }
                break;

            default:
                var msg = new Discord.MessageEmbed().setColor("#FF0000").setTitle("Reaction Roles in this server:").setDescription("")
                for (var [_key, _val] of Object.entries(global.Servers[guild.id].rr)) {
                    for (var [key, val] of Object.entries(global.Servers[guild.id].rr[_key])) {
                        msg.description += `\`${_key}\`:\n`

                        var rct = key
                        var role = val.role
                        var type = val.type

                        var desc = `\tRole: <@&${role}>\n\tType: \`${["Verify", "Choice"][type - 1]}\`\n\t`

                        if (message.guild.emojis.cache.get(rct)) {
                            desc += `Emote: ${message.guild.emojis.cache.get(rct)}`
                        }
                        else if (message.guild.emojis.cache.find(e => e.name == rct)) {
                            desc += `Emote: ${message.guild.emojis.cache.find(e => e.name == rct)}`
                        }
                        else {
                            desc += `Emote: ${rct}`
                        }

                        msg.description += `${desc}\n\n`
                    }
                }

                if (msg.description == "") msg.description = "There are no RR configured in this server!"
                message.channel.send(msg)
                break;
        }
    },
};