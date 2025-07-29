const path = require("path");
const { app, BrowserWindow, shell } = require("electron");

const isDev = process.env.IS_DEV === "true";

// importa moduli separati
const setupWindowHandlers = require("./ipc/window");
const setupPageHandlers = require("./ipc/page");
const setupUserHandlers = require("./ipc/user");
const setupServerHandlers = require("./ipc/server");
const { connectToDatabase } = require("./mongo");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    height: 650,
    autoHideMenuBar: true,
    resizable: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
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
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  if (isDev) {
    // win.webContents.openDevTools();
  }

  //=== Database ===
  connectToDatabase();

  //=== Moduli IPC ===
  setupWindowHandlers(win);
  setupPageHandlers(win);
  setupUserHandlers(win);
  setupServerHandlers(win)
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
