const { ipcMain } = require("electron");
const { connectToDatabase } = require("../mongo");
const { ObjectId } = require("mongodb");

function setupServerHandlers(win) {
  ipcMain.handle("server:getAll", async (_event, username) => {
    const db = await connectToDatabase();

    // Trova l'utente
    const user = await db.collection("users").findOne({ username });

    if (!user || !user.servers || user.servers.length === 0) return [];

    // Trova tutti i server usando gli ID salvati nell'utente
    const servers = await db
      .collection("servers")
      .find({ _id: { $in: user.servers.map((id) => new ObjectId(id)) } })
      .toArray();

    return servers;
  });

  // ipcMain.on("server:select", (_event, server) => {
  //   win.webContents.send("server:selected", server);
  // });
}

module.exports = setupServerHandlers;
