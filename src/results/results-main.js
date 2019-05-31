const common = require("../general/common");
const config = require("../config")
const validate = require("./validate-data");
const enter = require("./enter-data");

module.exports.resultsMain = async (message, client) => {
    const obj = await validate.validateResults(message, client);
    if (obj === undefined) {
        return;
    }
    enter.enterData(obj);

    //hardcoded now to test, will change later
    await updatePlayersElo(message, obj.winnerName, obj.loserName,"p1win")
}

async function updatePlayersElo(message, p1uid, p2uid, outcome){
    switch(outcome){
        case "p1win":
            await updateTable(message, p1uid, p2uid, 1, 0);
            break;
        case "p2win":
            await updateTable(message, p1uid, p2uid, 0, 1)
            break;
        case "p1win":
            await updateTable(message, p1uid, p2uid, 0.5, 0.5)
            break;
    }
}

module.exports.registerUser = (message) => {
    const db = common.connect();
    let discordID = message.author.id;
    let username = message.author.username;

    db.all('INSERT INTO players VALUES(?,?,?,?,?,?,?,?,?,?)', [discordID, username, 0, 0, 0, 0, 1500, 0, 0, 0], (err) => {
        if (err) {
            const errMsg = err.message === "SQLITE_CONSTRAINT: UNIQUE constraint failed: players.UID"
                ? "You are already registered."
                : "Error. Please notify an admin.";
            return common.say(message, `*${err.message}*\n${errMsg}`);
        } else {
            common.say(message, `Database updated. Welcome to the rankings ${username}.`)
        }
    });
    db.close();
}

async function updateTable(message, p1uid, p2uid, p1Score, p2Score){
    const p1Elo = await getPlayerElo(p1uid);
    const p2Elo = await getPlayerElo(p2uid);
    const newP1Elo = p1Elo + config.k_value * (p1Score - getChanceToWin(p1Elo, p2Elo))
    const newP2Elo = p2Elo + config.k_value * (p2Score - getChanceToWin(p2Elo, p1Elo))

    await common.sql('UPDATE PLAYERS SET Elo = ? WHERE UID = ?', [newP1Elo, p1uid])
        .catch((e) => {
            console.log(e)
        })

    await common.sql('UPDATE PLAYERS SET Elo = ? WHERE UID = ?', [newP2Elo, p2uid])
        .catch((e) => {
            console.log(e)
        })

    const p1EloChange = newP1Elo-p1Elo;
    const p2EloChange = newP2Elo-p2Elo;    
    common.say(message, `<@${p1uid}> Updated ELO: ${newP1Elo.toFixed(2)} (${p1EloChange < 0 ? '':'+'}${p1EloChange.toFixed(2)})
<@${p2uid}> Updated ELO: ${newP2Elo.toFixed(2)} (${p2EloChange < 0 ? '':'+'}${p2EloChange.toFixed(2)})`)
}

function getChanceToWin(a, b){
    return (1/(1 + Math.pow(10, ((b - a)/400)))).toFixed(2);
}

async function getPlayerElo(uid){
    const elo = await common.sql(`SELECT elo FROM players WHERE UID = "${uid}"`)
    return Object.values(elo.id[0])[0];
}

module.exports.prediction = async (message) => {
    if(message.mentions.users.size != 2){
        common.reply(message, "Error in input. Please try again.")
        return; 
    }
    const p1Elo = await getPlayerElo(message.mentions.users.array()[0].id);
    const p2Elo = await getPlayerElo(message.mentions.users.array()[1].id);
    common.say(message, `<@${message.mentions.users.array()[0].id}> (${p1Elo}) has ${100*getChanceToWin(p1Elo, p2Elo)}% to win versus <@${message.mentions.users.array()[1].id}> (${p2Elo}).`)
}