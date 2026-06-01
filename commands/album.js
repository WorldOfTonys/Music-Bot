import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { searchAlbum } from "../utils/musicbrainz.js";

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
  if (!album) return interaction.editReply("Album not found.");

  const artist = album["artist-credit"]?.[0]?.artist?.name ?? "Unknown";

  const embed = new EmbedBuilder()
    .setTitle(album.title)
    .setColor(0xe91e63)
    .addFields(
      { name: "Artist",   value: artist, inline: true },
      { name: "Released", value: album["first-release-date"] ?? "Unknown", inline: true },
      { name: "Type",     value: album["primary-type"] ?? "Unknown", inline: true }
    )
    .setFooter({ text: "Source: MusicBrainz" });

  interaction.editReply({ embeds: [embed] });
}
