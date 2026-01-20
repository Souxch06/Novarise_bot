const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getStats } = require('../utils/statsManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Voir tes statistiques de mini-jeux'),
    async execute(interaction){
        const stats = await getStats(interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle(`📊 Stats de ${interaction.user.username}`)
            .setDescription(`
• Morpion : ${stats.morpion.victoires} victoires
• Duel : ${stats.duel.victoires} victoires
• Réaction rapide : ${stats.reaction.victoires} victoires
• Meilleur temps Réaction rapide : ${stats.reaction.record}s
            `)
            .setColor(0x3498db);

        await interaction.reply({ embeds:[embed], ephemeral:true });
    }
};
