const PixelPusher = require('node-pixel-pusher');
const { app, BrowserWindow } = require('electron');
const ipcMain = require('electron').ipcMain;
const slateInfo = require('./slateInfo');

let mainWindow = undefined;

// Main method
app.whenReady().then(() => {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 640,
		height: 640,
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

	app.on('activate', function () {
		console.log('activated');
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});

	// Listen for renderer to request new game info
	ipcMain.on('getGameData', (event) => {
		console.log(
			`getting game data per request from renderer. event - ${event}`
		);
		slateInfo.fetchGameDataAndSendToRenderer(mainWindow);
	});
});

// Close out the app
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
