import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import * as artist from "./commands/artist.js";
import * as album  from "./commands/album.js";
import * as song   from "./commands/song.js";
import http from "http";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});
const commands = new Collection();

for (const cmd of [artist, album, song]) {
  commands.set(cmd.data.name, cmd);
}

const REPLIES = {
  exclamation: ["Hey, don't you shout like that!", "Whoa, chill out!", "No need to yell!"],
  question:    ["I don't like questions.", "Ask someone else.", "Hmm, good question... nah."],
  other:       ["Sure, whatevs.", "Cool story.", "Noted."],
};

function pickReply(content) {
  const trimmed = content.trim();
  const lastChar = trimmed.charAt(trimmed.length - 1);
  const pool =
    lastChar === "!" ? REPLIES.exclamation :
    lastChar === "?" ? REPLIES.question :
    REPLIES.other;
  return pool[Math.floor(Math.random() * pool.length)];
}

const REPLY_CHANNEL_ID = "1536832067290275910";

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (message.channel.id !== REPLY_CHANNEL_ID) return;
  if (!message.mentions.has(client.user)) return;

  const text = pickReply(message.content);
  try {
    await message.reply(text);
  } catch (err) {
    console.error("Failed to reply:", err);
  }
});

// Deploy slash commands to your test server
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: [artist.data, album.data, song.data].map(c => c.toJSON()) }
);
console.log("✅ Slash commands registered.");

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = commands.get(interaction.commandName);
  if (cmd) await cmd.execute(interaction);
});

client.once("ready", () => console.log(`🎵 Logged in as ${client.user.tag}`));
client.login(process.env.DISCORD_TOKEN);

http.createServer((_, res) => res.end("Bot is running!")).listen(process.env.PORT || 3000);

const counting = require('./counting.js');

client.on('messageCreate', async (message) => {
  await counting.handleMessage(message);
});
