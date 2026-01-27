const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Supprime des messages')
        .addIntegerOption(o =>
            o.setName('nombre')
                .setDescription('Nombre de messages')
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: '❌ Permission refusée', ephemeral: true });
        }

        const n = interaction.options.getInteger('nombre');
        const deleted = await interaction.channel.bulkDelete(n, true);
        await interaction.reply({ content: `🧹 ${deleted.size} messages supprimés`, ephemeral: true });
    }
};
