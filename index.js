const fs = require('fs');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// Collections pour commandes et interactions
client.commands = new Collection();
client.interactions = new Collection();

/* ===== CHARGER LES COMMANDES ===== */
const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

/* ===== CHARGER LES INTERACTIONS ===== */
const interactionFiles = fs.readdirSync('./interactions').filter(f => f.endsWith('.js'));
for (const file of interactionFiles) {
    const interaction = require(`./interactions/${file}`);
    client.interactions.set(interaction.name, interaction);
}

/* ===== DEPLOY COMMANDES AUTOMATIQUE ===== */
async function deployCommands() {
    const commands = client.commands.map(cmd => cmd.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        console.log('🗑️ Suppression de toutes les commandes existantes...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: [] }
        );

        console.log(`🔄 Déploiement des ${commands.length} commandes...`);
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('✅ Commandes déployées automatiquement !');
    } catch (err) {
        console.error(err);
    }
}

/* ===== READY EVENT ===== */
client.once('ready', async () => {
    console.log(`✅ Connecté en tant que ${client.user.tag}`);

    // Déployer les commandes au démarrage
    await deployCommands();
});

/* ===== INTERACTION HANDLER ===== */
client.on('interactionCreate', async interaction => {
    // Slash commands
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction, client); } 
        catch (err) { console.error(err); }
    }

    // Buttons & menus
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        const key = interaction.customId.split('_')[0];
        const handler = client.interactions.get(key);
        if (!handler) return;
        try { await handler.execute(interaction, client); } 
        catch (err) { console.error(err); }
    }
});

/* ===== LOGIN ===== */
client.login(process.env.TOKEN);
