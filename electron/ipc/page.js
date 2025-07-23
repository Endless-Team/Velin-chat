const { ipcMain } = require('electron');

function setupPageHandlers(win) {
  ipcMain.on('page:load', (_event, newPage) => {
    win.webContents.send('page:visualize', newPage);
  });
}

module.exports = setupPageHandlers;
