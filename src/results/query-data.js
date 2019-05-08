
//OLD CODE

// const AsciiTable = require('ascii-table')
// const sqlite3 = require('sqlite3').verbose();

// function _mapResults(message, args)
// {
//     let db = connect();

//     let sortBy = 'Picks';
//     let ascOrDesc = 'DESC';

//     let stuff = args.toString().split(" ");

//     for(st in stuff)
//     {
//         if(stuff[st].match(/(pick)/gi))
//         {
//             sortBy = "Picks";
//         }
//         if(stuff[st].match(/(ban)/gi))
//         {
//             sortBy = "Bans";
//         } 
//         if(stuff[st].match(/(asc)/gi))
//         {
//             ascOrDesc = "ASC";
//         }
//         if(stuff[st].match(/(des)/gi))
//         {
//             ascOrDesc = "DESC";
//         }
//     }

//     var table = new AsciiTable('Top 20 Maps Sorted by ' + sortBy + ' in ' + ascOrDesc + ' order.');
// 	table.setHeading('Name','Picks', 'Bans');
// 	db.serialize(function() 
// 	{
// 		db.each('SELECT * FROM mapResults ORDER BY '+ sortBy + ' ' + ascOrDesc + ' LIMIT 20', function(err, row)
// 		{
// 			if (err) { console.log(err); } 
// 		  	else 
// 		  	{
// 				table.addRow(row.Name, row.Picks, row.Bans);
// 		  	}
// 		}, function() {
// 			message.channel.send("```" + table.toString() + "```");
// 		})
// 	})
//     db.close();
// }

// function _playerResults(message, args)
// {
//     let db = connect();
//     let stuff = args.toString().split(" ");
    
//     let sortBy = 'Wins';
//     let ascOrDesc = 'DESC';

//     for(st in stuff)
//     {
//         if(stuff[st].match(/(%)/gi))
//         {
//             sortBy = "WinPercent";
//         }
//         else if(stuff[st].match(/(loss)/gi))
//         {
//             sortBy = "Loss";
//         } 
//         else if(stuff[st].match(/(draw)/gi))
//         {
//             sortBy = "Draw";
//         } 
//         else if(stuff[st].match(/(pts)/gi))
//         {
//             sortBy = "Pts";
//         }  
//         else if(stuff[st].match(/(win)/gi))
//         {
//             sortBy = "Wins";
//         } 
//         if(stuff[st].match(/(asc)/gi))
//         {
//             ascOrDesc = "ASC";
//         }
//         if(stuff[st].match(/(des)/gi))
//         {
//             ascOrDesc = "DESC";
//         }
//     }

//     var table = new AsciiTable('Top 20 Players Sorted by ' + sortBy + ' in ' + ascOrDesc + ' order.');
// 	table.setHeading('Name', 'Wins', 'Draw', 'Loss', 'Pts', 'Win %')
// 	db.serialize(function() 
// 	{
// 		db.each('SELECT * FROM players ORDER BY ' + sortBy + ' ' + ascOrDesc + ' LIMIT 20', function(err, row)
// 		{
// 			if (err) { console.log(err); } 
// 		  	else 
// 		  	{
// 				let winPercent2dp =  row.WinPercent;
// 				winPercent2dp = winPercent2dp.toFixed(2);
// 				table.addRow(row.Name, row.Wins, row.Draw, row.Loss, row.TotalPoints, winPercent2dp);
// 		  	}
// 		}, function() {
// 			message.channel.send("```" + table.toString() + "```");
// 		})
// 	})


//     db.close();
// }

// function _divResults(message, args)
// {
//     let db = connect();
//     let stuff = args.toString().split(" ");
    
//     let sortBy = 'Wins';
//     let ascOrDesc = 'DESC';

//     for(st in stuff)
//     {
//         if(stuff[st].match(/(%)/gi))
//         {
//             sortBy = "WinPercent";
//         }
//         else if(stuff[st].match(/(loss)/gi))
//         {
//             sortBy = "Loss";
//         } 
//         else if(stuff[st].match(/(draw)/gi))
//         {
//             sortBy = "Draw";
//         } 
//         else if(stuff[st].match(/(pick)/gi))
//         {
//             sortBy = "Picks";
//         }  
//         else if(stuff[st].match(/(ban)/gi))
//         {
//             sortBy = "Bans";
//         }  
//         else if(stuff[st].match(/(win)/gi))
//         {
//             sortBy = "Wins";
//         } 

//         if(stuff[st].match(/(asc)/gi))
//         {
//             ascOrDesc = "ASC";
//         }
//         if(stuff[st].match(/(des)/gi))
//         {
//             ascOrDesc = "DESC";
//         }
//     }

//     var table = new AsciiTable('Top 20 Divs Sorted by ' + sortBy + ' in ' + ascOrDesc + ' order.');
// 	table.setHeading('Name', 'Wins', 'Draw', 'Loss', 'Picks', 'Bans', 'Win %')
// 	db.serialize(function() 
// 	{
// 		db.each('SELECT * FROM divResults ORDER BY ' + sortBy + ' ' + ascOrDesc + ' LIMIT 20', function(err, row)
// 		{
// 			if (err) { console.log(err); } 
// 		  	else 
// 		  	{
// 				let winPercent2dp =  row.WinPercent;
// 				winPercent2dp = winPercent2dp.toFixed(2);
// 				table.addRow(row.Name, row.Wins, row.Draw, row.Loss, row.Picks, row.Bans, winPercent2dp);
// 		  	}
// 		}, function() {
// 			message.channel.send("```" + table.toString() + "```");
// 		})
// 	})
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

// module.exports = {
//     mapResults: _mapResults,
//     playerResults: _playerResults,
//     divResults: _divResults
// };
