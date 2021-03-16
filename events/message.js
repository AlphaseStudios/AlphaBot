const config = JSON.parse(require('../resources/config.json'));

var nwordRegex = new RegExp(config.nwordRegex, "gi");
module.exports = {
    registerEvents(client) {
        client.on('messageUpdate', (oldMessage, newMessage) => {
            if (!newMessage.content || newMessage.channel.type == "dm") return
            // N-Word Detection
            if (newMessage.content.match(nwordRegEx)) {
                switch (global.Servers[newMessage.guild.id].nword) {
                    case "1":
                        newMessage.delete();
                        return;
                        break;
                    case "2":
                        if (newMessage.member.bannable) newMessage.member.ban({ reason: "Said the N-Word" })
                        return;
                        break;
                }
            }
        })


        //#region reactionRole
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
                else {
                    reaction.users.remove(user.id)
                }

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