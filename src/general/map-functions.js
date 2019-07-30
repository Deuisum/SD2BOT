const common = require("./common");
const config = require("../config");
const AsciiTable = require("ascii-table");

function removeUndefinedInTable(obj) {
  if (obj === undefined) {
    obj = [];
    obj[0] = "";
    obj[1] = "";
  } else {
    obj[1] = !obj[1];
  }
  return obj;
}

module.exports.pickUnbannedMap = pickUnbannedMap = maps => {
  const notBannedList = Object.keys(maps).filter(x => {
    return maps[x];
  });
  const rndMap = Math.floor(Math.random() * notBannedList.length);
  if (notBannedList.length === 0) {
    return "No valid maps to pick from.";
  }
  return notBannedList[rndMap];
};

module.exports.allMaps = message => {
  const table = new AsciiTable("Maps");
  table.setHeading("1v1", "2v2", "3v3", "4v4");
  for (let i = 0; i < 13; i++) {
    //13 is max number of items in the 4 objects
    let maps1 = Object.keys(common.maps1v1)[i];
    let maps2 = Object.keys(common.maps2v2)[i];
    let maps3 = Object.keys(common.maps3v3)[i];
    let maps4 = Object.keys(common.maps4v4)[i];

    if (maps1 === undefined) {
      maps1 = "";
    }
    if (maps2 === undefined) {
      maps2 = "";
    }
    if (maps3 === undefined) {
      maps3 = "";
    }
    if (maps4 === undefined) {
      maps4 = "";
    }
    table.addRow(maps1, maps2, maps3, maps4);
  }
  common.say(message, "``" + table.toString() + "``");
};

module.exports.rmap = rmap = (message, input = "") => {
  let map;
  switch (input) {
    case "1v1":
      map = pickUnbannedMap(common.maps1v1);
      break;
    case "2v2":
      map = pickUnbannedMap(common.maps2v2);
      break;
    case "3v3":
      map = pickUnbannedMap(common.maps3v3);
      break;
    case "4v4":
      map = pickUnbannedMap(common.maps4v4);

      break;
    default:
      map = pickUnbannedMap({
        ...common.maps1v1,
        ...common.maps2v2,
        ...common.maps3v3,
        ...common.maps4v4
      });
      message.reply(
        `Unknown input size input.\nPicking from all maps: ${map}`,
        { file: `./general/images/${map}.jpg` }
      );
      return;
  }
  if (map === "No valid maps to pick from.") {
    message.reply("error. All maps of this size have been banned.");
  } else {
    message.reply(map, { file: `./general/images/${map}.jpg` });
  }
};

// God I have amazing naming schemes
module.exports.banning_unbanningMaps = (message, msgInput, unbanBool) => {
  let errorInInput = false;
  const allMaps = {
    ...common.maps1v1,
    ...common.maps2v2,
    ...common.maps3v3,
    ...common.maps4v4
  };
  msgInput.forEach((i, index) => {
    msgInput[index] = common.alterUserInput(msgInput[index]);
    if (!allMaps.hasOwnProperty(msgInput[index])) {
      errorInInput = true;
      if (msgInput[index] === `${config.prefix}banmap`) {
        common.say(
          message,
          `Please state a map, use ${
            config.prefix
          }allmaps, to get the list of maps.`
        );
      } else {
        common.say(
          message,
          `I don't know what that map is, did you mean ***${common.lexicalGuesser(
            msgInput[index],
            allMaps
          )}*** instead of ***${msgInput[index]}***.\nNo maps have been banned.`
        );
      }
    }
  });

  if (errorInInput) {
    return;
  }

  let mapsBanned = "";
  Object.entries(common.maps1v1).forEach(([key, val]) => {
    msgInput.forEach(ikey => {
      if (key === ikey) {
        mapsBanned = mapsBanned + key + ", ";
        common.maps1v1[key] = unbanBool;
      }
    });
  });
  Object.entries(common.maps2v2).forEach(([key, val]) => {
    msgInput.forEach(ikey => {
      if (key === ikey) {
        mapsBanned = mapsBanned + key + ", ";
        common.maps2v2[key] = unbanBool;
      }
    });
  });
  Object.entries(common.maps3v3).forEach(([key, val]) => {
    msgInput.forEach(ikey => {
      if (key === ikey) {
        mapsBanned = mapsBanned + key + ", ";
        common.maps3v3[key] = unbanBool;
      }
    });
  });
  Object.entries(common.maps4v4).forEach(([key, val]) => {
    msgInput.forEach(ikey => {
      if (key === ikey) {
        mapsBanned = mapsBanned + key + ", ";
        common.maps4v4[key] = unbanBool;
      }
    });
  });

  mapsBanned = mapsBanned.slice(0, -2);
  unbanBool
    ? common.say(
        message,
        "``The following maps have been unbanned: " + mapsBanned + "``"
      )
    : common.say(
        message,
        "``The following maps have been banned: " + mapsBanned + "``"
      );
  bannedMaps(message);
};

module.exports.bannedMaps = bannedMaps = message => {
  const table = new AsciiTable("");
  table.setHeading(
    "1v1 Maps",
    "Banned?",
    "2v2 Maps",
    "Banned?",
    "3v3 Maps",
    "Banned?",
    "4v4 Maps",
    "Banned?"
  );
  for (let i = 0; i < 13; i++) {
    //13 is max number of items in the 4 objects
    let maps1 = Object.entries(common.maps1v1)[i];
    let maps2 = Object.entries(common.maps2v2)[i];
    let maps3 = Object.entries(common.maps3v3)[i];
    let maps4 = Object.entries(common.maps4v4)[i];
    maps1 = removeUndefinedInTable(maps1);
    maps2 = removeUndefinedInTable(maps2);
    maps3 = removeUndefinedInTable(maps3);
    maps4 = removeUndefinedInTable(maps4);
    table.addRow(
      maps1[0],
      maps1[1],
      maps2[0],
      maps2[1],
      maps3[0],
      maps3[1],
      maps4[0],
      maps4[1]
    );
  }
  common.say(message, "``" + table.toString() + "``");
};

module.exports.resetMaps = message => {
  for (key in common.maps1v1) {
    common.maps1v1[key] = true;
  }
  for (key in common.maps2v2) {
    common.maps2v2[key] = true;
  }
  for (key in common.maps3v3) {
    common.maps3v3[key] = true;
  }
  for (key in common.maps4v4) {
    common.maps4v4[key] = true;
  }
  message.channel.reply("Map pool reset.");
};
