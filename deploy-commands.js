const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

// Charger toutes les commandes
const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('🗑️ Suppression de toutes les commandes existantes sur le serveur...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] } // vide le serveur pour supprimer les doublons
        );

        console.log(`🔄 Déploiement des ${commands.length} commandes sur le serveur...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands } // ajoute seulement tes commandes actuelles
        );

        console.log('✅ Commandes déployées avec succès !');
    } catch (error) {
        console.error(error);
    }
})();
