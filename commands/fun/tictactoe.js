const Discord = require('discord.js')
const fs = require('fs')
const utils = require('../../utils.js')
module.exports = {
    name: 'ttt',
    aliases: ['tictactoe'],
    description: 'Tic tac toe - retard.',
    guildOnly: true,
    stats: true,
    execute(client, message, args) {
        var tmp = JSON.parse(fs.readFileSync('./resources/temp.json'))
        if (!message.mentions.members.first() || message.mentions.members.first().id == message.member.id || message.mentions.members.first().user.bot) {
            message.channel.send("Please mention a user to play with!")
            return;
        }
        if (tmp.Game.includes(message.author.id) || tmp.Game.includes(message.mentions.members.first().id)) {
            message.channel.send("You or the player you want to play against is in a game currently!")
            return;
        }
        var players = [message.member, message.mentions.members.first()]
        tmp.Game.push(players[0].id)
        tmp.Game.push(players[1].id)
        fs.writeFileSync("./temp.json", JSON.stringify(tmp))
        var TurnNum = Math.floor(Math.random() * 2)
        message.channel.send(`\`\`\`Started a game of Tic Tac Toe! Good luck, players!\n(use Collum Number + Row Letter to select a cell, For Example: 1A, 3B, etc)\n\nYou can surrender by typing "00"!\`\`\`\nIt's ${players[TurnNum]}'s turn!`)
        const collector = new Discord.MessageCollector(message.channel, m => players.includes(m.member), { time: 20000 });
        var COLUMS = [[':heavy_minus_sign:', ':heavy_minus_sign:', ':heavy_minus_sign:'], [':heavy_minus_sign:', ':heavy_minus_sign:', ':heavy_minus_sign:'], [':heavy_minus_sign:', ':heavy_minus_sign:', ':heavy_minus_sign:']]
        var board =
            `\`BOARD:\`
\t\t\t:one:\t\t:two:\t\t:three:\n
:regional_indicator_a:\t${COLUMS[0][0]}\t|\t${COLUMS[0][1]}\t|\t${COLUMS[0][2]}
:regional_indicator_b:\t${COLUMS[1][0]}\t|\t${COLUMS[1][1]}\t|\t${COLUMS[1][2]}
:regional_indicator_c:\t${COLUMS[2][0]}\t|\t${COLUMS[2][1]}\t|\t${COLUMS[2][2]}`
        message.channel.send(board)
        var won = false;
        collector.on('collect', m => {
            if (players.indexOf(m.member) != TurnNum) {
                return;
            }
            var choice = m.content.substring(0, 2)
            choice = choice.toUpperCase();
            if (choice == "00") {
                message.channel.send(`${players[TurnNum]} Surrendered!`)
                if (TurnNum == 0) {
                    TurnNum = 1
                }
                else {
                    TurnNum = 0
                }
                message.channel.send(`${players[TurnNum]} Won!`)
                won = true;
                collector.stop()
                var board =
                    `\`BOARD (GAME ENDED):\`
\t\t\t:one:\t\t:two:\t\t:three:\n
:regional_indicator_a:\t${COLUMS[0][0]}\t|\t${COLUMS[0][1]}\t|\t${COLUMS[0][2]}
:regional_indicator_b:\t${COLUMS[1][0]}\t|\t${COLUMS[1][1]}\t|\t${COLUMS[1][2]}
:regional_indicator_c:\t${COLUMS[2][0]}\t|\t${COLUMS[2][1]}\t|\t${COLUMS[2][2]}`
                message.channel.send(board)
                return;
            }
            if (!['1', '2', '3'].includes(choice.substring(0, 1))) {
                message.channel.send("This is not a valid collum!")
                collector.resetTimer({ time: 20000 })
                return;
            }
            if (!['A', 'B', 'C'].includes(choice.substring(1, 2))) {
                message.channel.send("This is not a valid cell!")
                collector.resetTimer({ time: 20000 })
                return;
            }
            if (COLUMS[['A', 'B', 'C'].indexOf(choice.substring(1, 2))][(parseInt(choice.substring(0, 1)) - 1)] != ':heavy_minus_sign:') {
                message.channel.send('This cell is occupied!')
                collector.resetTimer({ time: 20000 })
                return;
            }
            var sign = ":o:"
            if (players.indexOf(m.member) == 0) {
                sign = ":x:"
            }
            COLUMS[['A', 'B', 'C'].indexOf(choice.substring(1, 2))][(parseInt(choice.substring(0, 1)) - 1)] = sign;
            message.channel.send(`Great! ${players[TurnNum]} put a "${sign}" at ${choice}!`)
            if (
                (COLUMS[0][0] == COLUMS[0][1] && COLUMS[0][0] == COLUMS[0][2] && COLUMS[0][0] != ':heavy_minus_sign:') ||
                (COLUMS[1][0] == COLUMS[1][1] && COLUMS[1][0] == COLUMS[1][2] && COLUMS[1][0] != ':heavy_minus_sign:') ||
                (COLUMS[2][0] == COLUMS[2][1] && COLUMS[2][0] == COLUMS[2][2] && COLUMS[2][0] != ':heavy_minus_sign:') ||
                (COLUMS[0][0] == COLUMS[1][0] && COLUMS[0][0] == COLUMS[2][0] && COLUMS[0][0] != ':heavy_minus_sign:') ||
                (COLUMS[0][1] == COLUMS[1][1] && COLUMS[0][1] == COLUMS[2][1] && COLUMS[0][1] != ':heavy_minus_sign:') ||
                (COLUMS[0][2] == COLUMS[1][2] && COLUMS[0][2] == COLUMS[2][2] && COLUMS[0][2] != ':heavy_minus_sign:') ||
                (COLUMS[0][0] == COLUMS[1][1] && COLUMS[0][0] == COLUMS[2][2] && COLUMS[0][0] != ':heavy_minus_sign:') ||
                (COLUMS[0][2] == COLUMS[1][1] && COLUMS[0][2] == COLUMS[2][0] && COLUMS[0][2] != ':heavy_minus_sign:')
            ) {
                message.channel.send(`${players[TurnNum]} Won!\n\n:tada: CONGRATS! :tada:`)
                won = true;
                collector.stop()
                var board =
                    `\`BOARD (GAME ENDED):\`
\t\t\t:one:\t\t:two:\t\t:three:\n
:regional_indicator_a:\t${COLUMS[0][0]}\t|\t${COLUMS[0][1]}\t|\t${COLUMS[0][2]}
:regional_indicator_b:\t${COLUMS[1][0]}\t|\t${COLUMS[1][1]}\t|\t${COLUMS[1][2]}
:regional_indicator_c:\t${COLUMS[2][0]}\t|\t${COLUMS[2][1]}\t|\t${COLUMS[2][2]}`
                message.channel.send(board)
                return;
            }
            if (COLUMS[0][0] != ':heavy_minus_sign:' && COLUMS[0][1] != ':heavy_minus_sign:' && COLUMS[0][2] != ':heavy_minus_sign:' &&
                COLUMS[1][0] != ':heavy_minus_sign:' && COLUMS[1][1] != ':heavy_minus_sign:' && COLUMS[1][2] != ':heavy_minus_sign:' &&
                COLUMS[2][0] != ':heavy_minus_sign:' && COLUMS[2][1] != ':heavy_minus_sign:' && COLUMS[2][2] != ':heavy_minus_sign:'
            ) {
                message.channel.send(`Wow, no one won... better luck next time I guess`)
                won = true;
                collector.stop()
                var board =
                    `\`BOARD (GAME ENDED):\`
\t\t\t:one:\t\t:two:\t\t:three:\n
:regional_indicator_a:\t${COLUMS[0][0]}\t|\t${COLUMS[0][1]}\t|\t${COLUMS[0][2]}
:regional_indicator_b:\t${COLUMS[1][0]}\t|\t${COLUMS[1][1]}\t|\t${COLUMS[1][2]}
:regional_indicator_c:\t${COLUMS[2][0]}\t|\t${COLUMS[2][1]}\t|\t${COLUMS[2][2]}`
                message.channel.send(board)
                return;
            }
            if (TurnNum == 0) {
                TurnNum = 1
            }
            else {
                TurnNum = 0
            }
            message.channel.send(`Now it is ${players[TurnNum]}'s turn!`)
            var board =
                `\`BOARD:\`
\t\t\t:one:\t\t:two:\t\t:three:\n
:regional_indicator_a:\t${COLUMS[0][0]}\t|\t${COLUMS[0][1]}\t|\t${COLUMS[0][2]}
:regional_indicator_b:\t${COLUMS[1][0]}\t|\t${COLUMS[1][1]}\t|\t${COLUMS[1][2]}
:regional_indicator_c:\t${COLUMS[2][0]}\t|\t${COLUMS[2][1]}\t|\t${COLUMS[2][2]}`
            message.channel.send(board)
            collector.resetTimer({ time: 20000 })
        })
        collector.on('end', () => {
            if (!won) {
                message.channel.send(`${players[TurnNum]} Haven't responded in time!`)
                if (TurnNum == 0) {
                    TurnNum = 1
                }
                else {
                    TurnNum = 0
                }
                message.channel.send(`I guess that ${players[TurnNum]} won...`)
            }
            tmp.Game.splice(tmp.Game.indexOf(players[0].id), 1)
            tmp.Game.splice(tmp.Game.indexOf(players[1].id), 1)
            fs.writeFileSync("./temp.json", JSON.stringify(tmp))
        })
    },
};