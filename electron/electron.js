const path = require('path');
const { app, BrowserWindow, ipcMain, shell } = require('electron');

const isDev = process.env.IS_DEV == "true" ? true : false;

let win; // Definisci la variabile globale

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 650,
    autoHideMenuBar: true,
    resizable: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  win.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../dist/index.html')}`
  );
  // Open the DevTools.
  if (isDev) {
    //win.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// === Canali IPC ===

// === Gestione finestra ===
ipcMain.handle('window:minimize', () => {
  win?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (win?.isMaximized()) {
    win.restore();
  } else {
    win?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  win?.close();
});

// === Gestione visualizzazione ===
ipcMain.on('page:load', (_event, newPage) => {
  win.webContents.send('page:visualize', newPage);
});
