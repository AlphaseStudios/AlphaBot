module.exports = {
    registerEvents(client) {
        client.on('messageReactionAdd', (reaction, user) => {
            if (reaction.message.channel.type == "dm" || user.bot) return;
            var guild = reaction.message.guild;

            if (!global.Servers[guild.id] || !global.Servers[guild.id].rr) return;
            var rrDt = global.Servers[guild.id].rr[reaction.message.id]

            if (!rrDt) return;
            var reactionID = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name

            rrDt = rrDt[reactionID]
            if (!rrDt) return

            if (guild.roles.cache.has(rrDt.role)) {
                if (!guild.members.cache.get(user.id).roles.cache.has(rrDt.role)) {
                    guild.members.cache.get(user.id).roles.add(rrDt.role)
                    if (rrDt.type == 1) {
                        reaction.users.remove(user.id)
                    }
                }
                else reaction.users.remove(user.id)
            }
        });

        client.on('messageReactionRemove', (reaction, user) => {
            if (reaction.message.channel.type == "dm" || user.bot) return;
            var guild = reaction.message.guild;

            if (!global.Servers[guild.id] || !global.Servers[guild.id].rr) return;
            var rrDt = global.Servers[guild.id].rr[reaction.message.id]
            if (!rrDt) return;

            var reactionID = reaction.emoji.id ? reaction.emoji.id : reaction.emoji.name
            rrDt = rrDt[reactionID]
            if (!rrDt || rrDt.type == 1) return;
            if (guild.roles.cache.has(rrDt.role)) {
                if (guild.members.cache.get(user.id).roles.cache.has(rrDt.role)) {
                    guild.members.cache.get(user.id).roles.remove(rrDt.role)
                }
            }
        });
    }
}