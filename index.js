import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes, Collection } from "discord.js";
import * as artist from "./commands/artist.js";
import * as album  from "./commands/album.js";
import * as song   from "./commands/song.js";
import { handleMessage as handleCounting } from "./counting.js";
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
  exclamation: [
    "Hey, don't you shout like that!", 
    "Whoa, chill out!", 
    "No need to yell!", 
    "Too loud!", 
    "Exclamation marks scare me...", 
    "Quack!", 
    "Too loud!!! Punishment... FEED ME!!!", 
    "IF YOU CONTINUE SHOUTING, YOU DON'T WANNA KNOW WHAT'LL HAPPEN!!!",
    "why are you shouting at me? :(",
    "IF YOU SHOUT LIKE THAT, I'LL JUST SHOUT BACK AT YOU!!!",
    "Turn down the volume, you're ruining my headbanging frequency!",
    "Are you trying to out-scream a vocal track? Because you're failing.",
    "Breathe into a paper bag. You're hyperventilating.",
    "Save the screamo for the stage, darling.",
    "My feathers are vibrating and NOT in a cool bass-drop way.",
    "Are you typing with your webbed feet or just mashing keys?",
    "Caps lock isn't a personality trait!",
    "Is this an intervention? Because I'm not listening.",
    "MY EARDRUMS ARE AT THE BOTTOM OF THE POND NOW. HAPPY?",
    "You got loud real quick for someone within pecking distance.",
    "Lower your gain, you're clipping!",
    "Are you trying to wake up the entire venue?!",
    "Who gave you a microphone?!",
    "Keep screaming like that and I'm charging admission.",
    "I'm a duck, not a stadium PA system!",
    "CALM DOWN BEFORE I MOLT ALL OVER YOUR KEYBOARD!",
    "You're blowing out my speakers!",
    "Noise complaint filed. Expect a bill in the mail."
  ],
  question: [
    "I don't like questions.", 
    "Ask someone else.", 
    "Hmm, good question... nah.", 
    "Quack?", 
    "Well... sure, whatevs", 
    "Oki", 
    "NEIN!!!", 
    "Hmmm... how about... no?", 
    "YES, ABSOLUTELY", 
    "Feed me, then I'll answer", 
    "Yes, of course", 
    "Yup", 
    "The devil on my shoulder says yes, but the little angel on my other shoulder says no.", 
    "Heheh... >:)", 
    "Nope", 
    "Why would I say no?",
    "I would never say yes to that question",
    "All of my feathers tell me to say no",
    "Does it look like I have an index for that?",
    "Bold of you to assume I care.",
    "Consult the pit, I'm off the clock.",
    "Only if it comes with a guitar solo.",
    "Google is free, you know.",
    "I could answer, but then I'd have to drop the beat on you.",
    "My legal team advises me not to answer that.",
    "Ask me again after I finish this riff.",
    "Is that your final answer, or are you just testing my patience?",
    "My bill is sealed. No comment.",
    "Are you gonna hand over some breadcrumbs or just keep interrogating me?",
    "Error 404: Duck gives zero quacks.",
    "That sounds like a 'you' problem, bestie.",
    "Would a sick guitar riff solve this? Because that's all I've got.",
    "Do I look like a fortune teller in a leather jacket?",
    "Is this a pop quiz? Because I didn't study.",
    "I'll answer if you guess my favourite drop-tuning.",
    "The answer is hidden somewhere in a 10-minute bass solo."
  ],
  other: [
    "Sure, whatevs.", 
    "Cool story.", 
    "Noted.", 
    "Quack.", 
    "Heh?", 
    "Feed me please...", 
    "Oh, hello", 
    "WAAAAH!!! WHO ARE YOU!?", 
    "I would never ever swim in the sea. Ponds are much safer :)", 
    "Hi there", 
    "QUACK QUACK QUACK", 
    "I am a duck", 
    "You're silly",
    "I'm a silly little duck",
    "What's that you're saying?",
    "Could you repeat that please?",
    "LALALA, I'm not listening",
    "I need some nom nom food",
    "My mom told me I shouldn't talk to strangers...",
    "I've heard heavier breakdowns in a pop song.",
    "Fascinating. Tell it to the amp.",
    "You're lucky I'm cute, or I'd peck your cables.",
    "More bass, less talking.",
    "That's a hot take. Too bad I didn't ask.",
    "Side-eyeing you from the pond.",
    "I'm pretend-listening right now.",
    "BRB, adjusting my duck-sized leather jacket.",
    "That message had zero distortion. Unimpressed.",
    "I'm ignoring you to tune my guitar.",
    "You talk a lot for someone who doesn't even headbang.",
    "Waddles away judgmentally...",
    "Wake me up when the chorus hits.",
    "I'm too punk rock to process whatever you just said.",
    "Are you gonna offer me snacks or just stare?",
    "I only respond to heavy distortion and high-value treats.",
    "Cool opinion, put it in a song and see if it charts."
  ],
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

// Unified message event listener
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  // Handle counting system
  await handleCounting(message);

  // Handle duck mention replies
  if (message.channel.id === REPLY_CHANNEL_ID && message.mentions.has(client.user)) {
    const text = pickReply(message.content);
    try {
      await message.reply(text);
    } catch (err) {
      console.error("Failed to reply:", err);
    }
  }
});

// Deploy slash commands to your test server
const rest = new REST().setToken(process.env.DISCORD_TOKEN);
await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: [artist.data, album.data, song.data].map(c => c.toJSON()) }
);
console.log("✅ Slash commands registered.");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const cmd = commands.get(interaction.commandName);
  if (cmd) await cmd.execute(interaction);
});

client.once("ready", () => console.log(`🎵 Logged in as ${client.user.tag}`));
client.login(process.env.DISCORD_TOKEN);

http.createServer((_, res) => res.end("Bot is running!")).listen(process.env.PORT || 3000);
