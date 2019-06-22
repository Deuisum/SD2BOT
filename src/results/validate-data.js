const config = require("../config");
const common = require("../general/common");

const resultStateObject = {
    error: false,
    errorText: [],

    isDraw: false,
    hasOutcome: false,
    mapPlayed: "",

    hasPlayerOne: false,
    hasPlayerTwo: false,
    hasPlayerOneDiv: false,
    hasPlayerTwoDiv: false,
    hasMapPlayed: false,
    hasWinner: false,
    hasLoser: false,

    winnerName: "",
    winnerDiv: "",

    loserName: "",
    loserDiv: "",

    playerNames: [],
    playerDivs: [],

    bannedDivs: [],
    bannedMaps: []

}

module.exports.validateResults = async (message) => {
    const input = message.content.substring(1, message.content.length).split(/\n/);
    for (i in input) {
        input[i] = input[i].toLowerCase().trim();
    }
    init();
    isDraw(input);
    getMapInfo(input);
    getBans(input);
    findPlayers(input);
    findDivs(input);
    await verifyPlayers();
    await verifyPlayedDivs();
    validateMissingInputs();
    if (resultStateObject.error) {
        const concatErrText = resultStateObject.errorText.join("\n")
        common.say(message, concatErrText);
        return;
    }

    if (!resultStateObject.isDraw) {
        winnerAndLoserDivs();
    }
    return resultStateObject;
}

async function verifyPlayers() {
    let result;
    result = await common.sql(`SELECT * FROM players WHERE UID = "${resultStateObject.playerNames[0]}"`)
        .catch(() => {
            console.log("Caught promise error")
        })
    if (Object.entries(result)[0][1].length === 0) {
        resultStateObject.error = true;
        resultStateObject.errorText.push("Unknown player at P1 Name.")
    }

    result = await common.sql(`SELECT * FROM players WHERE UID = "${resultStateObject.playerNames[1]}"`)
        .catch(() => {
            console.log("Caught promise error")
        })
    if (Object.entries(result)[0][1].length === 0) {
        resultStateObject.error = true;
        resultStateObject.errorText.push("Unknown player at P2 Name.")
    }

    if (!resultStateObject.isDraw) {
        result = await common.sql(`SELECT * FROM players WHERE UID = "${resultStateObject.winnerName}"`)
            .catch(() => {
                console.log("Caught promise error")
            })
        if (Object.entries(result)[0][1].length === 0) {
            resultStateObject.error = true;
            resultStateObject.errorText.push("Unknown player at Winner.")
        }
        result = await common.sql(`SELECT * FROM players WHERE UID = "${resultStateObject.loserName}"`)
            .catch((err) => {
                console.log(err)
            })
        if (Object.entries(result)[0][1].length === 0) {
            resultStateObject.error = true;
            resultStateObject.errorText.push("Unknown player at Loser.")
        }

        //verify that the loser/winners are the same as in the playernames
        if (!resultStateObject.playerNames.includes(resultStateObject.loserName)) {
            resultStateObject.error = true;
            resultStateObject.errorText.push("Player at 'Loser' does not match P1 or P2");
        }
        if (!resultStateObject.playerNames.includes(resultStateObject.winnerName)) {
            resultStateObject.error = true;
            resultStateObject.errorText.push("Player at 'Winner' does not match P1 or P2");
        }
    }
}


function verifyPlayedDivs() {
    resultStateObject.playerDivs.forEach((i) => {
        if (!common.allies.hasOwnProperty(i) && !common.axis.hasOwnProperty(i)) {
            resultStateObject.error = true;
            resultStateObject.errorText.push(`Unknown division at **${i}** did you mean **${common.lexicalGuesser(i, { ...common.allies, ...common.axis })}**?`)
        }
    })
}

function findDivs(input) {
    input.forEach(element => {
        let i = element.replace(/^.+:/, '').replace("<", "").replace(">", "").replace("@", "").replace("!", "").trim();
        i = common.alterUserInput(i);
        if (element.match(/((p1( |-)div)):/gi)) {
            resultStateObject.playerDivs.push(i);
            resultStateObject.hasPlayerOneDiv = true;
        }
        if (element.match(/((p2( |-)div)):/gi)) {
            resultStateObject.playerDivs.push(i);
            resultStateObject.hasPlayerTwoDiv = true;
        }

    })
}

function findPlayers(input) {
    input.forEach(element => {
        let i = element.replace(/^.+:/, '').replace("<", "").replace(">", "").replace("@", "").replace("!", "").trim();
        if (element.match(/((p1( |-)name)):/gi)) {
            resultStateObject.playerNames.push(i);
            resultStateObject.hasPlayerOne = true;
        }
        if (element.match(/((p2( |-)name)):/gi)) {
            resultStateObject.playerNames.push(i);
            resultStateObject.hasPlayerTwo = true;
        }

        if (element.match(/(winner)/gi)) {
            resultStateObject.hasWinner = true;
            resultStateObject.winnerName = i;
        }
        if (element.match(/(loser)/gi)) {
            resultStateObject.hasLoser = true;
            resultStateObject.loserName = i;
        }
    });
}

function getMapInfo(input) {
    input.forEach(element => {
        if (element.match(/(map:)/gi)) {
            let map = element.replace(/^.+:/, '').replace("<", "").replace(">", "").replace("@", "").replace("!", "").trim();
            map = common.alterUserInput(map);
            const maps = { ...common.maps1v1, ...common.maps2v2, ...common.maps3v3, ...common.maps4v4 }
            if (maps.hasOwnProperty(map)) {
                resultStateObject.hasMapPlayed = true;
                resultStateObject.mapPlayed = map;
            } else {
                resultStateObject.error = true;
                resultStateObject.errorText.push(`Unknown played map **${map}** at **${element}** did you mean **${common.lexicalGuesser(map, common.maps)}**?`)
            }
        }
    })
}

function getBans(input) {
    let ban = "";
    input.forEach(element => {
        if (element.match(/(p(1|2)( |-)div( |-)ban( |-)(1|2|3|4|5):)/gi)) {
            ban = element.replace(/^.+:/, '').replace("<", "").replace(">", "").replace("@", "").replace("!", "").trim();
            ban = common.alterUserInput(ban);
            if (common.allies.hasOwnProperty(ban) || common.axis.hasOwnProperty(ban)) {
                resultStateObject.bannedDivs.push(ban)
            } else {
                resultStateObject.error = true;
                resultStateObject.errorText.push(`Unknown banned division **${ban}** at **${element}** did you mean **${common.lexicalGuesser(ban, { ...common.allies, ...common.axis })}**?`)
            }
        }

        if (element.match(/(p(1|2)( |-)map( |-)ban( |-)(1|2|3|4|5):)/gi)) {
            ban = element.replace(/^.+:/, '').replace("<", "").replace(">", "").replace("@", "").replace("!", "").trim();
            ban = common.alterUserInput(ban);
            if (common.maps.hasOwnProperty(ban)) {
                resultStateObject.bannedMaps.push(ban)
            } else {
                resultStateObject.error = true;
                resultStateObject.errorText.push(`Unknown banned map **${ban}** at **${element}** did you mean **${common.lexicalGuesser(ban, common.maps)}**?`)
            }
        }
    })
}

function winnerAndLoserDivs() {
    if (resultStateObject.winnerName == resultStateObject.playerNames[0]) {
        resultStateObject.winnerDiv = resultStateObject.playerDivs[0]
        resultStateObject.loserDiv = resultStateObject.playerDivs[1]
    } else {
        resultStateObject.winnerDiv = resultStateObject.playerDivs[1]
        resultStateObject.loserDiv = resultStateObject.playerDivs[0]
    }
}

function isDraw(input) {
    input.forEach(element => {
        if (element.match(/(draw( |:))+/gi)) {
            if (element.includes("y")) {
                resultStateObject.isDraw = true;
            }
            resultStateObject.hasOutcome = true;
        }
    });
}

function validateMissingInputs() {
    if (!resultStateObject.hasOutcome) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`Draw: Yes\` or \`Draw: No\`, please use ${config.prefix} template to request a template to fill in`);
    }
    if (!resultStateObject.hasMapPlayed) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`Map Played:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (!resultStateObject.hasWinner) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`Winner:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (!resultStateObject.hasLoser) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`Loser:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (!resultStateObject.hasPlayerOne) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`P1 Name:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (!resultStateObject.hasPlayerTwo) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`P2 Name:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (!resultStateObject.hasPlayerOneDiv) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`P1 Div:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (!resultStateObject.hasPlayerTwoDiv) {
        resultStateObject.error = true;
        resultStateObject.errorText.push(`\nMissing required line \`P2 Div:\`, please use ${config.prefix} template to request a template to fill in.`);
    }
    if (resultStateObject.loserName.match(/[^0-9]/gi) || resultStateObject.winnerName.match(/[^0-9]/gi)) {
        resultStateObject.error = true;
        resultStateObject.errorText.push('\nUnknown item in Winner/Loser.')
    }
    if (resultStateObject.playerNames[0].match(/[^0-9]/gi) || resultStateObject.playerNames[1].match(/[^0-9]/gi)) {
        resultStateObject.error = true;
        resultStateObject.errorText.push('\nUnknown item in P1/P2 Names.')
    }
}


//reset all 
function init() {
    resultStateObject.error = false;
    resultStateObject.errorText = [];

    resultStateObject.isDraw = false;
    resultStateObject.hasOutcome = false;
    resultStateObject.mapPlayed = "";

    resultStateObject.hasPlayerOne = false;
    resultStateObject.hasPlayerTwo = false;
    resultStateObject.hasPlayerOneDiv = false;
    resultStateObject.hasPlayerTwoDiv = false;
    resultStateObject.hasMapPlayed = false;
    resultStateObject.hasWinner = false;
    resultStateObject.hasLoser = false;

    resultStateObject.winnerName = "";
    resultStateObject.winnerDiv = "";

    resultStateObject.loserName = "";
    resultStateObject.loserDiv = "";

    resultStateObject.playerNames = [];
    resultStateObject.playerDivs = [];

    resultStateObject.bannedDivs = [];
    resultStateObject.bannedMaps = [];
}