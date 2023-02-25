const PixelPusher = require('node-pixel-pusher');
const ipcRenderer = require('electron').ipcRenderer;

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

	// Main Information
	// renderer process
	ipcRenderer.on('gameData', function (event, gameData) {
		setInterval(banner, 75 / interval, ctx, gameData);
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
}

createRenderer({ deviceData: { pixelsPerStrip: 64, numberStrips: 64 } });

/*
const service = new PixelPusher.Service();

service.on('discover', (device) => {
	createRenderer(device);
});
*/
