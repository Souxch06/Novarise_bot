const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reglement')
        .setDescription('Affiche le règlement'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('📜 Règlement')
            .setDescription(`
**🤝 Respect**
• Respect obligatoire envers tous
• Aucun propos toxique

**👤 Pseudo**
• Conforme à Clash of Clans

**💬 Salons**
• Pas de spam ni pub

**🚫 Interdictions**
• Triche, NSFW, illégal

**⚠️ Sanctions**
• Warn → Mute → Ban
`)
            .setColor(0x3498db);

        await interaction.reply({ embeds: [embed] });
    }
};
