const common = require("./common");
const config = require("../config");
const helpCmd = require("./help-embeds");
const AsciiTable = require('ascii-table');
const fetch = require('node-fetch');
const fileType = require('file-type');

const sodbotReplies = [
    "hit! Target destroyed!",
    "miss! Mission failed. We'll get em next time!",
    "miss! Are you even trying to hit anymore?",
    "oh come on, that shot was pathetic... Put your back into it!",
    "ping! Your shot bounced!",
    "you miss 100% of the shots you don't take. Or in your case, 100% of those that you do as well...",
    "miss! Your shot couldn't hit the broad side of a barn!"
];

module.exports.info = (message) => {
    const table = new AsciiTable('Info');
    table.setHeading(`${config.botName} ${config.version}`);
    table.addRow("Written and maintained by mbetts.");
    table.addRow("Find any bugs or want to contribute? Please make an issue/PR on the Github page below.")
    table.addRow("https://github.com/matthewbetts96/SD2-SODBOT");
    table.addRow("Hosted on Digital Ocean.");
    table.setAlign(0, AsciiTable.CENTER)
    common.say(message, "``" + table.toString() + "``");
}

module.exports.faction = (message) => {
    config.faction
        ? Math.random() >= 0.5
            ? common.reply(message, 'Axis!')
            : common.reply(message, 'Allies!')
        : null;
}

module.exports.flip = (message) => {
    config.flip
        ? Math.random() >= 0.5
            ? common.reply(message, 'Heads!')
            : common.reply(message, 'Tails!')
        : null;
}

module.exports.guide = (message) => {
    const table = new AsciiTable('Guides');
    table.setHeading('Title', 'Author', 'Link');
    table.addRow("TODO", "TODO", "TODO");
    common.say(message, "``" + table.toString() + "``");
}
module.exports.help = async (message, input) => {
    switch (input) {
        case "maps":
            helpCmd.mapHelp(message);
            break;
        case "divs":
            helpCmd.divHelp(message);
            break;
        case "misc":
            helpCmd.miscHelp(message);
            break;
        case "tourny":
            break;
        case "admin":
            helpCmd.adminHelp(message);
            break;
        default:
            const dm = await message.author.createDM();
            dm.send({
                embed: {
                    color: 3447003,
                    author: {
                        name: message.client.user.username,
                        icon_url: message.client.user.avatarURL
                    },
                    fields: [{
                        name: config.prefix + "help",
                        value: "Gives this message."
                    }, {
                        name: config.prefix + "help maps",
                        value: "Gives help info about map commands."
                    }, {
                        name: config.prefix + "help divs",
                        value: "Gives help info about division commands."
                    }, {
                        name: config.prefix + "help misc",
                        value: "Gives help info about misc commands."
                    }, {
                        name: config.prefix + "help tourny",
                        value: "Gives help info about result commands."
                    }, {
                        name: config.prefix + "help admin",
                        value: "Gives help info about admin commands."
                    }]
                }
            }
            );
    }
}

module.exports.template = (message) => {
    message.channel.send("Minimum results submission:\n```" + config.prefix + "results\nDraw: No\nWinner:\nLoser:\nMap:\n--------\nP1 Name:\nP1 Div:\n--------\nP2 Name:\nP2 Div:```");
    message.channel.send("Minimum draw submission:\n```" + config.prefix + "results\nDraw: Yes\nMap:\n--------\nP1 Name:\nP1 Div:\n--------\nP2 Name:\nP2 Div:```");
}


module.exports.piat = (message) => {
    const i = Math.random();
    if (rateLimiter()) {
        if (i > 0.98) {
            common.reply(message, sodbotReplies[Math.floor(Math.random() * sodbotReplies.length)], true)
        } else if (i < 0.001) {
            specialPiat(message)
        } else {
            common.reply(message, "Miss!")
        }
    }
}

// I spent way too long on this stupid thing
function specialPiat(message) {
    const name = message.author.username;
    const k = Math.random();
    k < 0.90
        ? (common.reply(message, `You hit!`, true), setTimeout(() => { common.reply(message, `Just kidding, you didn't.`, true) }, 5000))
        : (
            common.say(message, `Private ${name} has dishonored himself and dishonored the discord. I have tried to help him. But I have failed.`, true),
            setTimeout(() => {
                common.say(message, `I have failed because YOU have not helped me. YOU people have not given Private ${name} the proper motivation! `, true)
                setTimeout(() => {
                    common.say(message, `So, from now on, whenever Private ${name} fucks up, I will not punish him! I will punish all of YOU!`, true)
                    setTimeout(() => {
                        common.say(message, `And the way I see it ladies, you owe me for ONE JELLY DOUGHNUT! NOW GET ON YOUR FACES!`, true)
                    }, 10000);
                }, 10000);
            }, 10000)
        )
}

// A simple rate limiter
// Ignores requests if they are within 1 second of eachother and will 
// not respond unless one second has passed since the last request (currently subject to change)
let lastrequestTime = 0;
function rateLimiter() {
    const currentTime = new Date().getTime();
    if (currentTime - lastrequestTime > 1000) {
        lastrequestTime = currentTime;
        return true;
    }
    else {
        return false;
    }
}
