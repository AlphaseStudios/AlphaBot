const QuickChart = require('quickchart-js');
const fs = require('fs');
var rawStats = require('../../resources/stats.json');

module.exports = {
    name: 'stats',
    aliases: ['accuratestats'],
    parseCommands: true,
    description: 'Gives you the bots stats.',
    execute(client, command, message, args) {
        const sorted = Object.fromEntries(Object.entries(rawStats).sort(([, a], [, b]) => b - a));
        var statsData = [], statsLabels = [];
        for (item in sorted) { statsData.push(sorted[item]); statsLabels.push(item); }
        if (command == "accuratestats") {
            let msg = "\`\`\`";
            for (index in statsLabels) {
                msg += `${statsLabels[index]} - ${statsData[index]}\n`;
            }
            msg += "\`\`\`";
            message.channel.send(msg);
            return;
        }
        var randomColor = randomRGB();
        var file = `./resources/${Math.floor(Math.random() * Math.floor(999999999999))}.png`;
        const chart = new QuickChart();
        chart.setConfig({
            type: 'bar',
            data: {
                labels: statsLabels,
                datasets: [{
                    label: 'Command usage',
                    data: statsData,
                    backgroundColor: `rgba(${randomColor}, 0.5)`,
                    borderColor: `rgba(${randomColor}, 1)`,
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: "Command usage statistics"
                },
                plugins: {
                    roundedBars: true
                }
            }
        }).setWidth(800).setHeight(600);
        chart.toFile(file).then(() => {
            message.channel.send('', { files: [file] }).then(() => {
                fs.unlink(file, () => { });
                // message.channel.send('_powered by https://quickchart.io/_')
            });
        });

        function randomRGB() {
            var o = Math.round, r = Math.random, s = 255;
            return `${o(r() * s)}, ${o(r() * s)}, ${o(r() * s)}`;
        }
    }
};