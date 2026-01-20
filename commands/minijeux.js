const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder } = require("discord.js");
const { startMorpion, startDuel, startReaction } = require("../games/gameLauncher");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("minijeux")
        .setDescription("Lancer un mini-jeu"),

    async execute(interaction) {

        const menu = new StringSelectMenuBuilder()
            .setCustomId("select_minijeu")
            .setPlaceholder("Choisis ton mini-jeu")
            .addOptions([
                { label: "Morpion", value: "morpion", description: "Joue au Morpion" },
                { label: "Duel", value: "duel", description: "Joue au Duel" },
                { label: "Réaction rapide", value: "reaction", description: "Teste ta rapidité" }
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({ content: "🎮 Choisis un mini-jeu :", components: [row], ephemeral: true });
    }
};
