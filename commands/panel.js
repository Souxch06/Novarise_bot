const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Créer le panel d’accès au serveur'),
    async execute(interaction){
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild))
            return interaction.reply({ content:"❌ Permission refusée.", ephemeral:true });

        const embed = new EmbedBuilder()
            .setTitle("🔓 Accès au serveur")
            .setDescription("Clique sur **ACCÉDER AU SERVEUR** puis entre ton pseudo Clash of Clans.")
            .setColor(0x2ecc71);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('acces_serveur').setLabel('ACCÉDER AU SERVEUR').setStyle(ButtonStyle.Success)
        );

        await interaction.reply({ embeds:[embed], components:[row] });
    }
};
