// const levenshtein = require('js-levenshtein');
// const jsonfile = require('jsonfile');
// const sqlite3 = require('sqlite3').verbose();
// const config = require("./config");
// const commit = require("./enterData");
// const jsonObj = jsonfile.readFileSync("players.json");

const common = require("../general/common");

const resultStateObject = {
    error: false,
    errorText: [],

    isDraw: false,
    hasOutcome: false,


    hasPlayerOne: false,
    hasPlayerTwo: false,
    hasMapPlayed: false,

    winnerName: "",
    hasWinner: false,
    loserName: "",
    hasLoser: false,

    playerNamesIfDraw: [],
    playerDivsIfDraw: [],

    bannedDivs: [],
    bannedMaps: [],



    mapPlayed: ""

}



module.exports.validateResults = (message) => {
    const input = message.content.substring(1, message.content.length).split(/\n/);

    for (i in input) {
        input[i] = input[i].toLowerCase().trim();
    }
    // console.log("test",input)
    init();
    isDraw(input);
    getMapInfo(input);
    getBans(input);

    findWinnersAndLosers(message, input);
    verifyPlayers(message);




    if (!resultStateObject.isDraw) {

    }

    // console.log(resultStateObject)
    // // if (resultStateObject.error) {
    //     // const concatErrText = resultStateObject.errorText.join("\n")
    //     common.say(message, resultStateObject.errorText);
    // }
}

//verify winners/losers
async function verifyPlayers(message) {
    const db = common.connect();


    if (resultStateObject.isDraw) {
        const promises = resultStateObject.playerNamesIfDraw.map((name) => {
            common.sql(`SELECT EXISTS (SELECT 1 FROM players WHERE uid = ${name})`);
        })
        Promise.all(promises);
        // console.log("sql", obj)
        console.log("sql", promises)
    }


   

    // if (resultStateObject.isDraw) {
    //     const promises = await resultStateObject.playerNamesIfDraw.map((name) => {
    //         return db.serialize(() => {
    //             db.each('SELECT EXISTS (SELECT 1 FROM players WHERE UID = (?))', [name], (err, row) => {
    //                 console.log(Object.values(row).toString() === "0")
    //                 if (Object.values(row).toString() === "0") {
    //                     if (typeof(name) === "number") {
    //                         message.guild.fetchMember(name).then((i) => {
    //                             resultStateObject.error = true;
    //                             resultStateObject.errorText.push(`\nUnknown user ${i.user.username} .`)
    //                         })
    //                     } else {
    //                         resultStateObject.error = true;
    //                         resultStateObject.errorText.push(`\nUnknown user ${name} .`)
    //                     }
    
    //                 }
    //             })
    //         })
    //     })
    //     Promise.all(promises)
    //     // console.log(promises)
    // }

    db.close();
}

function findWinnersAndLosers(message, input) {
    input.forEach(element => {
        let i = "";
        if (element.match(/((p(1|2)( |-)name)|(winner)|(loser)):/gi)) {
            i = element.replace(/^.+:/, '').replace("<", "").replace(">", "").replace("@", "").replace("!", "").trim();
            // If the game is a draw
            if (resultStateObject.isDraw) {
                if (element.match(/(p(1|2)( |-)name):/gi)) {
                    resultStateObject.hasLoser = true;
                    resultStateObject.hasWinner = true;
                    resultStateObject.playerNamesIfDraw.push(i);
                }
            } else {
                if (element.match(/(winner)/gi)) {
                    resultStateObject.hasWinner = true;
                    resultStateObject.winnerName = i;
                }
                if (element.match(/(loser)/gi)) {
                    resultStateObject.hasLoser = true;
                    resultStateObject.loserName = i;
                }
            }
        }
    });
}

function getMapInfo(input) {
    input.forEach(element => {
        if (element.match(/(map:)/gi)) {
            let map = element.substr(4).trim();
            map = common.alterUserInput(map);
            if (common.maps.hasOwnProperty(map)) {
                resultStateObject.hasMapPlayed = true;
                resultStateObject.mapPlayed = map;
            } else {
                resultStateObject.error = true;
                resultStateObject.errorText.push(`Unknown played map **${map}** did you mean **${common.lexicalGuesser(map, common.maps)}**?`)
            }
        }
    })
}

function getBans(input) {
    let ban = "";
    input.forEach(element => {
        if (element.match(/(p(1|2)( |-)div( |-)ban( |-)(1|2|3|4|5):)/gi)) {
            ban = element.substr(13).trim();
            ban = common.alterUserInput(ban);
            if (common.allies.hasOwnProperty(ban) || common.axis.hasOwnProperty(ban)) {
                resultStateObject.bannedDivs.push(ban)
            } else {
                resultStateObject.error = true;
                resultStateObject.errorText.push(`Unknown banned division **${ban}** did you mean **${common.lexicalGuesser(ban, { ...common.allies, ...common.axis })}**?`)
            }
        }

        if (element.match(/(p(1|2)( |-)map( |-)ban( |-)(1|2|3|4|5):)/gi)) {
            ban = element.substr(13).trim();
            ban = common.alterUserInput(ban);
            if (common.map.hasOwnProperty(ban)) {
                resultStateObject.bannedDivs.push(ban)
            } else {
                resultStateObject.error = true;
                resultStateObject.errorText.push(`Unknown banned map **${ban}** did you mean **${common.lexicalGuesser(ban, common.maps)}**?`)
            }
        }
    })
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


//reset all 
function init() {

}











// //Globals
// var mapChosen = "";
// var p1Winner = false;
// var winnerName = "";
// var winnerDiv = "";
// var loserName = "";
// var loserDiv = "";
// var mapsBanned = [];
// var divsBanned = [];
// var isDraw = false;
// var playerNamesIfDraw = [];
// var divsIfDraw = [];

// //Required inputs
// var hasOutcome = false;
// var hasMapPlayed = false;
// var hasWinner = false;
// var hasLoser = false;
// var hasP1 = false;
// var hasP1div = false;
// var hasP2 = false;
// var hasP2div = false;

// var errorBool = false;
// var errorString = "";

// var divs = ["3rd armoured","4th armoured","101st airborne","2nd infantry","2e blindee","demi-brigade sas",
// "7th armoured","guards armoured","6th airborne","15th infantry","1st ssb","3rd canadian infantry",
// "1 pancerna", "1st infantry","panzer-lehr","12. ss-panzer","1. ss-panzer","2. panzer","9. panzer",
// "21. panzer","116. panzer", "17. ss-panzergrenadier", "3. fallschirmjager","16. luftwaffe", "91. luftlande",
// "festung grob-paris","352. infanterie", "716. infanterie"];

// var maps = ["bois de limors","carpiquet","caumont l'evente","cheux","colleville","colombelles","cote 112",
// "mont ormel","odon","omaha","pegasus bridge","pointe du hoc","carpiquet-duellist","merderet","odon river",
// "sainte mere l'eglise","sainte mere l'eglise duellists"];

// //data extraction and validation
// function _validateData(message, args)
// {
//     resetGlobals();
//     //Pick out and validate data
//     for(arg in args)
//     {
//         gameIsDraw(args[arg]); //work out if game is a draw
//         nonEssentialInfo(args[arg]); //div and map bans
//         mapPlayed(args[arg]); //find out what map was played
//     }

//     for(arg in args)
//     {
//         winnersAndLosers(args[arg]) //get winners/losers info
//     }

//     for(arg in args)
//     {
//         divPicks(args[arg]) //find out which div won/lost
//     }
//     //the final thing to evaluate is if the reuqired inputs are there
//     //outcome, names, picks and map played are required, everything else is optional
//     validateMissingInputs();

//     if(errorBool)
// 	{
// 		return [errorBool, errorString];
//     } 
//     message.channel.send("No errors in input. Committing results...");
//     commit.commitResults(mapChosen,winnerName,winnerDiv,loserName,loserDiv,mapsBanned,divsBanned,isDraw,playerNamesIfDraw,divsIfDraw);
//     return [false, ""];
// }

// //Validates which divison won/lost and if those divs are valid
// function divPicks(input)
// {
//     let fullInput = input;
//     if(fullInput.match(/(p(1|2)( |-)pick)/gi))
//     {
//         let div = trimInput(input);
//         if(!divs.includes(div))
//         {
//             errorBool = true;
//             errorString = errorString + "\nUnknown input `" + div + "` at `"+ fullInput +"` did you mean `" + lexicalGuesser(div, divs) + "`?";
//         } 
//         else
//         {
//             if(!isDraw)
//             {
//                 //assigns winner and loser divs based off of whether p1 or p2 won
//                 if(fullInput.match(/(p1( |-)pick)/gi) && p1Winner)
//                 {
//                     winnerDiv = div;
//                 } 
//                 else if(fullInput.match(/(p2( |-)pick)/gi) && !p1Winner)
//                 {
//                     winnerDiv = div;
//                 } 
//                 else
//                 {
//                     loserDiv = div;
//                 }
//             } 
//             else 
//             {
//                 divsIfDraw.push(div); 
//             }

//             //validation to make sure they have the required inputs
//             if(fullInput.match(/(p1( |-)pick)/gi))
//             {
//                 hasP1div = true;
//             } 
//             if(fullInput.match(/(p2( |-)pick)/gi))
//             {
//                 hasP2div = true;
//             } 
//         } 
//     }
// }

// //Collect the winner and loser of the game
// function winnersAndLosers(input)
// {
//     let fullInput = input;
//     if(fullInput.match(/(P(1|2)( |-)name)|(Winner)|(Loser)/gi))
//     {
//         let user = trimInput(input);
//         //Check if the user is registered
//         if(!userIsRegistered(user))
//         {
//             errorBool = true;
//             errorString = errorString + "\nUnknown user `" + user + "` at `" + fullInput + "`";
//             return;
//         }
//         //if we reach here, we can assume the user is registered
//         //if the game is not a draw
//         if(!isDraw)
//         {
//             //These should always run first unless results is called with "p1/2 name" above winner/loser
//             //possible errors could occur because of this, but it's a negligible risk
//             if(fullInput.match(/(Winner)/gi))
//             {
//                 hasWinner = true;
//                 winnerName = user;
//             }
//             if(fullInput.match(/(Loser)/gi))
//             {
//                 hasLoser = true;
//                 loserName = user;
//             }

//             //now we store if p1 was the winner or not
//             //helps us later on find out which division 
//             //is the winning one
//             if(fullInput.match(/(P1( |-)name)/gi))
//             {
//                 if(winnerName == user)
//                 {
//                     p1Winner = true;
//                 }
//                 else
//                 {
//                     p1Winner = false;
//                 }
//             }
//         }
//         else 
//         {
//             //if draw, add both p1 and 2 to the draw array
//             if(fullInput.match(/(P(1|2)( |-)name)/gi))
//             {
//                 hasWinner = true;
//                 hasLoser = true;
//                 playerNamesIfDraw.push(user)  
//             }
//         }

//         //validation to make sure they have the required inputs
//         if(fullInput.match(/(p1( |-)name)/gi))
//         {
//             hasP1 = true;
//         } 
//         if(fullInput.match(/(p2( |-)name)/gi))
//         {
//             hasP2 = true;
//         } 
//     }
// }

// //Checks if game was a draw
// //this affects how other inputs will
// //be treated later on
// function gameIsDraw(input)
// {
//     if(input.match(/(Outcome( |:))+/gi))
// 	{
//         input = trimInput(input);
//         if(input.includes("draw"))
//         {
//             isDraw = true;
//         }
//         hasOutcome = true;
//     }
// }

// //Checks if the map played is valid
// function mapPlayed(input)
// {
//     let fullInput = input;
//     if(fullInput.match(/(map( |-)played( |:))/gi))
//     {
//         input = trimInput(input);
//         if(!maps.includes(input))
//         {
//             errorBool = true;
//             errorString = errorString + "\nUnknown input `" + input + "` at `"+ fullInput +"` did you mean `" + lexicalGuesser(input, maps) + "`?";
//         } 
//         else 
//         {
//             mapChosen = input;
//             hasMapPlayed = true;
//         }
//     }
// }

// //collects non essential info like bans of maps/divs 
// //ie these are optional when submitting results
// function nonEssentialInfo(input)
// {
//     let fullInput = input;
//     if(fullInput.match(/(p(1|2)( |-)div( |-)ban( |-)(1|2|3|4|5))/gi))
//     {
//         input = trimInput(input);
//         if(!divs.includes(input))
//         {
//             errorBool = true;
//             errorString = errorString + "\nUnknown input `" + input + "` at `"+ fullInput +"` did you mean `" + lexicalGuesser(input, divs) + "`?";
//         } 
//         else 
//         {
//             divsBanned.push(input);
//         }
//     }

//     if(fullInput.match(/(p(1|2)( |-)map( |-)ban( |-)(1|2|3|4|5))/gi))
//     {
//         input = trimInput(input);
//         if(!maps.includes(input))
//         {
//             errorBool = true;
//             errorString = errorString + "\nUnknown input `" + input + "` at `"+ fullInput +"` did you mean `" + lexicalGuesser(input, maps) + "`?";
//         } 
//         else 
//         {
//             mapsBanned.push(input);
//         }
//     }
// }

// //final stage in the validation, lines that haven't been entered into the results (such as winner name) will 
// //be picked up here and the results won't go forward until they are given
// function validateMissingInputs()
// {
//     if(!hasOutcome)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `Outcome:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasMapPlayed)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `Map Played:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasWinner)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `Winner:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasLoser)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `Loser:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasP1)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `P1 Name:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasP1div)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `P1 Pick:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasP2)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `P2 Name:`, please use " + config.prefix + "template to request a template to fill in.";
//     }
//     if(!hasP2div)
//     {
//         errorBool = true;
//         errorString = errorString + "\nMissing required line `P2 Pick`, please use " + config.prefix + "template to request a template to fill in.";
//     }
// }
// //trims down the inputted line 
// //removes all text before the :
// //removes < and > and other unwanted items
// //finally trims leftover and lowercases
// function trimInput(input)
// {
//     let editedInput = input.replace(/^.+:/,'').replace("<","").replace(">","").replace("@","").replace("!","");
//     editedInput = editedInput.trim();
//     editedInput = editedInput.toLowerCase();
//     return editedInput;
// }

// //makes a "guess" as to what the user should've entered
// //array input is either the 'maps' or 'divs' array
// function lexicalGuesser(input, array)
// {
//     let closestWord = "";
//     let closestNumber = 9999999;

//     for(let word of array)
//     {   
//         if(levenshtein(input, word) < closestNumber)
//         {
//             closestNumber = levenshtein(input, word)
//             closestWord = word;
//         }
//     }
//     closestNumber = 99999999;
//     return closestWord;
// }

// //Returns true or false based off of if the users name or id is registered
// function userIsRegistered(user)
// {
// 	for(let i = 0, len = jsonObj.users.length; i < len; i++) 
// 	{
// 		if(user == jsonObj.users[i].discordID)
// 		{
// 			return true;
// 		} 
// 		else if(user == jsonObj.users[i].username)
// 		{
// 			return true;
// 		}
// 	}
// 	return false;
// }


// //we need to put this here and not in the admin file because we need access to the arrays of divs and maps
// function _admin_createTables(message)
// {
//     //Checks if module is enabled
//     if(!config.module_adminCommands)
//     {
//         message.channel.send("The admin module is disabled.");
//         return;
//     }

//     //checks if the user has the permission
//     if(!message.member.hasPermission('ADMINISTRATOR', true))
//     {
//         message.channel.send("Error. 'ADMINISTRATOR' permission is needed to invoke this command.");
//         return;
//     }

//     let db = new sqlite3.Database('./resultsDB.db', (err) => {
//         if (err) 
//         {
//           console.error(err.message);
//         }
//     });
// 	let sqlPlayer = "CREATE TABLE IF NOT EXISTS players(Name text PRIMARY KEY, Wins integer NOT NULL, Draw integer NOT NULL, Loss integer NOT NULL, TotalPoints integer NOT NULL, WinPercent integer NOT NULL)";
// 	let sqlDivs = "CREATE TABLE IF NOT EXISTS divResults(Name text PRIMARY KEY, Wins integer NOT NULL, Draw integer NOT NULL, Loss integer NOT NULL, WinPercent integer NOT NULL, Picks integer NOT NULL, Bans integer NOT NULL)";
// 	let sqlMaps = "CREATE TABLE IF NOT EXISTS mapResults(Name text PRIMARY KEY, Picks integer NOT NULL, Bans integer NOT NULL)"
// 	db.serialize(function() 
// 	{
// 		db.run(sqlPlayer, function(err) 
// 		{
// 			if (err) { console.log(err); }
// 			else { message.channel.send("'players' table created if it doesn't exist.") }
// 		});

// 		db.run(sqlDivs, function(err) 
// 		{
// 			if (err) { console.log(err); }
// 			else { message.channel.send("'divResults' table created if it doesn't exist.") }
// 		});

// 		db.run(sqlMaps, function(err) 
// 		{
// 			if (err) { console.log(err); }
// 			else { message.channel.send("'mapResults' table created if it doesn't exist.") }
// 		});
// 	})

// 	//Now that the tables are created, we can populate them with the maps/divisions
// 	//doing it like this, rather than hand making, makes it easier to change the bot for another game
// 	for(map in maps)
// 	{
// 		db.run('INSERT INTO mapResults VALUES(?,?,?)', [maps[map],0,0], function(err) 
// 		{
// 			if (err) { console.log(err); }
// 		});
// 	}
// 	message.channel.send("'mapResults' populated");

// 	for(div in divs)
// 	{
// 		db.run('INSERT INTO divResults VALUES(?,?,?,?,?,?,?)', [divs[div],0,0,0,0,0,0], function(err) 
// 		{
// 			if (err) { console.log(err); }
// 		});
// 	}
// 	message.channel.send("'divResults' populated");
// 	db.close();
// }

// //resets globals, must be called once per submission at the start
// function resetGlobals()
// {
//     errorBool = false;
//     errorString = "";
//     mapChosen = "";
//     p1Winner = false;
//     winnerName = "";
//     winnerDiv = "";
//     loserName = "";
//     loserDiv = "";
//     mapsBanned = [];
//     divsBanned = [];
//     isDraw = false;
//     playerNamesIfDraw = [];
//     divsIfDraw = [];
//     hasOutcome = false;
//     hasMapPlayed = false;
//     hasWinner = false;
//     hasLoser = false;
//     hasP1 = false;
//     hasP1div = false;
//     hasP2 = false;
//     hasP2div = false;
// }

// module.exports = {
//     admin_createTables: _admin_createTables,
// 	validateData: _validateData
// };
