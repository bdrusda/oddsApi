const PixelPusher = require('node-pixel-pusher');
const ipcRenderer = require('electron').ipcRenderer;

const MAX_FPS = 30;

var globalx = 500;
var vector = -1;
var interval = 120;
var fontsize = 30;
const tickerStart = 480;
const tickerHeight = 160;
const tickerWidth = 640;

let games = [''];

function createRenderer(device) {
	const width = device.deviceData.pixelsPerStrip;
	const height = device.deviceData.numberStrips;
	const canvas = document.createElement('canvas');
	canvas.width = width * 10; // blow up everythiing x10 so we can see
	canvas.height = height * 10;
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');

	console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`);

	// TODO how about that?
	updateTickerInfo();

	// Main Information
	// renderer process
	ipcRenderer.on('gameData', function (event, gameData) {
		console.log(gameData);
		// TODO alternatively, the dumb way to do this would be to append to the end of the existing games list and this may(?) pick up and effectively start over.  maybe not though?
		games = gameData;

		// Ticker - try putting this here.  ticker will reset every 60 seconds but that may be okay for the moment
		updateTickerInfo();
		setInterval(banner, 750 / interval, ctx, games);
	});

	/*
	ctx.fillStyle = 'green';
	ctx.fillRect(0, 0, width, height);

	device.startRendering(() => {
		// Render
		ctx.fillStyle = 'green';
		ctx.fillRect(0, 0, width, height);

		// Get data
		const ImageData = ctx.getImageData(0, 0, width, height);

		// Send data to LEDs
		device.setRGBABuffer(ImageData.data);
	}, MAX_FPS);
    */
}

function updateTickerInfo() {
	console.log('requesting ticker info update from main');
	ipcRenderer.send('getGameData');
}

function banner(ctx, games) {
	const text = games.join('\t|\t');
	console.log(`text is ${text}`);
	ctx.clearRect(tickerHeight, 0, tickerWidth, tickerHeight);
	ctx.fillStyle = 'rgb(245, 238, 44)';
	ctx.fillRect(tickerStart, 0, tickerWidth, tickerHeight);

	ctx.fillStyle = 'rgba(50, 84, 168, 0.4)';
	ctx.font = fontsize + 'px Helvetica';
	ctx.textBaseline = 'top';
	//Loop back around
	if (globalx < 0 - ctx.measureText(text).width) {
		globalx = tickerWidth;
		console.log(`ticker info was ${games}`);
		updateTickerInfo();
		console.log(`ticker info now is ${games}`);
	}
	ctx.fillText(text, globalx, (tickerHeight - fontsize) / 2);

	globalx += vector;
}

createRenderer({ deviceData: { pixelsPerStrip: 64, numberStrips: 64 } });

/*
const service = new PixelPusher.Service();

service.on('discover', (device) => {
	createRenderer(device);
});
*/
