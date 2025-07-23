const { ipcMain } = require("electron");
const { connectToDatabase } = require("../mongo");
const bcrypt = require("bcrypt");

function setupUserHandlers(win) {
  ipcMain.handle("user:getAll", async () => {
    const db = await connectToDatabase();
    const users = await db.collection("users").find().toArray();
    return users;
  });

  ipcMain.handle("user:login", async (_event, username, password) => {
    const db = await connectToDatabase();

    // Cerca l'utente con quel nome
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return { success: false, error: "Utente non trovato" };
    }

    // Confronta la password con l'hash salvato
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return { success: false, error: "Password errata" };
    }

    // Login riuscito
    return {
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        servers: user.servers,
      },
    };
  });
}

module.exports = setupUserHandlers;
