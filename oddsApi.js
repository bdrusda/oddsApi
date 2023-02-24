const axios = require('axios');
const { JSDOM } = require('jsdom');
const jquery = require('jquery');
const PixelPusher = require('node-pixel-pusher');
const { app, BrowserWindow } = require('electron');
const { time } = require('console');
const ipcMain = require('electron').ipcMain;

const BASE_URL = 'https://www.espn.com/mens-college-basketball/lines';
let mainWindow = undefined;

// Main method
app.whenReady().then(() => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 694,
		height: 427,
		useContentSize: true,
		resizable: false,
		webPreferences: {
			nodeIntegration: true,
			backgroundThrottling: false,
			contextIsolation: false,
			enableRemoteModule: true,
		},
	});

	// and load the index.html of the app.
	mainWindow.loadFile('index.html');

	// Create the window
	app.on('activate', function () {
		console.log('activated');
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	/* 
		Initial call + fetch new data every minute -- in the future maybe we may want to make this call when the ticker is running out 
		Have a listener here and have it send a message to get it
	*/
	/*setInterval(() => {
		fetchGameDataAndSendToRenderer();
	}, 60000);*/

	// Listen for renderer to request new game info
	ipcMain.on('getGameData', (event) => {
		console.log('getting game data per request from renderer');
		fetchGameDataAndSendToRenderer();
	});
});

// Close out the app
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});

// Info for the games
function formatGames(games) {
	const formattedGames = games.map(
		(game) =>
			`${game.home.name} (${game.home.ml}) ${game.spread} v ${game.away.name} (${game.away.ml}) o/u ${game.over}`
	);
	return formattedGames;
}

/**
 * Get the info for all games
 *
 * @param {*} $
 * @returns
 */
function getGameData($) {
	const games = [];

	// TODO reformat this so we grab the game object and then just find parent date? - that may help with the date not being pulled farther down

	// Get the information for each day
	$('.margin-date').each((i, dayInfo) => {
		const dailyGames = getDailyGames($, dayInfo);
		games.push(...dailyGames);
	});
	return games;
}

/**
 * Get the information for all of a day's games
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

/**
 * Get the information for a game
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
		home: null,
		away: null,
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

	// Get the info for the home team
	game.home = getTeamInfo($, teams[0]);

	// Get the info for the away team
	game.away = getTeamInfo($, teams[1]);

	return game;
}

/**
 * Get the name, logo, and moneyline odds for a team
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

/**
 * Get the spread and over for a game
 *
 */
function getSpreadOver($, teamsInfo) {
	const prop1 = $($(teamsInfo[0]).find('.Table__TD')[2]).text();
	const prop2 = $($(teamsInfo[1]).find('.Table__TD')[2]).text();

	const p1IsSpread = prop1.indexOf('-') || prop1.indexOf('+');

	return {
		spread: p1IsSpread ? prop1 : prop2,
		over: p1IsSpread ? prop2 : prop1,
	};
}

function fetchGameDataAndSendToRenderer() {
	axios.get(BASE_URL).then((response) => {
		// console.log(response);
		const webpage = new JSDOM(response.data).window;
		const $ = jquery(webpage);
		const games = getGameData($);

		const formattedGames = formatGames(games);

		// formattedGames.forEach((game) => console.log(game));

		mainWindow.webContents.send('gameData', formattedGames);
		console.log('got new game data');
	});
}
