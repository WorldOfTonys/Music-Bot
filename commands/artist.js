import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { searchArtist } from "../utils/musicbrainz.js";

export const data = new SlashCommandBuilder()
  .setName("artist")
  .setDescription("Get info about an artist")
  .addStringOption(opt =>
    opt.setName("name").setDescription("Artist name").setRequired(true)
  );

export async function execute(interaction) {
  const name = interaction.options.getString("name");
  await interaction.deferReply();

  const artist = await searchArtist(name);
  if (!artist) return interaction.editReply("Artist not found.");

  const lifeSpan = artist["life-span"];
  const active = lifeSpan?.ended
    ? `${lifeSpan.begin ?? "?"} – ${lifeSpan.end ?? "?"}`
    : `${lifeSpan?.begin ?? "?"} – present`;

  const embed = new EmbedBuilder()
    .setTitle(artist.name)
    .setColor(0x1db954)
    .addFields(
      { name: "Type",    value: artist.type ?? "Unknown", inline: true },
      { name: "Country", value: artist.country ?? "Unknown", inline: true },
      { name: "Active",  value: active, inline: true },
      { name: "Genres",  value: artist.tags?.map(t => t.name).join(", ") || "N/A" }
    )
    .setFooter({ text: "Source: MusicBrainz" });

  interaction.editReply({ embeds: [embed] });
}
