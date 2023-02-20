const PixelPusher = require('node-pixel-pusher');
const querystring = require('querystring');

const MAX_FPS = 30;

function createRenderer(device) {
	const width = device.deviceData.pixelsPerStrip;
	const height = device.deviceData.numberStrips;
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	document.body.appendChild(canvas);
	const ctx = canvas.getContext('2d');

	console.log(window.process.argv);
	const query = querystring.parse(global.location.search);
	let games = JSON.parse(query['?data']);
	console.log(`Creating renderer ${width}x${height} ${MAX_FPS}fps`);

	// Main Information

	// Ticker
	populateTickerInfo(ctx, games);

	ctx.fillStyle = 'green';
	ctx.fillRect(0, 0, width, height);

	/*
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

function populateTickerInfo(ctx, games) {
	// TODO get the axios game info here

	setInterval(banner, 1000 / interval, ctx, games);
}

var globalx = 500;
var vector = -1;
var interval = 120;
var fontsize = 80;
const tickerStart = 480;
const tickerHeight = 160;
const tickerWidth = 640;

function banner(ctx, games) {
	const text = games.join('\t|\t');
	console.log(`text is ${text}`);
	ctx.clearRect(tickerHeight, 0, tickerWidth, tickerHeight);
	ctx.fillStyle = 'rgb(100, 100, 100)';
	ctx.fillRect(tickerStart, 0, tickerWidth, tickerHeight);

	ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
	ctx.font = fontsize + 'px Helvetica';
	ctx.textBaseline = 'top';
	if (globalx < 0 - ctx.measureText(text).width) {
		globalx = tickerWidth;
	}
	ctx.fillText(text, globalx, (tickerHeight - fontsize) / 2);

	globalx += vector;
}

/*
const service = new PixelPusher.Service();

service.on('discover', (device) => {
	createRenderer(device);
});
*/
console.log('creating rendered');
createRenderer({ deviceData: { pixelsPerStrip: 64, numberStrips: 64 } });
