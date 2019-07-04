const common = require("../general/common");

module.exports.enterData = async (obj) => {
    if (obj.isDraw === true) {
        await submitResultsDraw(obj);
    } else {
        await submitResults(obj)
    }
    await commonStuff(obj);
}

async function commonStuff(obj) {
    //Map Pick
    await common.sql('UPDATE mapResults SET Picks = Picks + 1 WHERE Name = ?', [obj.mapPlayed])
        .catch((err) => {
            console.log("Err1", err)
        })

    //Bans
    for (const element of obj.bannedDivs) {
        await common.sql('UPDATE divResults SET Bans = Bans + 1 WHERE Name = ?', [element])
            .catch((err) => {
                console.log("Err2", err)
            })
    };

    for (const element of obj.bannedMaps) {
        await common.sql('UPDATE mapResults SET Bans = Bans + 1 WHERE Name = ?', [element])
            .catch((err) => {
                console.log("Err3", err)
            })
    };

    //Update div picks
    await common.sql('UPDATE divResults SET Picks = Picks + 1 WHERE Name = ?', [obj.playerDivs[0]])
        .catch((err) => {
            console.log("Err4", err)
        })
    await common.sql('UPDATE divResults SET Picks = Picks + 1 WHERE Name = ?', [obj.playerDivs[1]])
        .catch((err) => {
            console.log("Err5", err)
        })

    //Update div win percent
    await common.sql('UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draw AS float) + CAST(Loss AS float))*100 WHERE Name = ?', [obj.playerDivs[0]])
        .catch((err) => {
            console.log("Err6", err)
        })
    await common.sql('UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draw AS float) + CAST(Loss AS float))*100 WHERE Name = ?', [obj.playerDivs[1]])
        .catch((err) => {
            console.log("Err7", err)
        })

    //Update player win percent
    await common.sql('UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draws AS float) + CAST(Losses AS float))*100 WHERE uid = ?', [obj.playerNames[0]])
        .catch((err) => {
            console.log("Err8", err)
        })
    await common.sql('UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draws AS float) + CAST(Losses AS float))*100 WHERE uid = ?', [obj.playerNames[1]])
        .catch((err) => {
            console.log("Err9", err)
        })

    const p1isAllies = common.allies.hasOwnProperty(obj.playerDivs[0])
    const p2isAllies = common.allies.hasOwnProperty(obj.playerDivs[1])

    if (p1isAllies) {
        await common.sql('UPDATE players SET AlliesPlayed = AlliesPlayed + 1 WHERE uid = ?', [obj.playerNames[0]])
            .catch((err) => {
                console.log("Err", err)
            })
    } else {
        await common.sql('UPDATE players SET AxisPlayed = AxisPlayed + 1 WHERE uid = ?', [obj.playerNames[0]])
            .catch((err) => {
                console.log("Err", err)
            })
    }

    if (p2isAllies) {
        await common.sql('UPDATE players SET AlliesPlayed = AlliesPlayed + 1 WHERE uid = ?', [obj.playerNames[1]])
            .catch((err) => {
                console.log("Err", err)
            })
    } else {
        await common.sql('UPDATE players SET AxisPlayed = AxisPlayed + 1 WHERE uid = ?', [obj.playerNames[1]])
            .catch((err) => {
                console.log("Err", err)
            })
    }
}

async function submitResults(obj) {
    //Players
    await common.sql('UPDATE players SET Wins = Wins + 1 WHERE uid = ?', [obj.winnerName])
        .catch((err) => {
            console.log("Err", err)
        })
    await common.sql('UPDATE players SET Losses = Losses + 1 WHERE uid = ?', [obj.loserName])
        .catch((err) => {
            console.log("Err", err)
        })

    //divs
    await common.sql('UPDATE divResults SET Wins = Wins + 1 WHERE Name = ?', [obj.winnerDiv])
        .catch((err) => {
            console.log("Err", err)
        })
    await common.sql('UPDATE divResults SET Loss = Loss + 1 WHERE Name = ?', [obj.loserDiv])
        .catch((err) => {
            console.log("Err", err)
        })

    await common.sql('UPDATE players SET WinStreak = WinStreak + 1 WHERE UID = ?', [obj.winnerName])
        .catch((err) => {
            console.log("Err", err)
        })
    await common.sql('UPDATE players SET WinStreak = 0 WHERE UID = ?', [obj.loserName])
        .catch((err) => {
            console.log("Err", err)
        })
}

async function submitResultsDraw(obj) {
    //Players
    await common.sql('UPDATE players SET Draws = Draws + 1 WHERE uid = ?', [obj.playerNames[0]])
        .catch((err) => {
            console.log("Err", err)
        })
    await common.sql('UPDATE players SET Draws = Draws + 1 WHERE uid = ?', [obj.playerNames[1]])
        .catch((err) => {
            console.log("Err", err)
        })

    //divs
    await common.sql('UPDATE divResults SET Draws = Draws + 1 WHERE Name = ?', [obj.playerDivs[0]])
        .catch((err) => {
            console.log("Err", err)
        })
    await common.sql('UPDATE divResults SET Draws = Draws + 1 WHERE Name = ?', [obj.playerDivs[0]])
        .catch((err) => {
            console.log("Err", err)
        })

    await common.sql('UPDATE players SET WinStreak = 0 WHERE UID = ?', [obj.playerNames[0]])
        .catch((err) => {
            console.log("Err", err)
        })
    await common.sql('UPDATE players SET WinStreak = 0 WHERE UID = ?', [obj.playerNames[1]])
        .catch((err) => {
            console.log("Err", err)
        })
}