module.exports = {
    registerEvents(client) {
        client.on('messageUpdate', (oldMessage, newMessage) => {
            if (!newMessage.content || newMessage.channel.type == "dm") return
            // N-Word Detection
            if (newMessage.content.match(nwordRegEx)) {
                switch (global.Servers[newMessage.guild.id].nword) {
                    case "1":
                        newMessage.delete();
                        break;
                    case "2":
                        if (newMessage.member.bannable) newMessage.member.ban({ reason: "Said the N-Word" })
                        break;
                }
            }
        });
    }
}