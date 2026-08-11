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

const REACTIONS = {
  exclamation: ["Hey, don't you shout like that!"],
  question:    ["I don't like questions"],
  other:       ["Sure, whatevs"],
};

function pickReaction(content) {
  const trimmed = content.trim();
  const lastChar = trimmed.charAt(trimmed.length - 1);
  const pool =
    lastChar === "!" ? REACTIONS.exclamation :
    lastChar === "?" ? REACTIONS.question :
    REACTIONS.other;
  return pool[Math.floor(Math.random() * pool.length)];
}

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.mentions.has(client.user)) return;

  const emoji = pickReaction(message.content);
  try {
    await message.react(emoji);
  } catch (err) {
    console.error("Failed to react:", err);
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
