const firebase = require('firebase-admin')
const db = firebase.database()

module.exports = {
    registerEvents(client) {
        client.on('guildMemberAdd', member => {
            if (!global) return;
            var serv = global.Servers[member.guild.id]

            if (!serv) return;

            if (serv.enableWelcome == 0 || serv.enableWelcome == null) return;

            if (!serv.wchannel || !member.guild.channels.cache.has(serv.wchannel)) return;

            if (serv.role != member.guild.roles.everyone.id && member.guild.roles.cache.has(serv.role)) {
                member.roles.add(member.guild.roles.cache.get(serv.role))
            }

            var msg = !serv.wMsg ? `Welcome to ${member.guild.name}, ${member}!` : serv.wMsg;

            msg = msg.replace(/\{user\}/gmi, `${member}`)
            msg = msg.replace(/\{((guild)|(server))\}/gmi, `${member.guild.name}`)
            msg = msg.replace(/\{user.tag\}/gmi, `<@!${member.user.tag}>`)

            member.guild.channels.cache.get(serv.wchannel).send(msg)
        });

        client.on('guildMemberRemove', member => {
            if (!global) return;
            var serv = global.Servers[member.guild.id]

            if (!serv) return;

            if (serv.enableWelcome == 0 || serv.enableWelcome == null) return;

            if (!serv.fchannel || !member.guild.channels.cache.has(serv.fchannel)) {
                if (!serv.wchannel || !member.guild.channels.cache.has(serv.wchannel)) {
                    return
                }
                serv.fchannel = serv.wchannel;
            }

            var msg = !serv.fMsg ? `Farewell, ${member.user.tag}!` : serv.fMsg;

            msg = msg.replace(/\{user\}/gmi, `${member.user.tag}`)
            msg = msg.replace(/\{(guild)|(server)\}/gmi, `${member.guild.name}`)
            msg = msg.replace(/\{user.tag\}/gmi, `<@!${member.user.tag}>`)

            member.guild.channels.cache.get(serv.fchannel).send(msg)

            if (member.user.bot) return
            let userRef = db.ref(`Users/${member.guild.id}/${member.id}`);

            try {
                if (userRef) {
                    global.Users[member.guild.id][member.id].xp = 0;
                    global.Users[member.guild.id][member.id].level = 0;
                    userRef.update(global.Users[member.guild.id][member.id])
                }
            } catch (e) { }
        });

        client.on('guildUpdate', async (oldGuild, newGuild) => {
            if (!newGuild.me.hasPermission("VIEW_AUDIT_LOG")) return;

            const entry = await newGuild.fetchAuditLogs({ type: 'GUILD_UPDATE' }).then(audit => {
                var a = audit.entries.first()
                if (Date.now() - a.createdTimestamp < 20000) {
                    return a
                }
                else {
                    return null
                }
            }).catch(() => { return null })

            if (!entry || !entry.changes || !entry.changes[0]) return

            var changes = entry.changes

            if (!global.Servers[newGuild.id]) global.Servers[newGuild.id] = {}
            if (!global.Servers[newGuild.id]) global.Servers[newGuild.id].modlog = {}

            var modLogChannel = await global.Servers[newGuild.id].modlog
            if (modLogChannel == null || !newGuild.channels.cache.has(modLogChannel)) return;

            modLogChannel = newGuild.channels.cache.get(modLogChannel)

            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':rotating_light: Guild Updated').setDescription(`Executor: ${entry.executor}`)

            for (var change of changes) {
                var title = change.key.split('_').join(' ').toUpperCase()
                switch (change.key) {
                    default:
                        var isChannelUpdate = title.toUpperCase().includes('CHANNEL')


                        var oldS

                        if (change.old == undefined) {
                            oldS = "\`unset\`"
                        } else if (isChannelUpdate) {
                            var c = newGuild.channels.cache.get(change.old)
                            if (c.type == 'voice') oldS = `\`${c.name}\``
                            else oldS = `<#${change.old}>`
                        } else {
                            oldS = `\`${change.old}\``
                        }


                        var newS

                        if (change.new == undefined) {
                            newS = "\`unset\`"
                        } else if (isChannelUpdate) {
                            var c = newGuild.channels.cache.get(change.new)
                            if (c.type == 'voice') newS = `\`${c.name}\``
                            else newS = `<#${change.new}>`
                        } else {
                            newS = `\`${change.new}\``
                        }


                        embed.description += `\n\n${title}: ${oldS} >> ${newS}`
                        break;
                    case "default_message_notifications":
                        embed.description += `\n\n${title}: ${change.new == 1 ? `\`All Messages\` >> \`Only @mentions\`` : `\`Only @mentions\` >> \`All Messages\``}`
                        break;
                    case "afk_timeout":
                        embed.description += `\n\n${title}: \`${change.old / 60}m\` >> \`${change.new / 60}m\``
                        break;
                }
            }

            modLogChannel.send(embed)
            return;
        })
    }
}