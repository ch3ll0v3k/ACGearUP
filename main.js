// http://www.radiators-champ.com/RSRLiveTiming/index.php?page=world_records

// const logger = require('mii-logger.js');
// console.logTime( false );
// console.logColor( false );

// https://github.com/ch3ll0v3k/ACGearUP/releases/download/1.1.2/ACGearUP-linux-x64.v1.1.2.tar.xz
// https://github.com/ch3ll0v3k/ACGearUP/releases/download/1.1.2/ACGearUP-win32-x64.v1.1.2.zip


process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = true;
process.env.NODE_ENV = ( process.env.NODE_ENV || 'prod' );
process.env.IS_MAC = ((''+process.platform).toLowerCase().trim() === 'darwin');
process.env.IS_LINUX = ((''+process.platform).toLowerCase().trim() === 'linux'); // 'openbsd', 'freebsd'
process.env.IS_WIN = ((''+process.platform).toLowerCase().trim() === 'win32');
process.env.ICON = __dirname+'/img/icon.png';

const Notif = require('./common/electron/Notif');
const fs = require('fs');

const electron = require('electron');
const { app, BrowserWindow, Menu, Tray, Notification, dialog } = electron;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
let tray = null;

const template = [
  // { role: 'appMenu' },
  // ...(process.env.IS_MAC ? [{
  //   label: 'app.getName()',
  //   submenu: [
  //     { role: 'about' },
  //     { type: 'separator' },
  //     { role: 'services' },
  //     { type: 'separator' },
  //     { role: 'quit' }
  //   ]
  // }] : []),
  // { role: 'fileMenu' },
  {
    label: 'File',
    submenu: [
      process.env.IS_MAC ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // {
  //   label: 'Settings',
  //   submenu: [{
  //       label: 'PS4',
  //       click() {
  //       },
  //     },
  //   ]
  // },
  {
    role: 'help',
    submenu: [
      {
        label: 'Help: GitHub.com',
        click () { electron.shell.openExternalSync('https://github.com/ch3ll0v3k/ACGearUP') },
      }
    ]
  }
];

const menu = Menu.buildFromTemplate( template );
Menu.setApplicationMenu( menu );

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1350,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      webPreferences: { webSecurity: false },
    }
  });

  // and load the index.html of the app.
  win.loadFile('index.html');

  // Open the DevTools.
  win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  // console.log( Notification.isSupported() );
  // new Notif({msg:'Hello world', title: 'This is title'});
  // new Notif({msg:'Hello world -2'});
  // console.log(dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'multiSelections'] }));

};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', ()=>{
  createWindow();

  tray = new Tray( process.env.ICON );
  // tray.setTitle('** title **'); // MAC-OS

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Item1', type: 'radio' },
    { label: 'Item2', type: 'radio' },
    { label: 'Item3', type: 'radio', checked: true },
    { label: 'Item4', type: 'radio' },
    {
      label: 'App',
      submenu: [
        { role: 'close' },
      ]
    },
  ]);

  tray.setToolTip('ACGearUP');
  tray.setContextMenu( contextMenu );
  // console.log(dialog.showOpenDialog({ properties: ['openFile', 'openDirectory', 'multiSelections'] }));

});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if ( process.env.IS_MAC ) {
    app.quit()
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if ( process.env.IS_MAC ) {
    createWindow()
  }
});