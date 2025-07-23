const { ipcMain } = require('electron');

function setupWindowHandlers(win) {
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
}

module.exports = setupWindowHandlers;
