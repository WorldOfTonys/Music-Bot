import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { searchSong } from "../utils/musicbrainz.js";

export const data = new SlashCommandBuilder()
  .setName("song")
  .setDescription("Get info about a song")
  .addStringOption(opt =>
    opt.setName("title").setDescription("Song title").setRequired(true)
  );

export async function execute(interaction) {
  const title = interaction.options.getString("title");
  await interaction.deferReply();

  const results = await searchSong(title);
  if (!results || (Array.isArray(results) && results.length === 0)) {
    return interaction.editReply("Song not found.");
  }

  // If searchSong returns an array, pick the most popular one based on release count.
  // If it's already a single object, fall back to it.
  const song = Array.isArray(results)
    ? results.sort((a, b) => (b.releases?.length || 0) - (a.releases?.length || 0))[0]
    : results;

  const artist   = song["artist-credit"]?.[0]?.artist?.name ?? "Unknown";
  const releases = song.releases?.map(r => r.title).slice(0, 3).join(", ") || "N/A";
  const duration = song.length
    ? `${Math.floor(song.length / 60000)}:${String(Math.floor((song.length % 60000) / 1000)).padStart(2, "0")}`
    : "Unknown";

  const embed = new EmbedBuilder()
    .setTitle(song.title)
    .setColor(0xff9800)
    .addFields(
      { name: "Artist",         value: artist,   inline: true },
      { name: "Duration",       value: duration, inline: true },
      { name: "First Released", value: song["first-release-date"] ?? "Unknown", inline: true },
      { name: "Appears On",     value: releases }
    )
    .setFooter({ text: "Source: MusicBrainz" });

  interaction.editReply({ embeds: [embed] });
}
