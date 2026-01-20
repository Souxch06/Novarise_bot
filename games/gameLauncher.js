const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

/* ===== MORPION ===== */
const morpionGames = new Map();

function renderBoard(board) {
    return board.map((v,i)=>
        new ButtonBuilder()
            .setCustomId(`morpion_${i}`)
            .setLabel(v || "➖")
            .setStyle(
                v === "❌" ? ButtonStyle.Danger :
                v === "⭕" ? ButtonStyle.Primary :
                ButtonStyle.Secondary
            )
            .setDisabled(v !== null)
    );
}

function checkWin(board) {
    const wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(p=>p.every(i=>board[i]));
}

// Lancer une partie Morpion PvP
async function startMorpion(interaction) {
    let players = [interaction.user];

    // Demande d’un deuxième joueur (via mention)
    await interaction.reply({ content: `${interaction.user}, mentionne ton adversaire pour jouer au Morpion.`, ephemeral: true });

    const filter = m => m.mentions.users.size > 0 && m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max:1, time:60000 });

    collector.on('collect', async m => {
        const opponent = m.mentions.users.first();
        if(opponent.bot) return interaction.followUp({ content: "❌ Tu ne peux pas jouer contre un bot ici.", ephemeral:true });
        players.push(opponent);

        const [player1, player2] = players;
        const symbols = { [player1.id]: "❌", [player2.id]: "⭕" };
        let turn = player1.id;
        const board = Array(9).fill(null);

        morpionGames.set(interaction.id, { board, turn, players, symbols });

        const getEmbed = () => new EmbedBuilder()
            .setTitle("❌⭕ Morpion PvP")
            .setDescription(
                `**${player1.username} (❌)** vs **${player2.username} (⭕)**\n` +
                `🌀 Tour de : **${turn === player1.id ? player1.username : player2.username}**`
            )
            .setColor(0x5865F2);

        const rows = [
            new ActionRowBuilder().addComponents(renderBoard(board).slice(0,3)),
            new ActionRowBuilder().addComponents(renderBoard(board).slice(3,6)),
            new ActionRowBuilder().addComponents(renderBoard(board).slice(6,9))
        ];

        const msg = await interaction.followUp({ embeds:[getEmbed()], components:rows, fetchReply:true });

        const btnCollector = msg.createMessageComponentCollector({ time:10*60*1000 });

        btnCollector.on("collect", async btn => {
            const game = morpionGames.get(interaction.id);
            if(!game) return;
            const { board, turn, players, symbols } = game;
            if(btn.user.id !== turn) return btn.reply({ content:"⛔ Ce n'est pas ton tour !", ephemeral:true });

            const index = parseInt(btn.customId.split("_")[1]);
            if(board[index]) return;

            board[index] = symbols[btn.user.id];

            // Vérifie victoire
            if(checkWin(board)){
                btnCollector.stop("win");
                return btn.update({ embeds:[getEmbed().setDescription(`🎉 **${btn.user.username} a gagné !**`)], components:[] });
            }
            // Vérifie égalité
            if(!board.includes(null)){
                btnCollector.stop("tie");
                return btn.update({ embeds:[getEmbed().setDescription("🤝 Match nul !")], components:[] });
            }

            // Change de tour
            game.turn = players.find(p=>p.id !== turn).id;

            const updatedRows = [
                new ActionRowBuilder().addComponents(renderBoard(board).slice(0,3)),
                new ActionRowBuilder().addComponents(renderBoard(board).slice(3,6)),
                new ActionRowBuilder().addComponents(renderBoard(board).slice(6,9))
            ];

            await btn.update({ embeds:[getEmbed()], components: updatedRows });
        });

        btnCollector.on("end", ()=> morpionGames.delete(interaction.id));
    });

    collector.on('end', collected => {
        if(collected.size === 0){
            interaction.followUp({ content: "⏰ Temps écoulé, aucun adversaire trouvé.", ephemeral:true });
        }
    });
}

module.exports = { startMorpion };
