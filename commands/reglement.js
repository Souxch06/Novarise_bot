const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reglement')
        .setDescription('Afficher le règlement du serveur'),
    async execute(interaction){
        const embed = new EmbedBuilder()
            .setTitle("📜 Règlement du serveur NovaRise")
            .setDescription(`
**🤝 Respect**
• Respect obligatoire envers tous
• Aucun propos toxique ou discriminatoire

**👤 Pseudo**
• Pseudo Discord conforme à Clash of Clans
• Pseudo lisible et correct

**💬 Salons**
• Respect du thème des salons
• Pas de spam ni de publicité

**⚔️ Clan**
• Participation aux guerres si inscrit
• Respect des consignes d’attaque

**🚫 Interdictions**
• Triche, cheats, exploits
• Contenu NSFW ou illégal

**⚠️ Sanctions**
• Avertissement → Mute → Ban

🔔 *En restant sur le serveur, vous acceptez ce règlement.*
            `)
            .setColor(0xf1c40f);

        await interaction.reply({ embeds:[embed], ephemeral:false });
    }
};
