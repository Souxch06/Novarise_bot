require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

/* Charger commandes */
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
}

client.on("interactionCreate", async interaction => {

    // Slash command
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;
        try { await command.execute(interaction); } 
        catch(err) { console.error(err); if (!interaction.replied) interaction.reply({ content: "❌ Erreur", ephemeral: true }); }
    }

    // Menu déroulant
    if (interaction.isStringSelectMenu()) {
        if (interaction.customId === "select_minijeu") {
            const value = interaction.values[0];
            if (value === "morpion") return require("./games/gameLauncher").startMorpion(interaction);
            if (value === "duel") return require("./games/gameLauncher").startDuel(interaction);
            if (value === "reaction") return require("./games/gameLauncher").startReaction(interaction);
        }
    }

    // Les boutons et modals sont gérés dans gameLauncher
});

client.once("ready", () => console.log(`✅ Connecté en tant que ${client.user.tag}`));

client.login(process.env.TOKEN);
