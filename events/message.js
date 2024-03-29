const config = require("../resources/config.json");
const utils = require("../utils.js");
const debug = require("../debugger.js");
require("dotenv").config();

const nwordRegex = new RegExp(config.nwordRegex, "gi");
const inviteRegex = new RegExp(config.inviteRegex, "gi");
module.exports = {
  registerEvents(client) {
    client.on("message", (message) => {
      if (
        message.content.match(inviteRegex) &&
        global.Servers[message.guild.id].remInvState &&
        message.deletable
      ) {
        if (
          message.member.roles.cache
            .array()
            .some(
              (r) =>
                global.Servers[message.guild.id].allowedInvRoles.indexOf(r) >= 0
            ) ||
          global.Servers[message.guild.id].allowedInvChannels.includes(
            message.channel.id
          )
        )
          return;
        message.delete();
      }
      if (
        message.content.includes(process.env.TOKEN) ||
        message.content.includes(process.env.BETA_TOKEN)
      ) {
        message.delete();
        for (dev of utils.getDevs()) {
          client.users
            .fetch(dev)
            .then((userObj) =>
              userObj.send(
                "⚠️ WARNING ⚠️\nThe bot token was found publicly in a guild!!! the bot has deleted the message with it. The token is still valid! Head over to https://discord.com/developers/applications/687228371016351760/bot and press 'regenerate'. HURRYYYYYY"
              )
            )
            .catch((err) => {
              debug.sendErr("Failed trying to fetch a dev", err);
            });
        }
      }
    }),
      client.on("messageUpdate", (oldMessage, newMessage) => {
        if (!newMessage.content || newMessage.channel.type == "dm") return;
        // N-Word Detection
        if (newMessage.content.match(nwordRegex)) {
          switch (global.Servers[newMessage.guild.id].nword) {
            case "1":
              newMessage.delete();
              break;
            case "2":
              if (newMessage.member.bannable)
                newMessage.member.ban({ reason: "Said the N-Word" });
              break;
          }
        }

        /* if (newMessage.content.match(config.inviteRegex) && global.Servers[newMessage.guild.id].remInvState && newMessage.deletable) {
    
                    if (newMessage.member.roles.cache.array().some(r => global.Servers[newMessage.guild.id].allowedInvRoles.indexOf(r) >= 0) ||
                        global.Servers[newMessage.guild.id].allowedInvChannels.includes(newMessage.channel.id)) return
                    newMessage.delete()
                } */
      });

    //#region reactionRole
    client.on("messageReactionAdd", (reaction, user) => {
      if (reaction.message.channel.type == "dm" || user.bot) return;

      var guild = reaction.message.guild;

      if (!global.Servers[guild.id] || !global.Servers[guild.id].rr) return;

      var rrDt = global.Servers[guild.id].rr[reaction.message.id];

      if (!rrDt) return;

      var reactionID = reaction.emoji.id
        ? reaction.emoji.id
        : reaction.emoji.name;

      rrDt = rrDt[reactionID];

      if (!rrDt) return;

      if (guild.roles.cache.has(rrDt.role)) {
        if (!guild.members.cache.get(user.id).roles.cache.has(rrDt.role)) {
          guild.members.cache.get(user.id).roles.add(rrDt.role);
          if (rrDt.type == 1) {
            reaction.users.remove(user.id);
          }
        } else {
          reaction.users.remove(user.id);
        }
      }
    });

    client.on("messageReactionRemove", (reaction, user) => {
      if (reaction.message.channel.type == "dm" || user.bot) return;

      var guild = reaction.message.guild;

      if (!global.Servers[guild.id] || !global.Servers[guild.id].rr) return;

      var rrDt = global.Servers[guild.id].rr[reaction.message.id];

      if (!rrDt) return;

      var reactionID = reaction.emoji.id
        ? reaction.emoji.id
        : reaction.emoji.name;

      rrDt = rrDt[reactionID];

      if (!rrDt || rrDt.type == 1) return;

      if (guild.roles.cache.has(rrDt.role)) {
        if (guild.members.cache.get(user.id).roles.cache.has(rrDt.role)) {
          guild.members.cache.get(user.id).roles.remove(rrDt.role);
        }
      }
    });
  },
};
