import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
// Update the path here to point to your new file
import { searchSong } from "../utils/iTunes.js"; 

export const data = new SlashCommandBuilder()
  .setName("song")
  .setDescription("Get info about a song")
  .addStringOption(opt =>
    opt.setName("title").setDescription("Song title").setRequired(true)
  );

export async function execute(interaction) {
  const title = interaction.options.getString("title");
  await interaction.deferReply();

  const song = await searchSong(title);
  
  if (!song) {
    return interaction.editReply("Song not found.");
  }

  // Convert milliseconds to a clean MM:SS string
  const durationMs = song.trackTimeMillis ?? 0;
  const duration = `${Math.floor(durationMs / 60000)}:${String(Math.floor((durationMs % 60000) / 1000)).padStart(2, "0")}`;

  // Grab just the YYYY-MM-DD from the full timestamp
  const releaseDate = song.releaseDate ? song.releaseDate.split("T")[0] : "Unknown";

  const embed = new EmbedBuilder()
    .setTitle(song.trackName)
    .setURL(song.trackViewUrl) // Turns title into a hyperlink to the track
    .setColor(0xff9800)
    .setThumbnail(song.artworkUrl100) // Drops the official album art into the embed
    .addFields(
      { name: "Artist",         value: song.artistName ?? "Unknown", inline: true },
      { name: "Duration",       value: duration,                     inline: true },
      { name: "First Released", value: releaseDate,                  inline: true },
      { name: "Appears On",     value: song.collectionName ?? "N/A" }
    )
    .setFooter({ text: "Source: iTunes / Apple Music" });

  interaction.editReply({ embeds: [embed] });
}
