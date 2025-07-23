const { MongoClient } = require("mongodb");
const { ipcMain } = require('electron');

const uri = "mongodb+srv://dove:454-dove@cluster0.slsga.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "dove_app";

let client;
let db;

async function connectToDatabase() {
  if (db) return db; // usa connessione esistente

  client = new MongoClient(uri);

  try {
    await client.connect();
    db = client.db(dbName);
    console.log("✅ Connessione a MongoDB riuscita");
    return db;
  } catch (error) {
    console.error("❌ Errore connessione MongoDB:", error);
    throw error;
  }

}

module.exports = {
  connectToDatabase,
};
