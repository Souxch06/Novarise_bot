const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('minijeux')
        .setDescription('Ouvre le menu des mini-jeux'),

    async execute(interaction, client) {
        const menu = client.interactions.get('menuMiniJeux');
        await menu.show(interaction);
    }
};
