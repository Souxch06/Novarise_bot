const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Afficher le panel de vérification'),

    async execute(interaction) {
        const button = new ButtonBuilder()
            .setCustomId('verify_button')
            .setLabel('✅ Se vérifier')
            .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({
            content: '🔐 Clique sur le bouton pour te vérifier',
            components: [row]
        });
    }
};
