import express from "express";
import * as dotenv from "dotenv";
import * as path from "path";
import { Client } from "discord.js";
import { initializeApp, cert } from "firebase-admin/app";
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";

const app = express();
app.listen(process.env.PORT || 3000);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const serviceAccount = require(path.join(
  __dirname,
  "..",
  "firebase-credentials.json"
));
initializeApp({
  credential: cert(serviceAccount),
});

const client = new Client({
  intents: [],
});

ready(client);
interactionCreate(client);

client.login(process.env.DISCORD_TOKEN);
