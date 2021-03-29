const Discord = require('discord.js');

module.exports = {
    registerEvents(client) {
        client.on('guildMemberUpdate', async (oldMember, newMember) => {
            if (!newMember.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            const entry = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_ROLE_UPDATE' || 'MEMBER_UPDATE' }).then(audit => {
                var a = audit.entries.first()
                if (a.target.id == newMember.id || a.target.id == oldMember.id) {
                    return a;
                } else {
                    return null;
                }
            }).catch(() => { return null })
            if (!entry || !entry.changes) return
            var changes = entry.changes
            if (!global.Servers[newMember.guild.id]) global.Servers[newMember.guild.id] = {}
            if (!global.Servers[newMember.guild.id]) global.Servers[newMember.guild.id].modlog = {}
            var modLogChannel = await global.Servers[newMember.guild.id].modlog
            if (modLogChannel == null || !newMember.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = newMember.guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':satellite: Member Updated').setDescription(`Executor: ${entry.executor}`).setThumbnail(entry.target.displayAvatarURL({ format: "png", size: 512, dynamic: true }))
            for (var change of changes) {
                switch (change.key) {
                    case '$remove':
                        embed.description += `\n\n:chart_with_downwards_trend: Role Removed:\n\t- \`${change.new[0].name}\``
                        break;
                    case '$add':
                        embed.description += `\n\n:chart_with_upwards_trend: Role Added:\n\t- \`${change.new[0].name}\``
                        break;
                    case 'nick':
                        embed.setTitle(':satellite: Nickname Update');
                        var newNick = change.new == undefined ? entry.target.username : change.new;
                        var oldNick = change.old == undefined ? entry.target.username : change.old;
                        embed.description += `\n\n:file_folder: Old Nickname: \`${oldNick}\`\n:file_folder: New Nickname: \`${newNick}\``
                        break;
                }
            }
            embed.description += `\n\nTarget: ${entry.target.tag}`
            modLogChannel.send(embed)
        })
        client.on('channelCreate', async channel => {
            if (!channel || !channel.guild || !channel.guild.me) return;
            if (!channel.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[channel.guild.id]) global.Servers[channel.guild.id] = {}
            if (!global.Servers[channel.guild.id].modlog) global.Servers[channel.guild.id].modlog = {}
            if (channel.type == "dm") return;
            var modLogChannel = global.Servers[channel.guild.id].modlog
            if (modLogChannel == null || !channel.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = channel.guild.channels.cache.get(modLogChannel)
            const entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' }).then(audit => {
                var a = audit.entries.first()
                if (Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            })
            if (!entry) return
            var changes = entry.changes
            if (entry.reason == "nuke") return
            var details = `\n\n\n\n:rocket: Channel name: \`${channel.name}\`\n\n:question: Channel Type: \`${channel.type}\`\n\n:man_judge: Executor: ${entry.executor}`
            var embed = new Discord.MessageEmbed().setTitle(":satellite: Channel Created").setColor('3d7b2f').setDescription(details);
            if (channel.guild.iconURL()) {
                embed.setThumbnail(channel.guild.iconURL({ size: 128, format: "png", dynamic: true }))
            } else {
                embed.setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
            }
            modLogChannel.send(embed)
        })
        client.on('channelDelete', async channel => {
            if (!channel.guild.me) return;
            if (!channel.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[channel.guild.id]) global.Servers[channel.guild.id] = {}
            if (!global.Servers[channel.guild.id]) global.Servers[channel.guild.id].modlog = {}
            if (channel.type == "dm") return;
            const entry = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' }).then(audit => {
                var a = audit.entries.first()
                if (Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            })
            if (!entry) return
            if (entry.reason == "nuke") return
            var modLogChannel = global.Servers[channel.guild.id].modlog
            if (modLogChannel == null || !channel.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = channel.guild.channels.cache.get(modLogChannel)
            var details = `\n\n\n\n:file_folder: Channel name: \`${channel.name}\`\n\n:question: Channel Type: \`${channel.type}\`\n\n:man_judge: Executor: ${entry.executor}`
            var embed = new Discord.MessageEmbed().setTitle("Channel Deleted").setColor('3d7b2f').setDescription(details);
            if (channel.guild.iconURL()) {
                embed.setThumbnail(channel.guild.iconURL({ size: 128, format: "png", dynamic: true }))
            } else {
                embed.setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
            }
            modLogChannel.send(embed)
        })
        client.on('guildBanAdd', async (guild, user) => {
            if (!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
            if (!global.Servers[guild.id]) global.Servers[guild.id].modlog = {}
            const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then(audit => {
                var a = audit.entries.first()
                if (a.target.id == user.id && Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            })
            if (!entry) return;
            var modLogChannel = global.Servers[guild.id].modlog
            if (modLogChannel == null || !guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed()
                .setTitle("<a:banHammer:758603864978489374> User Banned").setColor("#FF0000")
                .setThumbnail(user.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
                .setDescription(`:hammer: Banned user: \`${entry.target.tag}\`\n\n:question: Reason: \`${entry.reason == null ? "Unspecified" : entry.reason}\`\n\n:man_judge: Executor: ${entry.executor}`)
            modLogChannel.send(embed)
        })
        client.on('guildBanRemove', async (guild, user) => {
            if (!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
            if (!global.Servers[guild.id]) global.Servers[guild.id].modlog = {}
            const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_REMOVE' }).then(audit => {
                var a = audit.entries.first()
                if (a.target.id == user.id && Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            })
            if (!entry) return;
            var modLogChannel = global.Servers[guild.id].modlog
            if (modLogChannel == null || !guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed()
                .setTitle("<a:banHammer:758603864978489374> Ban Revoked").setColor("#FF0000")
                .setThumbnail(user.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
                .setDescription(`:hammer: User: \`${entry.target.tag}\`\n\n:man_judge: Executor: ${entry.executor}`)
            modLogChannel.send(embed)
        })
        client.on('messageDelete', async message => {
            if (message.channel.type == "dm") return;
            if (!message.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[message.guild.id]) global.Servers[message.guild.id] = {}
            if (!global.Servers[message.guild.id]) global.Servers[message.guild.id].modlog = {}
            var authorID = message.author ? message.author.id : null;
            const entry = await message.guild.fetchAuditLogs({ type: 'MESSAGE_DELETE' }).then(audit => {
                var a = audit.entries.first()
                if (authorID) {
                    if (a.target.id == message.author.id && Date.now() - a.createdTimestamp < 20000) {
                        return a
                    } else {
                        return null
                    }
                }
                else {
                    return false;
                }
            })
            if (entry === false) return;
            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(":x: Message Deleted")
            var modLogChannel = global.Servers[message.guild.id].modlog
            if (modLogChannel == null || !message.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = message.guild.channels.cache.get(modLogChannel)
            if (entry) {
                embed.setDescription(`:bust_in_silhouette: Message Author: ${entry.target}\n\n:loudspeaker: Message Location: <#${message.channel.id}>\n\n:man_judge: Executor: ${entry.executor}\n\n💬 Message Content: ${message.content}`)
            } else {
                embed.setDescription(`:bust_in_silhouette: Message Author: ${message.member}\n\n:loudspeaker: Message Location: <#${message.channel.id}>\n\n:man_judge: Executor: Deleted By Author\n\n💬 Message Content: ${message.content}`)
            }
            modLogChannel.send(embed)
        })
        client.on('roleCreate', async (role) => {
            if (!role.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[role.guild.id]) global.Servers[role.guild.id] = {}
            if (!global.Servers[role.guild.id]) global.Servers[role.guild.id].modlog = {}
            const entry = await role.guild.fetchAuditLogs({ type: 'ROLE_CREATE' }).then(audit => {
                var a = audit.entries.first()
                if (a.target.id == role.id && Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            }).catch(() => { return null })
            if (!entry) return;
            var modLogChannel = global.Servers[role.guild.id].modlog
            if (modLogChannel == null || !role.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = role.guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(":rocket: Role Created")
                .setDescription(`:hash: Role Name: \`${entry.target.name}\`\n\n:rainbow:  Role Color: ${entry.target.hexColor}\n\n:man_judge: Executor: ${entry.executor}`)
                .setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
            modLogChannel.send(embed)
        })
        client.on('roleDelete', async (role) => {
            if (!role.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            if (!global.Servers[role.guild.id]) global.Servers[role.guild.id] = {}
            if (!global.Servers[role.guild.id]) global.Servers[role.guild.id].modlog = {}
            const entry = await role.guild.fetchAuditLogs({ type: 'ROLE_DELETE' }).then(audit => {
                var a = audit.entries.first()
                if (a.target.id == role.id && Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            }).catch(() => { return null })
            if (!entry) return;
            var modLogChannel = global.Servers[role.guild.id].modlog
            if (modLogChannel == null || !role.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = role.guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(":x: Role Deleted")
                .setDescription(`:hash: Role Name: \`${role.name}\`\n\n:man_judge: Executor: ${entry.executor}`)
                .setThumbnail(entry.executor.displayAvatarURL({ format: "png", size: 128, dynamic: true }))
            modLogChannel.send(embed)
        })
        client.on('roleUpdate', async (oldRole, newRole) => {
            if (!newRole.guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            const entry = await newRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE' }).then(audit => {
                var a = audit.entries.first()
                if (a.target.id == newRole.id && Date.now() - a.createdTimestamp < 20000) {
                    return a
                } else {
                    return null
                }
            }).catch(() => { return null })
            if (!entry || !entry.changes || !entry.changes[0]) return
            var changes = entry.changes
            if (!global.Servers[newRole.guild.id]) global.Servers[newRole.guild.id] = {}
            if (!global.Servers[newRole.guild.id]) global.Servers[newRole.guild.id].modlog = {}
            var modLogChannel = await global.Servers[newRole.guild.id].modlog
            if (modLogChannel == null || !newRole.guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = newRole.guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':satellite: Role Updated').setDescription(`Executor: ${entry.executor}`)
            if (oldRole.permissions != newRole.permissions) {
                var oldPerms = oldRole.permissions.serialize();
                var newPerms = newRole.permissions.serialize();
                var permsGained = []
                var permsLost = []
                for (var [key, elm] of Object.entries(oldPerms)) {
                    if (newPerms[key] !== elm) {
                        if (newPerms[key]) {
                            permsGained.push(key)
                        } else {
                            permsLost.push(key)
                        }
                    }
                }
                if (permsGained.length > 0) {
                    embed.description += `\n\nPermissions Gained: ${permsGained.map(p => `\`${p}\``)}`
                }
                if (permsLost.length > 0) {
                    embed.description += `\n\nPermissions Revoked: ${permsLost.map(p => `\`${p}\``)}`
                }
            }
            for (var change of changes) {
                switch (change.key) {
                    case 'name':
                        embed.description += `\n\nName Changed: \`${change.old}\` >> \`${change.new}\``
                        break;
                    case 'color':
                        embed.description += `\n\nColor Changed: \`#${decimalToHexString(change.old)}\` >> \`#${decimalToHexString(change.new)}\``
                        break;
                    case 'hoist':
                        embed.description += `\n\nDisplay Separaetly: \`${change.old}\` >> \`${change.new}\``
                        break;
                    case 'mentionable':
                        embed.description += `\n\nCan be @mentioned by anyone: \`${change.old}\` >> \`${change.new}\``
                        break;
                }
            }
            embed.description += `\n\nTarget Role: ${entry.target}`
            modLogChannel.send(embed)
            return;
        })
        client.on('channelUpdate', async (oldC, newC) => {
            if (oldC.type == "dm" || newC.type == "dm") return;
            var guild = client.guilds.cache.get(newC.guild.id)
            if (!guild.me.hasPermission("VIEW_AUDIT_LOG")) return;
            var entry = null
            const sArr = ['CHANNEL_OVERWRITE_UPDATE', 'CHANNEL_UPDATE', 'CHANNEL_OVERWRITE_CREATE', 'CHANNEL_OVERWRITE_DELETE']
            for (var i = 0; i < 3; i++) {
                if (entry != null) break;
                entry = await guild.fetchAuditLogs({ type: sArr[i] }).then(audit => {
                    var a = audit.entries.first()
                    if (Date.now() - a.createdTimestamp < 20000) {
                        return a
                    }
                    else {
                        return null
                    }
                }).catch(() => { return null })
            }
            if (!entry || !entry.changes) return
            var changes = entry.changes
            if (!global.Servers[guild.id]) global.Servers[guild.id] = {}
            if (!global.Servers[guild.id]) global.Servers[guild.id].modlog = {}
            var modLogChannel = await global.Servers[guild.id].modlog
            if (modLogChannel == null || !guild.channels.cache.has(modLogChannel)) return;
            modLogChannel = guild.channels.cache.get(modLogChannel)
            var embed = new Discord.MessageEmbed().setColor('3d7b2f').setTitle(':rotating_light: Channel Updated').setDescription(`Executor: ${entry.executor}\n\n`)
            var msg = ""
            for (var change of changes) {
                //var title = change.key.split('_').join(' ').toUpperCase()
                switch (change.key) {
                    case "allow":
                    case "deny":
                        //Sort channel overwrites to a nicer object :)
                        var perms = {}
                        for (var ow of entry.target.permissionOverwrites.array()) {
                            perms[ow.id] = {
                                deny: ow.deny.bitfield,
                                allow: ow.allow.bitfield
                            }
                        }
                        //Get affected role
                        var r = getKeyByValue(perms, change.new)
                        var oldO = new Discord.Permissions(change.old).serialize()
                        var newO = new Discord.Permissions(change.new).serialize()
                        var diffN = []
                        var diffO = []
                        for (var [key, elm] of Object.entries(oldO)) {
                            if (newO[key] !== elm) {
                                if (newO[key]) {
                                    diffN.push(key)
                                }
                                else {
                                    diffO.push(key)
                                }
                            }
                        }
                        if (diffN.length > 0) {
                            if (!msg.includes("Permission Overwrite Updated")) msg += `:inbox_tray: Permission Overwrite Updated:\n\t`
                            if (!msg.includes(r)) {
                                msg += `<@${guild.members.cache.has(r) ? "" : '&'}${r}> -\n`
                            }
                            msg += "\t" + (change.key == "deny" ? "Denied" : "Allowed") + ` Permissions: ${diffN}\n\n`
                        }
                        break;
                    case "name":
                        msg += `:globe_with_meridians: Channel Name: \`${change.old}\` >> \`${change.new}\`\n\n`
                        break;
                    case "rate_limit_per_user":
                        var oldL = change.old == 0 ? "Off" : SecondsToMaxTimeUnit(change.old)
                        var newL = change.new == 0 ? "Off" : SecondsToMaxTimeUnit(change.new)
                        msg += `:alarm_clock: Slowmode: \`${oldL}\` >> \`${newL}\`\n\n`
                        break;
                    case "nsfw":
                        msg += `:underage: NSFW: \`${change.old}\` >> \`${change.new}\`\n\n`
                        break;
                    case "topic":
                        msg += `:scroll: Topic: \`${change.old ? change.old : "unset"}\` >> \`${change.new ? change.new : "unset"}\`\n\n`
                        break;
                    case "type":
                        var cTypes = ["GUILD_TEXT", "DM", "GUILD_VOICE", "GROUP_DM", "GUILD_CATEGORY", "GUILD_NEWS", "GUILD_STORE"]
                        msg += `:question: Channel Type: \`${cTypes[change.old]}\` >> \`${cTypes[change.new]}\`\n\n`
                        break;
                }
            }
            embed.description += msg + `Target Channel: ${entry.target.type == "voice" ? `\`${entry.target.name}\`` : entry.target}`
            modLogChannel.send(embed)
        })

        function getKeyByValue(object, value) {
            return Object.keys(object).find(key => object[key] === value);
        }
    }
}