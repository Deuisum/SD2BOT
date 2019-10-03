const Discord = require("discord.js");
const fetch = require("node-fetch");
const fileType = require("file-type");
const config = require("../config.json");
const common = require("../general/common");
const elo = require("../results/results-main");

function getGameDuration(time) {
  if (time === "0" || time === 0) {
    return "No Limit";
  }
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return `${minutes} minute(s) : ${seconds} second(s)`;
}

function getDivision(code) {
  let base64data = Buffer.from(code, "base64");
  let binaryData = "";
  for (x of base64data.values()) {
    let a = x.toString(2);
    while (a.length < 8) {
      a = "0" + a;
    }
    binaryData = binaryData + a;
  }
  const divs = { ...axisDivs, ...alliesDivs };
  return divs[binaryData.slice(12, 25)];
}

module.exports.replayInfo = async message => {
  const url = message.attachments.first().url;
  fetch(url)
    .then(res => res.buffer())
    .then(async buffer => {
      fileType(buffer);
      content = buffer;
      const start = content
        .slice(0x38)
        .toString()
        .split("}}")[0];
      const startData = JSON.parse(`{"data":${start}}}`);

      const end = content.toString().split(`{"result":`)[1];
      const endData = JSON.parse(`{"data":${end}`);

      const playerCount = Object.keys(startData).length - 1;
      if (playerCount !== 2) {
        message.channel.send(
          `Apologies, but ${config.botName} does not support parsing games that are not 1v1's.`
        );
        return;
      }

      const {
        player1Name,
        player2Name,
        player1DiscordId,
        player2DiscordId,
        player1EugId,
        player2EugId,
        player1DeckCode,
        player2DeckCode,
        player1Division,
        player2Division,
        player1Level,
        player2Level,
        scoreCap,
        gameName,
        timeLimit,
        mapName,
        income,
        startMoney,
        duration,
        gameMode,
        gameVersion,
        winner,
        loser,
        outCome
      } = await fetchAllData(startData, endData, message);

      const embed = new Discord.RichEmbed();

      const attachment = new Discord.Attachment(
        `general/images/${mapName}.jpg`
      );
      embed.attachFile(attachment);
      embed.setImage(`attachment://${mapName}.jpg`);

      embed.setTitle(gameName ? gameName : "Skirmish Game");

      if (winner) {
        embed.addField("Winner", `||${winner.Name}||`, true);
        embed.addField("Loser", `||${loser.Name}||`, true);
        embed.addField("Victory State", `||${outCome}||`, true);
        embed.addField("Duration", `||${duration}||`, true);
      }

      embed.setColor("#0099ff");
      embed.setFooter(`Game Version: ${gameVersion}`);
      embed.addField("Score Limit", scoreCap, true);
      embed.addField("Time Limit", timeLimit, true);
      embed.addField("Income", income, true);
      embed.addField("Game Mode", gameMode, true);
      embed.addField("Starting Points", startMoney, true);
      embed.addField("Map", mapName, true);
      embed.addField(
        "-------------------------------------------------",
        "------------------------------------------------"
      );

      embed.addField(
        "Player:",
        `${
          player1DiscordId
            ? `${player1Name} (<@${player1DiscordId}>)`
            : player1Name
            ? player1Name
            : "AI Player"
        } (Eugen ID: ${player1EugId})`
      );
      embed.addField("Division", player1Division, true);
      embed.addField("Level", player1Level, true);
      embed.addField("Deck Code", player1DeckCode);
      embed.addField(
        "-------------------------------------------------",
        "------------------------------------------------"
      );
      embed.addField(
        "Player:",
        `${
          player2DiscordId
            ? `${player2Name} (<@${player2DiscordId}>)`
            : player2Name
            ? player2Name
            : "AI Player"
        } (Eugen ID: ${player2EugId})`
      );
      embed.addField("Division", player2Division, true);
      embed.addField("Level", player2Level, true);
      embed.addField("Deck Code", player2DeckCode);

      message.channel.send(embed);
      if (message.channel.name.includes("replays")) {
        if (winner) {
          addToDb(
            player1DiscordId,
            player2DiscordId,
            player1Division,
            player2Division,
            mapName,
            winner,
            loser,
            message
          );
        }
      }
    });
};

async function fetchAllData(startData, endData, message) {
  const data = Object.entries(startData);
  const player1Name = data[1][1].PlayerName;
  const player2Name = data[2][1].PlayerName;
  const player1DbData = await fetchPlayerData(data[1][1].PlayerUserId);
  const player2DbData = await fetchPlayerData(data[2][1].PlayerUserId);

  let player1DiscordId;
  let player2DiscordId;
  if (player1DbData.length !== 0) {
    player1DiscordId = player1DbData[0].DiscordUID;
  }
  if (player2DbData.length !== 0) {
    player2DiscordId = player2DbData[0].DiscordUID;
  }

  const player1EugId = data[1][1].PlayerUserId;
  const player2EugId = data[2][1].PlayerUserId;
  const player1DeckCode = data[1][1].PlayerDeckContent;
  const player2DeckCode = data[2][1].PlayerDeckContent;
  const player1Division = getDivision(player1DeckCode);
  const player2Division = getDivision(player2DeckCode);
  const player1Level = data[1][1].PlayerLevel;
  const player2Level = data[2][1].PlayerLevel;
  const scoreCap = `${scoreLimit[data[0][1].ScoreLimit]} (${
    data[0][1].ScoreLimit
  })`;
  const gameName = data[0][1].ServerName;
  const timeLimit = getGameDuration(data[0][1].TimeLimit);
  const mapName = map[data[0][1].Map];
  const income = incomeLevel[data[0][1].IncomeRate];
  const duration = getGameDuration(endData.data.Duration);
  const gameMode = mode[data[0][1].VictoryCond];
  const gameVersion = data[0][1].Version;
  const startMoney = data[0][1].InitMoney;

  const { winner, loser, outCome } = await workOutOutcome(
    message,
    endData,
    player1DbData,
    player2DbData,
    player1Name,
    player2Name
  );

  return {
    player1Name,
    player2Name,
    player1DiscordId,
    player2DiscordId,
    player1EugId,
    player2EugId,
    player1DeckCode,
    player2DeckCode,
    player1Division,
    player2Division,
    player1Level,
    player2Level,
    scoreCap,
    gameName,
    timeLimit,
    mapName,
    income,
    duration,
    gameMode,
    gameVersion,
    startMoney,
    winner,
    loser,
    outCome
  };
}

async function workOutOutcome(
  message,
  endData,
  player1DbData,
  player2DbData,
  player1Name,
  player2Name
) {
  if (!player1DbData.length && !player2DbData.length) {
    message.channel.send(
      "Both players are unknown to the bot, results will not be recorded nor can the outcome be determined."
    );
    return { winner: "", loser: "", outCome: "" };
  }
  if (!player1DbData.length) {
    message.channel.send(
      `${player1Name} is an unknown player to the bot, results will not be recorded nor can the outcome be determined.`
    );
    return { winner: "", loser: "", outCome: "" };
  }
  if (!player2DbData.length) {
    message.channel.send(
      `${player2Name} is an unknown player to the bot, results will not be recorded nor can the outcome be determined.`
    );
    return { winner: "", loser: "", outCome: "" };
  }

  const messageAuthor = await fetchPlayerData(message.author.id);

  let authorIsP1;
  if (!messageAuthor.length) {
    message.channel.send(
      "Message author is not in the replay, results will not be recorded nor can the outcome be determined."
    );
    return { winner: "", loser: "", outCome: "" };
  }
  if (player1DbData[0].EugenUID === messageAuthor[0].EugenUID) {
    authorIsP1 = true;
  } else if (player2DbData[0].EugenUID === messageAuthor[0].EugenUID) {
    authorIsP1 = false;
  } else {
    message.channel.send(
      "Message author is not in the replay, results will not be recorded nor can the outcome be determined."
    );
    return { winner: "", loser: "", outCome: "" };
  }

  if (endData.data.Victory === 3) {
    message.channel.send(
      "SODBOT does not currently support draws, please contact an <@84696940742193152> to have your results manually added."
    );
    return { winner: "", loser: "", outCome: "" };
  }

  if (authorIsP1 === undefined) {
    message.channel.send(
      "You should never see this message, something has gone badly wrong."
    );
    return { winner: "", loser: "", outCome: "" };
  }

  if (authorIsP1) {
    if (endData.data.Victory < 3) {
      winner = player2DbData[0];
      loser = player1DbData[0];
    } else {
      winner = player1DbData[0];
      loser = player2DbData[0];
    }
  }

  if (!authorIsP1) {
    if (endData.data.Victory < 3) {
      winner = player1DbData[0];
      loser = player2DbData[0];
    } else {
      winner = player2DbData[0];
      loser = player1DbData[0];
    }
  }

  return {
    winner: winner,
    loser: loser,
    outCome: victory[endData.data.Victory]
  };
}

async function fetchPlayerData(playerEugenUID) {
  return (result = await common
    .sql(
      `SELECT * FROM players WHERE "${playerEugenUID}" IN(EugenUID, DiscordUID)`
    )
    .catch(() => {
      console.log("Caught promise error");
    }));
}

async function addToDb(
  player1DiscordId,
  player2DiscordId,
  player1Division,
  player2Division,
  mapName,
  winner,
  loser,
  message
) {
  // ---------------------------------------------------------------------------//
  //map
  await common
    .sql("UPDATE mapResults SET Picks = Picks + 1 WHERE Name = ?", [mapName])
    .catch(err => {
      console.log("Error in map update", err);
    });
  // ---------------------------------------------------------------------------//
  //player updates
  await common
    .sql("UPDATE players SET Wins = Wins + 1 WHERE DiscordUID = ?", [
      winner.DiscordUID
    ])
    .catch(err => {
      console.log("Error in map update", err);
    });
  await common
    .sql("UPDATE players SET Losses = Losses + 1 WHERE DiscordUID = ?", [
      loser.DiscordUID
    ])
    .catch(err => {
      console.log("Error in map update", err);
    });

  await common
    .sql("UPDATE players SET WinStreak = WinStreak + 1 WHERE DiscordUID = ?", [
      winner.DiscordUID
    ])
    .catch(err => {
      console.log("Error in map update", err);
    });
  await common
    .sql("UPDATE players SET WinStreak = 0 WHERE DiscordUID = ?", [
      loser.DiscordUID
    ])
    .catch(err => {
      console.log("Error in map update", err);
    });

  await common
    .sql(
      "UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE DiscordUID = ?",
      [winner.DiscordUID]
    )
    .catch(err => {
      console.log("Error in win percent update", err);
    });

  await common
    .sql(
      "UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE DiscordUID = ?",
      [loser.DiscordUID]
    )
    .catch(err => {
      console.log("Error in win percent update", err);
    });

  // ---------------------------------------------------------------------------//
  //Division updates
  if (winner.DiscordUID === player1DiscordId) {
    await common
      .sql("UPDATE divResults SET Wins = Wins + 1 WHERE Name = ?", [
        player1Division
      ])
      .catch(err => {
        console.log("Error in map update", err);
      });
    await common
      .sql("UPDATE divResults SET Losses = Losses + 1 WHERE Name = ?", [
        player2Division
      ])
      .catch(err => {
        console.log("Error in map update", err);
      });
  } else {
    await common
      .sql("UPDATE divResults SET Wins = Wins + 1 WHERE Name = ?", [
        player2Division
      ])
      .catch(err => {
        console.log("Error in map update", err);
      });
    await common
      .sql("UPDATE divResults SET Losses = Losses + 1 WHERE Name = ?", [
        player1Division
      ])
      .catch(err => {
        console.log("Error in map update", err);
      });
  }

  await common
    .sql(
      "UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE Name = ?",
      [player1Division]
    )
    .catch(err => {
      console.log("player1Division winpercent", err);
    });
  await common
    .sql(
      "UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Losses AS float))*100 WHERE Name = ?",
      [player2Division]
    )
    .catch(err => {
      console.log("player2Division winpercent", err);
    });

  await common
    .sql("UPDATE divResults SET Picks = Wins + Losses WHERE Name = ?", [
      player1Division
    ])
    .catch(err => {
      console.log("player1Division Picks", err);
    });
  await common
    .sql("UPDATE divResults SET Picks = Wins + Losses WHERE Name = ?", [
      player2Division
    ])
    .catch(err => {
      console.log("player2Division Picks", err);
    });

  const a = player1DiscordId === winner.DiscordUID ? 1 : 0;
  const b = player2DiscordId === winner.DiscordUID ? 1 : 0;
  message.channel.send("Results Submitted.");
  elo.updateTable(message, player1DiscordId, player2DiscordId, a, b);
}

//Data

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
  "0011110000100": "3rd Canadian Infantry",
  "0100110000111": "84th Gvard. Strelkovy"
};

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
  "0100010001101": "12th Tartalek",
  "0100110000110": "25th Panzergrenadier"
};

const incomeLevel = {
  0: "None",
  1: "Very Low",
  2: "Low",
  3: "Normal",
  4: "High",
  5: "Very High"
};

//Need to double check this - why missing numbers?
const mode = {
  2: "Conquest",
  3: "Closer Combat",
  5: "Breakthrough"
};

const victory = {
  0: "Total Defeat",
  1: "Major Defeat",
  2: "Minor Defeat",
  3: "Draw",
  4: "Minor Victory",
  5: "Major Victory",
  6: "Total Victory"
};

const scoreLimit = {
  1000: "Low",
  2000: "Normal",
  4000: "High"
};

const map = {
  _3x2_Siedlce_LD_1v1: "Siedlce",
  _3x2_Siedlce_LD_1v1_CQC: "Siedlce",
  _3x2_Siedlce_LD_1v1_BKT: "Siedlce",
  _2x2_Urban_River_Bobr_LD_1v1: "Bobr",
  _2x2_Urban_River_Bobr_LD_1v1_BKT: "Bobr",
  _2x2_Urban_River_Bobr_LD_1v1_CQC: "Bobr",
  _2x2_Ville_Centrale_Haroshaje_LD_1v1: "Haroshaje",
  _2x2_Ville_Centrale_Haroshaje_LD_1v1_BKT: "Haroshaje",
  _2x2_Ville_Centrale_Haroshaje_LD_1v1_CQC: "Haroshaje",
  _2x2_River_Swamp_Krupa_LD_1v1: "Krupa",
  _2x2_River_Swamp_Krupa_LD_1v1_BKT: "Krupa",
  _2x2_River_Swamp_Krupa_LD_1v1_CQC: "Krupa",
  _2x2_Lenina_LD_1v1: "Lenina1",
  _2x2_Lenina_LD_1v1_BKT: "Lenina1",
  _2x2_Lenina_LD_1v1_CQC: "Lenina1",
  _2x2_Plateau_Central_Orsha_E_LD_1v1: "Orsha_East",
  _2x2_Plateau_Central_Orsha_E_LD_1v1_BKT: "Orsha_East",
  _2x2_Plateau_Central_Orsha_E_LD_1v1_CQC: "Orsha_East",
  _2x1_Proto_levelBuild_Orsha_N_LD_1v1: "Orsha_North",
  _2x1_Proto_levelBuild_Orsha_N_LD_1v1_BKT: "Orsha_North",
  _2x1_Proto_levelBuild_Orsha_N_LD_1v1_CQC: "Orsha_North",
  _2x2_Ostrowno_LD_1v1: "Ostrowno1",
  _2x2_Ostrowno_LD_1v1_BKT: "Ostrowno1",
  _2x2_Ostrowno_LD_1v1_CQC: "Ostrowno1",
  _2x2_Shchedrin_LD_1v1: "Shchedrin1",
  _2x2_Shchedrin_LD_1v1_BKT: "Shchedrin1",
  _2x2_Shchedrin_LD_1v1_CQC: "Shchedrin1",
  _2x2_Lacs_Sianno_LD_1v1: "Sianno",
  _2x2_Lacs_Sianno_LD_1v1_BKT: "Sianno",
  _2x2_Lacs_Sianno_LD_1v1_CQC: "Sianno",
  _2x2_Slutsk_E_LD_1v1: "Slutsk_East",
  _2x2_Slutsk_E_LD_1v1_BKT: "Slutsk_East",
  _2x2_Slutsk_E_LD_1v1_CQC: "Slutsk_East",
  _2x2_Slutsk_W_LD_1v1: "Slutsk_West",
  _2x2_Slutsk_W_LD_1v1_BKT: "Slutsk_West",
  _2x2_Slutsk_W_LD_1v1_CQC: "Slutsk_West",
  _2x2_Slutsk_LD_1v1: "Slutsk1",
  _2x2_Slutsk_LD_1v1_BKT: "Slutsk1",
  _2x2_Slutsk_LD_1v1_CQC: "Slutsk1",
  _2x2_Foret_Tsel_LD_1v1: "Tsel",
  _2x2_Foret_Tsel_LD_1v1_BKT: "Tsel",
  _2x2_Foret_Tsel_LD_1v1_CQC: "Tsel",
  _3x2_Highway_LD_CQC: "Autobahn_Zur_Holle",
  _3x2_Highway_LD_CQC_BKT: "Autobahn_Zur_Holle",
  _3x2_Highway_LD_CQC_CQC: "Autobahn_Zur_Holle",
  _3x2_Beshankovichy_LD_2v2: "Beshankovichy",
  _3x2_Beshankovichy_LD_2v2_BKT: "Beshankovichy",
  _3x2_Beshankovichy_LD_2v2_CQC: "Beshankovichy",
  _3x2_West_Bobrujsk_LD_2v2: "Bobrujsk_West",
  _3x2_West_Bobrujsk_LD_2v2_BKT: "Bobrujsk_West",
  _3x2_West_Bobrujsk_LD_2v2_CQC: "Bobrujsk_West",
  _3x2_Lenina_LD_2v2: "Lenina2",
  _3x2_Lenina_LD_2v2_CQC: "Lenina2",
  _3x2_Lenina_LD_2v2_BKT: "Lenina2",
  _3x2_Astrouna_Novka_LD_2v2: "Novka",
  _3x2_Astrouna_Novka_LD_2v2_CQC: "Novka",
  _3x2_Astrouna_Novka_LD_2v2_BKT: "Novka",
  _3x2_Ostrowno_LD_2v2: "Ostrowno2",
  _3x2_Ostrowno_LD_2v2_BKT: "Ostrowno2",
  _3x2_Ostrowno_LD_2v2_CQC: "Ostrowno2",
  _3x2_Shchedrin_LD_2v2: "Shchedrin2",
  _3x2_Shchedrin_LD_2v2_CQC: "Shchedrin2",
  _3x2_Shchedrin_LD_2v2_BKT: "Shchedrin2",
  _3x2_Slutsk_LD_2v2: "Slutsk2",
  _3x2_Slutsk_LD_2v2_CQC: "Slutsk2",
  _3x2_Slutsk_LD_2v2_BKT: "Slutsk2",
  _3x2_Veselovo_LD_2v2: "Veselovo",
  _3x2_Veselovo_LD_2v2_CQC: "Veselovo",
  _3x2_Veselovo_LD_2v2_BKT: "Veselovo",
  _3x2_East_Vitebsk_LD_2v2: "Vitebsk_East",
  _3x2_East_Vitebsk_LD_2v2_CQC: "Vitebsk_East",
  _3x2_East_Vitebsk_LD_2v2_BKT: "Vitebsk_East",
  _3x2_Urban_roads_Krupki_LD_3v3: "Krupki",
  _3x2_Urban_roads_Krupki_LD_3v3_CQC: "Krupki",
  _3x2_Urban_roads_Krupki_LD_3v3_BKT: "Krupki",
  _3x2_Lenina_LD_3v3: "Lenina3",
  _3x2_Lenina_LD_3v3_CQC: "Lenina3",
  _3x2_Lenina_LD_3v3_BKT: "Lenina3",
  _3x2_Lipen_LD_3v3: "Lipen",
  _3x2_Lipen_LD_3v3_BKT: "Lipen",
  _3x2_Lipen_LD_3v3_CQC: "Lipen",
  _3x2_Lyakhavichy_LD_3v3: "Lyakhavichy",
  _3x2_Lyakhavichy_LD_3v3_BKT: "Lyakhavichy",
  _3x2_Lyakhavichy_LD_3v3_CQC: "Lyakhavichy",
  _3x2_Mogilev_LD_3v3: "Mogilev",
  _3x2_Mogilev_LD_3v3_BKT: "Mogilev",
  _3x2_Mogilev_LD_3v3_CQC: "Mogilev",
  _3x2_Marecages_Naratch_lake_LD_3v3: "Naratch_Lake",
  _3x2_Marecages_Naratch_lake_LD_3v3_BKT: "Naratch_Lake",
  _3x2_Marecages_Naratch_lake_LD_3v3_CQC: "Naratch_Lake",
  _3x2_Ostrowno_LD_3v3: "Ostrowno3",
  _3x2_Ostrowno_LD_3v3_BKT: "Ostrowno3",
  _3x2_Ostrowno_LD_3v3_CQC: "Ostrowno3",
  _3x2_Rivers_Pleshchenitsy_S_LD_3v3: "Pleshchenitsy_South",
  _3x2_Rivers_Pleshchenitsy_S_LD_3v3_CQC: "Pleshchenitsy_South",
  _3x2_Rivers_Pleshchenitsy_S_LD_3v3_BKT: "Pleshchenitsy_South",
  _3x2_Shchedrin_LD_3v3: "Shchedrin3",
  _3x2_Shchedrin_LD_3v3_CQC: "Shchedrin3",
  _3x2_Shchedrin_LD_3v3_BKT: "Shchedrin3",
  _3x2_Slutsk_LD_3v3: "Slutsk3",
  _3x2_Slutsk_LD_3v3_CQC: "Slutsk3",
  _3x2_Slutsk_LD_3V3_BKT: "Slutsk3",
  _3x2_Bridges_Smolyany_LD_3v3: "Smolyany",
  _3x2_Bridges_Smolyany_LD_3v3_CQC: "Smolyany",
  _3x2_Bridges_Smolyany_LD_3v3_BKT: "Smolyany",
  _3x2_Siedlce_LD_2v2: "Siedlce",
  _3x2_Siedlce_LD_2v2_BKT: "Siedlce",
  _3x2_Siedlce_LD_2v2_CQC: "Siedlce",
  _4x2_Lenina_LD_4v4: "Lenina4",
  _4x2_Lenina_LD_4v4_CQC: "Lenina4",
  _4x2_Lenina_LD_4v4_BKT: "Lenina4",
  _3x2_Ostrowno_LD_4v4: "Ostrowno4",
  _3x2_Ostrowno_LD_4v4_BKT: "Ostrowno4",
  _3x2_Ostrowno_LD_4v4_CQC: "Ostrowno4",
  _3x2_Shchedrin_LD_4v4: "Shchedrin4",
  _3x2_Shchedrin_LD_4v4_CQC: "Shchedrin4",
  _3x2_Shchedrin_LD_4v4_BKT: "Shchedrin4",
  _4x2_Slutsk_LD_4v4: "Slutsk4",
  _4x2_Slutsk_LD_4v4_CQC: "Slutsk4",
  _4x2_Slutsk_LD_4v4_BKT: "Slutsk4"
};
