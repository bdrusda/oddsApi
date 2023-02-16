const axios = require('axios');
const { JSDOM } = require('jsdom');
const jquery = require('jquery');

const BASE_URL = 'https://www.espn.com/mens-college-basketball/lines';

axios.get(BASE_URL).then((response) => {
	console.log(response);
	const webpage = new JSDOM(response.data).window;
	const $ = jquery(webpage);
	const games = getGameData($);

	games.forEach((game) => console.log(game));

	const x = 1;
});

function getGameData($) {
	const games = [];

	// TODO reformat this so we grab the game object and then just find parent date? - that may help with the date not being pulled farther down

	// TODO the spread is always on the favorite, but the favorite isn't always first, so that's going to complicate things

	// Get the information for each day
	$('.margin-date').each((i, dayInfo) => {
		const dailyGames = getDailyGames($, dayInfo);
		games.push(...dailyGames);
	});
	return games;
}

/** Get the information for all of a day's games
 *
 * @param {*} $
 * @param {*} dayInfo
 * @returns
 */
function getDailyGames($, dayInfo) {
	const dailyGames = [];
	const date = $(dayInfo).find('.Table__Title').text();

	$(dayInfo)
		.find('.margin-wrapper')
		.each((i, gameInfo) => {
			dailyGames.push(getGameInfo($, date, gameInfo));
		});
	return dailyGames;
}

/** Get the information for a game
 *
 * @param {*} $
 * @param {*} date
 * @param {*} gameInfo
 * @returns
 */
function getGameInfo($, date, gameInfo) {
	// Get the time for the game
	const time = $($(gameInfo).find('.Table__sub-header')[0]).find(
		'.Table__TH'
	)[0].innerHTML;

	// Create the base game object
	const game = {
		date: date,
		time: time,
		favorite: null,
		dog: null,
		spread: null,
		over: null,
		teams: [],
	};

	// Grab the info for the teams
	const teams = $(gameInfo).find('.Table__TR--sm');

	// Get the spread and over info for the game
	const spreadOver = getSpreadOver($, teams);
	game.spread = spreadOver.spread;
	game.over = spreadOver.over;

	// Get the info for the favorite
	game.favorite = getTeamInfo($, teams[0]);

	// Get the info for the underdog
	game.dog = getTeamInfo($, teams[1]);

	return game;
}

/** Get the name, logo, and moneyline odds for a team
 *
 * @param {*} $
 * @param {*} teamObject
 * @returns
 */
function getTeamInfo($, teamObject) {
	const teamInfo = $(teamObject).find('.Table__TD');
	return {
		name: $(teamInfo[0]).find('div > a').text(),
		logo: $(teamInfo[0]).find('.TeamLink__Logo > .a').attr('href'),
		ml: $(teamInfo[3]).text(),
	};
}

/** Get the spread and over for a game
 *
 */
function getSpreadOver($, teamsInfo) {
	return {
		spread: $($(teamsInfo[0]).find('.Table__TD')[2]).text(),
		over: $($(teamsInfo[1]).find('.Table__TD')[2]).text(),
	};
}
