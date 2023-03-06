const ipcRenderer = require('electron').ipcRenderer;

var LedMatrix = require('easybotics-rpi-rgb-led-matrix');

const MAX_FPS = 30;

const tickerStart = 480;
const tickerHeight = 160;
const tickerWidth = 640;
var globalx = 500;
var vector = -1;
var interval = 120;
var fontsize = tickerHeight / 2;

function createRenderer(device) {
	const width = device.deviceData.pixelsPerStrip;
	const height = device.deviceData.numberStrips;
	const canvas = document.createElement('canvas');
	canvas.width = width * 10; // blow up everythiing x10 so we can see
	canvas.height = height * 10;
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');

	console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`);

	updateTickerInfo();

	////////////////////////////////////////////////
	//init a 16 rows  by 16 cols led matrix
	//default hardware mapping is 'regular', could be 'adafruit-hat-pwm' ect
	var matrix = new LedMatrix(16, 16);
	matrix.fill(255, 50, 100);
	matrix.setPixel(0, 0, 0, 50, 255);
	matrix.update();
	////////////////////////////////////////////////

	// Main Information
	// renderer process
	ipcRenderer.on('gameData', function (event, gameData) {
		setInterval(banner, 75 / interval, ctx, gameData, matrix);
	});
}

function updateTickerInfo() {
	console.log('requesting ticker info update from main');
	ipcRenderer.send('getGameData');
}

function banner(ctx, games, matrix) {
	const text = games.join('\t|\t');
	console.log(`text is ${text}`);
	ctx.clearRect(0, tickerStart, tickerWidth, tickerHeight);
	ctx.fillStyle = 'rgb(0, 0, 0)';
	ctx.fillRect(0, tickerStart, tickerWidth, tickerHeight);

	ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
	ctx.font = fontsize + 'px Helvetica';
	ctx.textBaseline = 'top';
	//Get new data and restart
	if (globalx < 0 - ctx.measureText(text).width) {
		globalx = tickerWidth;
		console.log(`ticker info was ${games}`);
		updateTickerInfo();
		console.log(`ticker info now is ${games}`);
	}
	ctx.fillText(text, globalx, 640 - fontsize * 1.5);

	globalx += vector;

	////////////////////////////////////////////////////////
	matrix.fill(255, 50, 100);
	matrix.setPixel(0, 0, 0, 50, 255);
	matrix.update();
	//draw on matrix
	/*
	matrix
		.clear() // clear the display
		.brightness(100) // set the panel brightness to 100%
		.fgColor(0x0000ff) // set the active color to blue
		.fill() // color the entire diplay blue
		.fgColor(0xffff00) // set the active color to yellow
		// draw a yellow circle around the display
		.drawCircle(matrix.width() / 2, matrix.height() / 2, matrix.width() / 2 - 1)
		// draw a yellow rectangle
		.drawRect(
			matrix.width() / 4,
			matrix.height() / 4,
			matrix.width() / 2,
			matrix.height() / 2
		)
		// sets the active color to red
		.fgColor({ r: 255, g: 0, b: 0 })
		// draw two diagonal red lines connecting the corners
		.drawLine(0, 0, matrix.width(), matrix.height())
		.drawLine(matrix.width() - 1, 0, 0, matrix.height() - 1)
		.sync();
		*/
	///////////////////////////////////////////////////
}

createRenderer({ deviceData: { pixelsPerStrip: 64, numberStrips: 64 } });
