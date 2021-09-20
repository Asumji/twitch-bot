const tmi = require('tmi.js');
const fs = require("fs");
const points = JSON.parse(fs.readFileSync("./files/economy.json", "utf8"));
var economy = false

const client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: 'name',
		password: 'password'
	},
	channels: []
});

client.connect();

client.on('message', (channel, user, message, self) => {
	const ecPrefix = "?"

	if (!points[user.username + " " + channel]) {
		points[user.username + " " + channel] = {
			points: 0,
			name: user.username
		}
	}
	fs.writeFileSync("./files/economy.json", JSON.stringify(points, null, 4), err => {
		console.log(err);
	});

	if(self) return;
	const args = message.split(' ');
	const command = args.shift().toLowerCase();
	
	if (command == ecPrefix + "toggleeconomy" || command == ecPrefix + "tec") {
		if ("#" + user.username == channel) {
			if (economy == true) {
				economy = false
				client.say(channel, "Disabled economy commands!")
			} else {
				economy = true
				client.say(channel, "Enabled Economy commands!")
			}
		}
	}

	if (economy == true) {
		if (command == ecPrefix + "points") {
			if (args[0]) {
				if (args[0].startsWith("@")) {
					if (points[args[0].slice(1).toLowerCase() + " " + channel]) {
						client.say(channel, args[0] + " has " + points[args[0].slice(1).toLowerCase() + " " + channel].points + " points.")
					}
				} else {
					client.say(channel, "@" + args[0] + " has " + points[args[0].toLowerCase() + " " + channel].points + " points.")
				}
			} else {
				client.say(channel, "@" + user.username + " has " + points[user.username + " " + channel].points + " points.")
			}
		}

		if (command == ecPrefix + "gamble") {
			if (args[0]) {
				var dice = Math.floor(Math.random() * 100 + 1)
				if (!isNaN(args[0])) {
					var bet = parseInt(args[0])
					if (bet <= points[user.username + " " + channel].points) {
						console.log(dice)
						if (dice > 50) {
							if (dice == 100) {
								points[user.username + " " + channel].points += bet * 3
								client.say(channel, "Wow! @" + user.username + " just rolled 100! You earned " + bet * 3 + " points! You now have " + points[user.username + " " + channel].points + " points.")
							} else {
								points[user.username + " " + channel].points += bet * 2
								client.say(channel, "@" + user.username + " just rolled " + dice + "! You earned " + bet * 2 + " points! You now have " + points[user.username + " " + channel].points + " points.")
							}
						} else {
							if (dice == 50) {
								points[user.username + " " + channel].points += bet * 3
								client.say(channel, "Wow! @" + user.username + " just rolled 50! You earned " + bet * 3 + " points! You now have " + points[user.username + " " + channel].points + " points.")
							} else {
								points[user.username + " " + channel].points -= bet
								client.say(channel, "Noooo! @" + user.username + " just rolled " + dice + "! You lost " + bet + " points! You now have " + points[user.username + " " + channel].points + " points.")
							}
						}
					}
				}
			}
		}

		if (command == ecPrefix + "top") {
			var array = []
			var numArray = []
			async function mkArray() {
				for (var userr in points) {
					var userChannel = userr.split(" ")
					userChannel = userChannel[1]
					if (userChannel == channel) {
						array.push([userr, points[userr].points])
					}
				}
			}

			async function sort() {
				await mkArray()
				for (var i in array) {
					numArray.push(points[array[i][0]].points)
					numArray = numArray.sort(function (a, b) {  return b - a;  });
				}
			}
			
			async function leaderboardFunc() {
				await sort()
				numArray = numArray.join("/")
				numArray = "/" + numArray + "/"
				for (var i in array) {
					numArray = numArray.replace("/" + array[i][1] + "/", "/" + array[i][0] + "/")
				}
			}

			async function mkLeaderboard() {
				await leaderboardFunc()
				string = "1. name0 (points0), 2. name1 (points1), 3. name2 (points2), 4. name3 (points3), 5. name4 (points4), 6. name5 (points5), 7. name6 (points6), 8. name7 (points7), 9. name8 (points8), 10. name9 (points9)"
				numArray = numArray.split("/")
				for (var i = 0; i < numArray.length; i++) {
					if (points[numArray[i + 1]]) {
						string = string.replace(`name${i}`, points[numArray[i + 1]].name)
						string = string.replace(`points${i}`, points[numArray[i + 1]].points)
					}
				}
				client.say(channel, string)
			}
			mkLeaderboard()
		}


		if (command == ecPrefix + "addpoints") {
			if (user.username == "asumji") {
				if (args[0]) {
					if (args[1]) {
						if (!isNaN(args[1])) {
							if (args[0] == "everyone") {
								for (var userr in points) {
									var userChannel = userr.split(" ")
									userChannel = userChannel[1]
									if (userChannel == channel) {
										if (points[userr].points == 0) {
											points[userr].points = parseInt(args[1])
										}
									}
								}
								client.say(channel, "I gave everyone that had 0 points " + args[1] + " points.")
							} else {
								if (args[0].startsWith("@")) {
									if (points[args[0].slice(1).toLowerCase() + " " + channel]) {
										points[args[0].slice(1).toLowerCase() + " " + channel].points += parseInt(args[1])
										client.say(channel, "I gave " + args[0] + " " + args[1] + " points.")
									}
								} else {
									if (points[args[0].toLowerCase() + " " + channel]) {
										points[args[0].toLowerCase() + " " + channel].points += parseInt(args[1])
										client.say(channel, "I gave @" + args[0] + " " + args[1] + " points.")
									}
								}
							}
						}
					}
				}
			}
		}
	}


});
