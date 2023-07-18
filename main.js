// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')

require('./sentry');
require('./src/server');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
// let mainWindow
let onlineStatusWindow;

function createWindow() {
  // Create the browser window.
  onlineStatusWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  onlineStatusWindow.loadURL(`file://${__dirname}/src/index.html`)

  // Emitted when the window is closed.
  onlineStatusWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    onlineStatusWindow = null
  })
}
app.commandLine.appendSwitch('charset', 'utf-8');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (onlineStatusWindow === null) createWindow()
})
ipcMain.on('demo.error', () => {
  console.log('Error triggered in main processes');
  throw new Error('Error triggered in main processes');
});

// CRASH
ipcMain.on('demo.crash', () => {
  console.log('process.crash()');
  process.crash();
});
