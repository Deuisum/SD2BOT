// const sqlite3 = require('sqlite3').verbose();
// const config = require("./config");
// const jsonfile = require('jsonfile');
// const jsonObj = jsonfile.readFileSync("players.json");

// function _commitResults(mapChosen,winnerName,winnerDiv,loserName,loserDiv,mapsBanned,divsBanned,isDraw,playerNamesIfDraw,divsIfDraw)
// {
//     if(isDraw)
//     {
//         gameDraw(playerNamesIfDraw,divsIfDraw)
//     }
//     else
//     {
//         gameNotDraw(winnerName,winnerDiv,loserName,loserDiv)
//     }

//     commitBans(mapsBanned,divsBanned);

//     updateOtherColumns(mapChosen,winnerName,winnerDiv,loserName,loserDiv,isDraw,playerNamesIfDraw,divsIfDraw);
// }

// function gameDraw(playerNamesIfDraw,divsIfDraw)
// {
//     let playerOne = getUsernameFromID(playerNamesIfDraw[0]);   
//     let playerTwo = getUsernameFromID(playerNamesIfDraw[1]);
//     let divOne = divsIfDraw[0];
//     let divTwo = divsIfDraw[1];

//     db = connect();
//     db.serialize(function()
//     {
//         //Update player draws
//         db.run('UPDATE players SET Draw = Draw + 1 WHERE name = ?', [playerOne], function(err)
// 		{
// 			if (err) { throw err; } 
//         });
        
//         db.run('UPDATE players SET Draw = Draw + 1 WHERE name = ?', [playerTwo], function(err)
// 		{
// 			if (err) { throw err; } 
//         });
        
//         //update divisions draws
// 		db.run('UPDATE divResults SET Draw = Draw + 1 WHERE name = ?', [divOne], function(err)
// 		{
// 			if (err) { throw err; } 
// 		});

// 		db.run('UPDATE divResults SET Draw = Draw + 1 WHERE name = ?', [divTwo], function(err)
// 		{
// 			if (err) { throw err; } 
//         });
//     })
//     db.close();
// }

// function gameNotDraw(winnerName,winnerDiv,loserName,loserDiv)
// {
//     db = connect();
//     db.serialize(function()
//     {
//         db.run('UPDATE players SET Wins = Wins + 1 WHERE name = ?', [getUsernameFromID(winnerName)], function(err)
//         {
//             if (err) { throw err; }
//         });

//         db.run('UPDATE players SET Loss = Loss + 1 WHERE name = ?', [getUsernameFromID(loserName)], function(err)
//         {
//             if (err) { throw err; } 
//         });

//         db.run('UPDATE divResults SET Wins = Wins + 1 WHERE name = ?', [winnerDiv], function(err)
//         {
//             if (err) { throw err; }
//         });

//         db.run('UPDATE divResults SET Loss = Loss + 1 WHERE name = ?', [loserDiv], function(err)
//         {
//             if (err) { throw err; } 
//         });
//     })
//     db.close();
// }

// function commitBans(mapsBanned,divsBanned)
// {
//     db = connect();
//     //submit div bans
// 	for (div in divsBanned)
// 	{
// 		db.serialize(function() 
// 		{
// 			db.run('UPDATE divResults SET Bans = Bans + 1 WHERE name = ?', [divsBanned[div]], function(err)
// 			{
// 				if (err) 
// 				{
// 		   			throw err;
// 		  		} 
// 			});
// 		})
// 	}

// 	//submit map bans
// 	for (map in mapsBanned)
// 	{
// 		db.serialize(function() 
// 		{
// 			db.run('UPDATE mapResults SET Bans = Bans + 1 WHERE name = ?', [mapsBanned[map]], function(err)
// 			{
// 				if (err) 
// 				{
// 		   			throw err;
// 		  		} 
// 			});
// 		})
//     }
//     db.close();
// }

// function updateOtherColumns(mapChosen,winnerName,winnerDiv,loserName,loserDiv,isDraw,playerNamesIfDraw,divsIfDraw)
// {
//     db = connect();
//     let player1 = "";
//     let player2 = "";
//     let div1 = "";
//     let div2 = "";

//     if(isDraw)
//     {
//         player1 = getUsernameFromID(playerNamesIfDraw[0]);
//         player2 = getUsernameFromID(playerNamesIfDraw[1]);
//         div1 = divsIfDraw[0];
//         div2 = divsIfDraw[1];
//     } 
//     else 
//     {
//         player1 = getUsernameFromID(winnerName);
//         player2 = getUsernameFromID(loserName);
//         div1 = winnerDiv;
//         div2 = loserDiv;
//     }

//     db.serialize(function()
//     {
//         //update win % of the players now
// 		db.run('UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draw AS float) + CAST(Loss AS float))*100 WHERE name = ?', [player1], function(err)
// 		{
//             if (err) { throw err; } 
// 		});

// 		db.run('UPDATE players SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draw AS float) + CAST(Loss AS float))*100 WHERE name = ?', [player2], function(err)
// 		{
//             if (err) { throw err; } 
//         });

//         //update player total points
//         db.run('UPDATE players SET TotalPoints = Wins*3 + Draw WHERE name = ?', [player1], function(err)
// 		{
//             if (err) { throw err; }
//         });

//         db.run('UPDATE players SET TotalPoints = Wins*3 + Draw WHERE name = ?', [player2], function(err)
// 		{
//             if (err) { throw err; }
// 		});

//         //Update Win percentage of the divisions
// 		db.run('UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draw AS float) + CAST(Loss AS float))*100 WHERE name = ?', [div1], function(err)
// 		{
// 			if (err) { throw err; }
// 		});

// 		db.run('UPDATE divResults SET WinPercent = CAST(Wins AS float)/(CAST(Wins AS float) + CAST(Draw AS float) + CAST(Loss AS float))*100 WHERE name = ?', [div2], function(err)
// 		{
//             if (err) { throw err; }
//         });
        
//         //Update what map was played on 
//         db.run('UPDATE mapResults SET Picks = Picks + 1 WHERE name = ?', [mapChosen], function(err)
// 		{
//             if (err) { throw err; }
//         });
        
//         //now update the pick that were picked
//         db.run('UPDATE divResults SET Picks = Picks + 1 WHERE name = ?', [div1], function(err)
// 		{
// 			if (err) { throw err; }
// 		});

// 		db.run('UPDATE divResults SET Picks = Picks + 1 WHERE name = ?', [div2], function(err)
// 		{
// 			if (err) { throw err; }
//         });
//     })
//     db.close();
// }


// //Creates a connection to the results database
// //calling this method MUST be paired with a 'db.close();' in the same method
// function connect()
// {
// 	var db = new sqlite3.Database('./resultsDB.db', (err) => {
//   		if (err) 
//   		{
//     		console.error(err.message);
//   		}
// 	});
// 	return db;
// }

// //returns the users name from an ID
// function getUsernameFromID(user)
// {
// 	user = user.replace(/" "/g,"");
// 	for(var i = 0, len = jsonObj.users.length; i < len; i++) 
// 	{
// 		if(user == jsonObj.users[i].discordID)
// 		{
// 			return jsonObj.users[i].username;
// 		} 
// 	}
// }

// module.exports = {
//     commitResults: _commitResults
// }