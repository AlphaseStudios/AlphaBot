const update = require("./update.json");
const fs = require("fs");
const changelog = fs.readFileSync(update.changelog);
const webhook = require("webhook-discord");
const Hook = new webhook.Webhook("https://canary.discord.com/api/webhooks/827297855878070272/veXlqcXRkKLpkE4qKjtyCYCxX09hLZgPQFsAqoKYX6yBduwNTztQf_cW04aqnoXxcS-z");

update.description = stringReplace(update.description);
const msg = new webhook.MessageBuilder()
                .setName("Alphabot Updates")
                .setColor("#FF0000")
                .setTitle(`Latest Update v${update.version}`)
                .setDescription(update.description)
                .setTime()
                .setFooter('This is a nice footer', "https://raw.githubusercontent.com/AlphaseStudios/AlphaBot/master/resources/brand_static.jpg")

for (title in update.changes) msg.addField(title, update.changes[title]);
if (update.useChangelog) msg.addField("Changes", `\`\`\`txt\n${changelog}\n\`\`\``);
Hook.send(msg);

function stringReplace(str) {
  let regex = /{{ ?([A-z].*?) ?}}/g;
  while (res = regex.exec(str)) {
    console.log(res)
    str = str.replace(res[0], eval(res[1]))
  }
  return str;
}