require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = [];

// Parcours le dossier commands et ajoute toutes les commandes
const commandFiles = fs.readdirSync(path.join(__dirname, "commands")).filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("⏳ Déploiement des commandes...");
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
        console.log("✅ Toutes les commandes ont été déployées !");
    } catch (err) {
        console.error(err);
    }
})();
