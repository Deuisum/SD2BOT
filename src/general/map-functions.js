const common = require("./common");
const config = require("../config")
const AsciiTable = require('ascii-table');

module.exports.allMaps = (message) => {
    let res = "";
    for (let key of Object.keys(common.maps)) {
        res = res.concat((key + " \n"));
    }
    res = res.substring(0, res.length - 1);
    common.say(message, "```" + res + "```");
}

module.exports.rmap = rmap = (message, input = "") => {
    // TODO: filter for different sizes
    common.reply(message, printMap(common.maps.length));
}

// God I have amazing naming schemes
module.exports.banning_unbanningMaps = (message, msgInput, unbanBool) => {
    let errorInInput = false;
    msgInput.forEach((i, index) => {
        msgInput[index] = common.alterUserInput(msgInput[index])

        if (!common.maps.hasOwnProperty(msgInput[index])) {
            errorInInput = true;
            if (msgInput[index] === `${config.prefix}banmap`) {
                common.say(message, `I don't know what that map is, please use ${config.prefix}allmaps, to get the list of maps.`)
            } else {
                common.say(message, `I don't know what that map is, did you mean ***${common.lexicalGuesser(msgInput[index], common.maps)}*** instead of ***${msgInput[index]}***.`)
            }
        }
    })

    if (errorInInput) {
        return;
    }

    let mapsBanned = '';
    Object.entries(common.maps).forEach(([key, val]) => {
        msgInput.forEach((ikey) => {
            if (key === ikey) {
                mapsBanned = mapsBanned + key + ", ";
                common.maps[key] = unbanBool;
            }
        });
    });
    mapsBanned = mapsBanned.slice(0, -2);
    unbanBool
        ? common.say(message, '``The following maps have been unbanned: ' + mapsBanned + "``")
        : common.say(message, '``The following maps have been banned: ' + mapsBanned + "``")
    bannedMaps(message)
}

module.exports.bannedMaps = bannedMaps = (message) => {
    let isBanned = '';
    const table = new AsciiTable('Banned Maps');
    table.setHeading('Map Name', 'Banned?');

    Object.entries(common.maps).forEach(([key, val]) => {
        if (val === true) {
            isBanned = "Not Banned";
        } else {
            isBanned = "**BANNED**";
        }
        table.addRow(key, isBanned);
    });
    common.say(message, "``" + table.toString() + "``");
}

module.exports.resetMaps = (message) => {
    for (key in common.maps) {
        common.maps[key] = true;
    }
    message.channel.send("Map pool reset.");
}

module.exports.printMap = printMap = (num) => {
    const notBannedList = Object.keys(common.maps).slice(0, num).filter(x => { return common.maps[x] });
    const rndMap = Math.floor(Math.random() * notBannedList.length);
    if(notBannedList.length === 0) {
        return "No valid maps to pick from."
    }
    return notBannedList[rndMap];
}