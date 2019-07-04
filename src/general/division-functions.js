const common = require("./common");
const config = require("../config");
const maps = require("./map-functions");
const AsciiTable = require('ascii-table');

module.exports.rdiv = rdiv = (message, input, isRandom) => {
    const side = input.toLowerCase();
    if (side !== "axis" && side !== "allies") {
        common.reply(message, "Unknown side, please specify 'axis' or 'allies'.");
        return;
    }
    let divs = '';
    side === "axis"
        ? divs = common.axis
        : divs = common.allies;
    const notBannedList = Object.keys(divs).filter(x => { return divs[x] });
    const rndDiv = Math.floor(Math.random() * notBannedList.length);
    if (isRandom) {
        return notBannedList[rndDiv];
    } else {
        common.reply(message, notBannedList[rndDiv]);
    }
}

module.exports.allDivs = (message) => {
    const table = new AsciiTable('Divisions');
    table.setHeading('Allies', 'Axis');
    for (i = 0; i < Object.keys(common.allies).length; i++) {
        table.addRow(Object.keys(common.allies)[i], Object.keys(common.axis)[i]);
    }
    common.say(message, "``" + table.toString() + "``");
}

module.exports.banning_unbanningDivs = (message, msgInput, unbanBool) => {
    let errorInInput = false;
    const mergedSides = { ...common.axis, ...common.allies }
    msgInput.forEach((i, index) => {
        msgInput[index] = common.alterUserInput(msgInput[index])
        if (!mergedSides.hasOwnProperty(msgInput[index])) {
            errorInInput = true;
            if (msgInput[index] === `${config.prefix}bandiv`) {
                common.say(message, `I don't know what that division is, please use ${config.prefix}alldivs, to get the list of divisions.`)
            } else {
                common.say(message, `I don't know what that division is, did you mean ***${common.lexicalGuesser(msgInput[index], mergedSides)}*** instead of ***${msgInput[index]}***.\nNo divisions have been banned.`)
            }
        }
    })

    if (errorInInput) {
        return;
    }

    let divsBanned = '';
    Object.entries(mergedSides).forEach(([key, val]) => {
        msgInput.forEach((ikey) => {
            if (key === ikey) {
                divsBanned = divsBanned + key + ", ";
                common.axis[key] = unbanBool;
                common.allies[key] = unbanBool;
            }
        });
    });

    divsBanned = divsBanned.slice(0, -2);
    unbanBool
        ? common.say(message, '``The following divisions have been unbanned: ' + divsBanned + "``")
        : common.say(message, '``The following divisions have been banned: ' + divsBanned + "``")
    bannedDivs(message)
}

module.exports.bannedDivs = bannedDivs = (message) => {
    let isBanned = '';
    const mergedSides = { ...common.axis, ...common.allies }
    const table = new AsciiTable('Banned Divisions');
    table.setHeading('Div Name', 'Banned?');

    Object.entries(mergedSides).forEach(([key, val], index) => {
        if (val === true) {
            isBanned = "Not Banned";
        } else {
            isBanned = "**BANNED**";
        }
        // Be warned, this breaks if the sides have odd numbers
        if (index === ((Object.keys(mergedSides).length) / 2)) {
            table.addRow("-----------------", "-----------------");
        }
        table.addRow(key, isBanned);
    });
    common.say(message, "``" + table.toString() + "``");
}

module.exports.resetDivs = (message) => {
    for (key in common.axis) {
        common.axis[key] = true;
    }
    for (key in common.allies) {
        common.allies[key] = true;
    }
    message.channel.send("Division pool reset.");
}

module.exports.random = (message, input) => {
    let a = input[0].split(/[^0-9]/gi);
    if (isNaN(parseInt(a[0])) | isNaN(parseInt(a[1]))) {
        message.reply("error in size. Please use 1v1/2v2...10v10 etc.")
        return;
    }

    if (parseInt(a[0]) <= 0) {
        a[0] = '1';
    }
    if (parseInt(a[1]) <= 0) {
        a[1] = '1';
    }

    if (parseInt(a[0]) > 10) {
        a[0] = '10';
    }
    if (parseInt(a[1]) > 10) {
        a[1] = '10';
    }

    const allies = parseInt(a[0]);
    const axis = parseInt(a[1]);
    const largestInput = Math.max(allies, axis);

    const table = new AsciiTable(`Random ${allies}v${axis} game`);
    table.setHeading('Allies', 'Axis');
    let map;
    if (largestInput === 1) {
        map = maps.pickUnbannedMap(common.maps1v1)
    }
    if (largestInput === 2) {
        map = maps.pickUnbannedMap(common.maps2v2)
    }
    if (largestInput === 3) {
        map = maps.pickUnbannedMap(common.maps3v3)
    }
    if (largestInput >= 4) {
        map = maps.pickUnbannedMap(common.maps4v4)
    }
    table.setHeading(`Map : ${map}`, '');
    let alliesInput = '';
    let axisInput = '';
    for (let i = 1; i <= largestInput; i++) {
        alliesInput = 'N/A';
        axisInput = 'N/A';
        if (i <= allies) {
            alliesInput = rdiv(message, "allies", true);
        }
        if (i <= axis) {
            axisInput = rdiv(message, "axis", true)
        }
        table.addRow(alliesInput, axisInput);
    }
    table.setAlign(0, AsciiTable.CENTER).setAlign(1, AsciiTable.CENTER)
    message.channel.send("``" + table.toString() + "``", { file: `general/images/${map}.jpg` });
}