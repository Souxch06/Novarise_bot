const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'menuMiniJeux',

    async show(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('menuMiniJeux_select')
                .setPlaceholder('Choisis un mini-jeu')
                .addOptions([
                    {
                        label: '🎯 Morpion',
                        value: 'morpion'
                    }
                ])
        );

        await interaction.reply({
            content: '🎮 Sélectionne un mini-jeu',
            components: [row],
            ephemeral: true
        });
    },

    async execute(interaction, client) {
        if (interaction.values[0] === 'morpion') {
            const morpion = client.interactions.get('morpion');
            await morpion.chooseMode(interaction);
        }
    }
};
