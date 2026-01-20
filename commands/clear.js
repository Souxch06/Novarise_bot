const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Supprime un certain nombre de messages")
        .addIntegerOption(option =>
            option.setName("nombre")
                .setDescription("Nombre de messages à supprimer")
                .setRequired(true)
        ),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages))
            return interaction.reply({ content: "❌ Vous n'avez pas la permission.", flags: 64 });

        const amount = interaction.options.getInteger("nombre");
        if (amount < 1 || amount > 100)
            return interaction.reply({ content: "❌ Choisissez entre 1 et 100.", flags: 64 });

        await interaction.deferReply({ ephemeral: true });

        const deleted = await interaction.channel.bulkDelete(amount, true).catch(() => null);
        if (!deleted) return interaction.editReply({ content: "❌ Impossible de supprimer les messages." });

        await interaction.editReply({ content: `✅ ${deleted.size} message(s) supprimé(s)` });
    }
};
