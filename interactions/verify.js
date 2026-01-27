module.exports = {
    name: 'verify',

    async execute(interaction) {
        const ROLE_ID = 'MET_L_ID_DU_ROLE_ICI'; // Remplace par l'ID réel du rôle

        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (!member) {
            return interaction.reply({
                content: '❌ Erreur : membre introuvable',
                ephemeral: true
            });
        }

        if (member.roles.cache.has(ROLE_ID)) {
            return interaction.reply({
                content: '⚠️ Tu es déjà vérifié.',
                ephemeral: true
            });
        }

        await member.roles.add(ROLE_ID);

        await interaction.reply({
            content: '✅ Vérification réussie ! Bienvenue 🎉',
            ephemeral: true
        });
    }
};
