const Discord = require('discord.js');
const fetch = require('node-fetch');
const fileType = require('file-type');
const config = require("../config.json");
const common = require("../general/common");

/**
For each value, there's a header (bit counter, typically 5 bits), and a body (actual value, size(s) encoded in header):
Deck code fragment example, 33 units:

|bool   |bool   | division     | card count |income |units encoding         ||header  |unit       |transport  ||header  |unit       |transport  |...
|00001|1|00001|0|01000|10000110|00110|100001|00001|0|00010|00010|00010|01011||01|00|01|00111111100|00101011010||01|00|00|00010001101|01110011001|...
|1    |1|1    |0|8    |<   8  >|6    |<  6 >|1    |1|2    |2    |2    |11   || <  2+2+2+11+11                >||
|1 bit|T|1 bit|F|8 bit|division|6 bit|cards |1 bit|$|count|phase|xp   |unit || unit card                      ||

for comparison, 1 unit deck:
|bool   |bool   | division     |crd cnt|income |units encoding         ||headr|unit       |transport  || padding
|00001|1|00001|0|01000|10000110|00001|1|00001|0|00001|00001|00001|01011||1|0|1|01100011100|00000000000||00000000
|1    |1|1    |0|8    |<   8  >|1    |1|1    |1|1    |1    |1    |11   ||< 1+1+1+11+11               >||
  
*/

const alliesDivs = {
    "0100010000100": "2nd Guards Tank Corps",
    "0100110000010": "3rd Guards Tank Corps",
    "0100010000110": "29th Tank Corps",
    "0100010010000": "3rd Guards Mechanised Corps",
    "0100010010100": "Maneuver Group Tyurin",
    "0100010010011": "Maneuver Group Bezugly",
    "0100010010110": "9th Guards Cavalry",
    "0100010001111": "26th Guards Rifles",
    "0100010010001": "44th Guards Rifles",
    "0100010001110": "184th Rifles",
    "0011110001100": "3rd (US) Armored",
    "0100010011001": "2nd (FR) Armoured",
    "0100010011000": "15th Infantry",
    "0011110000100": "3rd Canadian Infantry"
}

const axisDivs = {
    "0011110001110": "5th Panzer",
    "0100010000111": "20th Panzer",
    "0100010011011": "21st Panzer",
    "0100010011010": "116th Panzer",
    "0100010011101": "Panzer Lehr",
    "0100010001010": "Gruppe Harteneck",
    "0100110000001": "1st Skijager",
    "0100010001001": "78th Sturm",
    "0100010010101": "14th Infantry",
    "0100010001000": "28th Jager",
    "0100010011100": "352nd Infantry",
    "0100010001011": "Koruck 559",
    "0100010001100": "1st Lovas",
    "0100010001101": "12th Tartalek"
}

const income = {
    0: "None",
    1: "Very Low",
    2: "Low",
    3: "Normal",
    4: "High",
    5: "Very High"
}

const mode = {
    2: "Conquest",
    3: "Closer Combat",
    5: "Breakthrough",
}

const victory = {
    0: "Total Defeat",
    1: "Major Defeat",
    2: "Minor Defeat",
    3: "Draw",
    4: "Minor Victory",
    5: "Major Victory",
    6: "Total Victory",
}

const scoreLimit = {
    1000: "Low",
    2000: "Normal",
    4000: "High",
}

const map = {
    "_2x2_Urban_River_Bobr_LD_1v1": "Bobr",
    "_2x2_Urban_River_Bobr_LD_1v1_BKT": "Bobr",
    "_2x2_Urban_River_Bobr_LD_1v1_CQC": "Bobr",
    "_2x2_Ville_Centrale_Haroshaje_LD_1v1": "Haroshaje",
    "_2x2_Ville_Centrale_Haroshaje_LD_1v1_BKT": "Haroshaje",
    "_2x2_Ville_Centrale_Haroshaje_LD_1v1_CQC": "Haroshaje",
    "_2x2_River_Swamp_Krupa_LD_1v1": "Krupa",
    "_2x2_River_Swamp_Krupa_LD_1v1_BKT": "Krupa",
    "_2x2_River_Swamp_Krupa_LD_1v1_CQC": "Krupa",
    "_2x2_Lenina_LD_1v1": "Lenina1",
    "_2x2_Lenina_LD_1v1_BKT": "Lenina1",
    "_2x2_Lenina_LD_1v1_CQC": "Lenina1",
    "_2x2_Plateau_Central_Orsha_E_LD_1v1": "Orsha_East",
    "_2x2_Plateau_Central_Orsha_E_LD_1v1_BKT": "Orsha_East",
    "_2x2_Plateau_Central_Orsha_E_LD_1v1_CQC": "Orsha_East",
    "_2x1_Proto_levelBuild_Orsha_N_LD_1v1": "Orsha_North",
    "_2x1_Proto_levelBuild_Orsha_N_LD_1v1_BKT": "Orsha_North",
    "_2x1_Proto_levelBuild_Orsha_N_LD_1v1_CQC": "Orsha_North",
    "_2x2_Ostrowno_LD_1v1": "Ostrowno1",
    "_2x2_Ostrowno_LD_1v1_BKT": "Ostrowno1",
    "_2x2_Ostrowno_LD_1v1_CQC": "Ostrowno1",
    "_2x2_Shchedrin_LD_1v1": "Shchedrin1",
    "_2x2_Shchedrin_LD_1v1_BKT": "Shchedrin1",
    "_2x2_Shchedrin_LD_1v1_CQC": "Shchedrin1",
    "_2x2_Lacs_Sianno_LD_1v1": "Sianno",
    "_2x2_Lacs_Sianno_LD_1v1_BKT": "Sianno",
    "_2x2_Lacs_Sianno_LD_1v1_CQC": "Sianno",
    "_2x2_Slutsk_E_LD_1v1": "Slutsk_East",
    "_2x2_Slutsk_E_LD_1v1_BKT": "Slutsk_East",
    "_2x2_Slutsk_E_LD_1v1_CQC": "Slutsk_East",
    "_2x2_Slutsk_W_LD_1v1": "Slutsk_West",
    "_2x2_Slutsk_W_LD_1v1_BKT": "Slutsk_West",
    "_2x2_Slutsk_W_LD_1v1_CQC": "Slutsk_West",
    "_2x2_Slutsk_LD_1v1": "Slutsk1",
    "_2x2_Slutsk_LD_1v1_BKT": "Slutsk1",
    "_2x2_Slutsk_LD_1v1_CQC": "Slutsk1",
    "_2x2_Foret_Tsel_LD_1v1": "Tsel",
    "_2x2_Foret_Tsel_LD_1v1_BKT": "Tsel",
    "_2x2_Foret_Tsel_LD_1v1_CQC": "Tsel",
    "_3x2_Highway_LD_CQC": "Autobahn_Zur_Holle",
    "_3x2_Highway_LD_CQC_BKT": "Autobahn_Zur_Holle",
    "_3x2_Highway_LD_CQC_CQC": "Autobahn_Zur_Holle",
    "_3x2_Beshankovichy_LD_2v2": "Beshankovichy",
    "_3x2_Beshankovichy_LD_2v2_BKT": "Beshankovichy",
    "_3x2_Beshankovichy_LD_2v2_CQC": "Beshankovichy",
    "_3x2_West_Bobrujsk_LD_2v2": "Bobrujsk_West",
    "_3x2_West_Bobrujsk_LD_2v2_BKT": "Bobrujsk_West",
    "_3x2_West_Bobrujsk_LD_2v2_CQC": "Bobrujsk_West",
    "_3x2_Lenina_LD_2v2": "Lenina2",
    "_3x2_Lenina_LD_2v2_CQC": "Lenina2",
    "_3x2_Lenina_LD_2v2_BKT": "Lenina2",
    "_3x2_Astrouna_Novka_LD_2v2": "Novka",
    "_3x2_Astrouna_Novka_LD_2v2_CQC": "Novka",
    "_3x2_Astrouna_Novka_LD_2v2_BKT": "Novka",
    "_3x2_Ostrowno_LD_2v2": "Ostrowno2",
    "_3x2_Ostrowno_LD_2v2_BKT": "Ostrowno2",
    "_3x2_Ostrowno_LD_2v2_CQC": "Ostrowno2",
    "_3x2_Shchedrin_LD_2v2": "Shchedrin2",
    "_3x2_Shchedrin_LD_2v2_CQC": "Shchedrin2",
    "_3x2_Shchedrin_LD_2v2_BKT": "Shchedrin2",
    "_3x2_Slutsk_LD_2v2": "Slutsk2",
    "_3x2_Slutsk_LD_2v2_CQC": "Slutsk2",
    "_3x2_Slutsk_LD_2v2_BKT": "Slutsk2",
    "_3x2_Veselovo_LD_2v2": "Veselovo",
    "_3x2_Veselovo_LD_2v2_CQC": "Veselovo",
    "_3x2_Veselovo_LD_2v2_BKT": "Veselovo",
    "_3x2_East_Vitebsk_LD_2v2": "Vitebsk_East",
    "_3x2_East_Vitebsk_LD_2v2_CQC": "Vitebsk_East",
    "_3x2_East_Vitebsk_LD_2v2_BKT": "Vitebsk_East",
    "_3x2_Urban_roads_Krupki_LD_3v3": "Krupki",
    "_3x2_Urban_roads_Krupki_LD_3v3_CQC": "Krupki",
    "_3x2_Urban_roads_Krupki_LD_3v3_BKT": "Krupki",
    "_3x2_Lenina_LD_3v3": "Lenina3",
    "_3x2_Lenina_LD_3v3_CQC": "Lenina3",
    "_3x2_Lenina_LD_3v3_BKT": "Lenina3",
    "_3x2_Lipen_LD_3v3": "Lipen",
    "_3x2_Lipen_LD_3v3_BKT": "Lipen",
    "_3x2_Lipen_LD_3v3_CQC": "Lipen",
    "_3x2_Lyakhavichy_LD_3v3": "Lyakhavichy",
    "_3x2_Lyakhavichy_LD_3v3_BKT": "Lyakhavichy",
    "_3x2_Lyakhavichy_LD_3v3_CQC": "Lyakhavichy",
    "_3x2_Mogilev_LD_3v3": "Mogilev",
    "_3x2_Mogilev_LD_3v3_BKT": "Mogilev",
    "_3x2_Mogilev_LD_3v3_CQC": "Mogilev",
    "_3x2_Marecages_Naratch_lake_LD_3v3": "Naratch_Lake",
    "_3x2_Marecages_Naratch_lake_LD_3v3_BKT": "Naratch_Lake",
    "_3x2_Marecages_Naratch_lake_LD_3v3_CQC": "Naratch_Lake",
    "_3x2_Ostrowno_LD_3v3": "Ostrowno3",
    "_3x2_Ostrowno_LD_3v3_BKT": "Ostrowno3",
    "_3x2_Ostrowno_LD_3v3_CQC": "Ostrowno3",
    "_3x2_Rivers_Pleshchenitsy_S_LD_3v3": "Pleshchenitsy_South",
    "_3x2_Rivers_Pleshchenitsy_S_LD_3v3_CQC": "Pleshchenitsy_South",
    "_3x2_Rivers_Pleshchenitsy_S_LD_3v3_BKT": "Pleshchenitsy_South",
    "_3x2_Shchedrin_LD_3v3": "Shchedrin3",
    "_3x2_Shchedrin_LD_3v3_CQC": "Shchedrin3",
    "_3x2_Shchedrin_LD_3v3_BKT": "Shchedrin3",
    "_3x2_Slutsk_LD_3v3": "Slutsk3",
    "_3x2_Slutsk_LD_3v3_CQC": "Slutsk3",
    "_3x2_Slutsk_LD_3V3_BKT": "Slutsk3",
    "_3x2_Bridges_Smolyany_LD_3v3": "Smolyany",
    "_3x2_Bridges_Smolyany_LD_3v3_CQC": "Smolyany",
    "_3x2_Bridges_Smolyany_LD_3v3_BKT": "Smolyany",
    "_4x2_Lenina_LD_4v4": "Lenina4",
    "_4x2_Lenina_LD_4v4_CQC": "Lenina4",
    "_4x2_Lenina_LD_4v4_BKT": "Lenina4",
    "_3x2_Ostrowno_LD_4v4": "Ostrowno4",
    "_3x2_Ostrowno_LD_4v4_BKT": "Ostrowno4",
    "_3x2_Ostrowno_LD_4v4_CQC": "Ostrowno4",
    "_3x2_Shchedrin_LD_4v4": "Shchedrin4",
    "_3x2_Shchedrin_LD_4v4_CQC": "Shchedrin4",
    "_3x2_Shchedrin_LD_4v4_BKT": "Shchedrin4",
    "_4x2_Slutsk_LD_4v4": "Slutsk4",
    "_4x2_Slutsk_LD_4v4_CQC": "Slutsk4",
    "_4x2_Slutsk_LD_4v4_BKT": "Slutsk4",
}


function getGameDuration(time) {
    if (time === "0" || time === 0) {
        return "No Limit"
    }
    const minutes = Math.floor(time / 60);
    const seconds = time - minutes * 60;
    return `${minutes} minutes : ${seconds} seconds`
}

module.exports.replayInfo = (message) => {
    const url = (message.attachments.first().url);
    fetch(url).then(res => res.buffer()).then(buffer => {
        fileType(buffer)
        content = buffer;
        const json = content.slice(0x38).toString().split("}}")[0];
        const result = JSON.parse(`{"data":${json}}}`)
        const gameDataTrimmed = [];
        const playerCount = Object.keys(result).length - 1;
        const endData = content.toString().split(`{"result":`)[1]
        const endResult = JSON.parse(`{"data":${endData}`)

        if (playerCount > 4) {
            message.channel.send(`Apologies, but ${config.botName} does not support full parsing games larger than 2v2's.`)
            return;
        }
        if (playerCount > 2) {
            message.channel.send("Due to size restrictions, the following embed is a minimal overview.")
        }

        Object.entries(result).forEach((i) => {
            if (i[0] === "data") {
                const e = i[1];
                const obj = {
                    "map": e.Map,
                    "startingPoints": e.InitMoney,
                    "scoreLimit": e.ScoreLimit,
                    "serverName": e.ServerName,
                    "gameVersion": e.Version,
                    "income": e.IncomeRate,
                    "vicCond": e.VictoryCond,
                    "timeLimit": e.TimeLimit,
                    "gameMode": e.GameMode,
                    "mods": e.ModList
                }
                gameDataTrimmed.push(obj);
            } else {
                const e = i[1];
                const obj = {
                    "userID": e.PlayerUserId,
                    "side": e.PlayerAlliance,
                    "level": e.PlayerLevel,
                    "name": e.PlayerName,
                    "deckCode": e.PlayerDeckContent,
                }
                gameDataTrimmed.push(obj);
            }
        })

        const embed = new Discord.RichEmbed();
        gameDataTrimmed.forEach((i, index) => {
            if (!index) {
                const mapName = map[i.map];
                const attachment = new Discord.Attachment(`general/images/${mapName}.jpg`);
                embed.setColor('#0099ff')
                embed.setTitle(i.serverName ? i.serverName : "Skirmish Game")
                embed.addField('Score Limit', `${scoreLimit[i.scoreLimit]} (${i.scoreLimit})`, true)
                embed.addField('Time Limit', getGameDuration(i.timeLimit), true)
                embed.addField('Map', map[i.map].replace("_", " ").replace("_", " "), true)
                embed.addField('Income', income[i.income], true)
                embed.addField('Duration', `||${getGameDuration(endResult.data.Duration)}||`, true)
                embed.addField('Game Outcome', `||${victory[endResult.data.Victory]}||`, true)
                embed.addField('Game mode', mode[i.vicCond], true)
                embed.setFooter(`Game Version: ${i.gameVersion}`);
                embed.addBlankField()
                embed.attachFile(attachment)
                embed.setImage(`attachment://${mapName}.jpg`);
            } else {
                embed.addField("Player:", `${i.name ? i.name : "AI Player"} (uid: ${i.userID})`)
                embed.addField("Division", getDivision(i.deckCode), true)
                if (playerCount <= 2) {
                    embed.addField("Level:", i.level, true)
                    embed.addField("Deck Code:", i.deckCode)
                }
                embed.addBlankField()
            }
        })
        message.channel.send(embed)
    })


    if (message.content.includes("result")) {
        if (playerCount <= 2) {
            parseIntoDb(gameDataTrimmed, result, endResult)
        } else {
            //err msg
        }
    }
}

function getDivision(code) {
    let base64data = Buffer.from(code, 'base64');
    let binaryData = "";
    for (x of base64data.values()) {
        let a = x.toString(2);
        while (a.length < 8) {
            a = "0" + a;
        }
        binaryData = binaryData + a
    }
    const divs = { ...axisDivs, ...alliesDivs }
    return divs[binaryData.slice(12, 25)];
}


function parseIntoDb(gameData, startData, endData) {

}