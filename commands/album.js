import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { searchAlbum } from "../utils/iTunes.js"; // Make sure it's not iTubes! 😉

export const data = new SlashCommandBuilder()
  .setName("album")
  .setDescription("Get info about an album")
  .addStringOption(opt =>
    opt.setName("title").setDescription("Album title").setRequired(true)
  );

export async function execute(interaction) {
  const title = interaction.options.getString("title");
  await interaction.deferReply();

  const album = await searchAlbum(title);
  
  if (!album) {
    return interaction.editReply("Album not found.");
  }

  // Clean up the release year
  const releaseYear = album.releaseDate ? album.releaseDate.split("-")[0] : "Unknown";

  const embed = new EmbedBuilder()
    .setTitle(album.collectionName)
    .setURL(album.collectionViewUrl) // Links directly to the album on Apple Music
    .setColor(0xff9800)
    .setThumbnail(album.artworkUrl100) // Pulls the official high-quality album art
    .addFields(
      { name: "Artist",       value: album.artistName ?? "Unknown", inline: true },
      { name: "Tracks",       value: String(album.trackCount ?? "Unknown"), inline: true },
      { name: "Released",     value: releaseYear, inline: true },
      { name: "Genre",        value: album.primaryGenreName ?? "N/A", inline: true },
      { name: "Copyright",    value: album.copyright ?? "N/A" }
    )
    .setFooter({ text: "Source: iTunes / Apple Music" });

  interaction.editReply({ embeds: [embed] });
}
