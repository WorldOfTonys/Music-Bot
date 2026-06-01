# 🎵 Music Discord Bot

A Discord bot that looks up artist, album, and song info using the free MusicBrainz API.

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Configure environment**
   - Copy `.env.example` to `.env`
   - Fill in your values:
     - `DISCORD_TOKEN` — from the Discord Developer Portal (Bot section)
     - `CLIENT_ID` — your app's Application ID
     - `GUILD_ID` — your server's ID (for testing; slash commands register instantly on a single guild)

3. **Update User-Agent** in `utils/musicbrainz.js`
   - Replace `your@email.com` with your actual contact email (MusicBrainz requirement)

4. **Run the bot**
   ```
   npm start
   ```

## Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/artist` | Info about an artist (active years, country, genre) | `/artist name:Radiohead` |
| `/album`  | Info about an album (release date, type) | `/album title:OK Computer` |
| `/song`   | Info about a song (duration, release date, artist) | `/song title:Creep` |

## Requirements

- Node.js 18+
- A Discord bot token ([discord.com/developers](https://discord.com/developers/applications))
