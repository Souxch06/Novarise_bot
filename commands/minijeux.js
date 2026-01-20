const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder 
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("minijeux")
    .setDescription("Ouvre le panel des mini-jeux"),

  async execute(interaction) {

    const menu = new StringSelectMenuBuilder()
      .setCustomId("minijeux_select_game")
      .setPlaceholder("Sélectionne un mini-jeu")
      .addOptions([
        { label: "Morpion", value: "morpion" },
        { label: "Duel", value: "duel" },
        // tu peux ajouter d'autres mini-jeux ici
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({
      content: "🎮 **Choisis un mini-jeu pour commencer :**",
      components: [row],
      ephemeral: true
    });
  }
};
