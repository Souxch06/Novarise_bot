const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require("discord.js");

/* ===============================
   🎮 MORPION — SYSTEME PROPRE
================================ */

async function startMorpion(interaction, opponent = null) {

    const player1 = interaction.user;
    const player2 = opponent ?? interaction.client.user;
    const isBotGame = player2.bot;

    let board = Array(9).fill(null);
    let currentPlayer = player1;

    const symbols = {
        [player1.id]: "❌",
        [player2.id]: "⭕"
    };

    /* ========= OUTILS ========= */

    function createEmbed(message) {
        return new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle("🎮 Morpion")
            .setDescription(message)
            .setFooter({
                text: "Clique sur une case pour jouer"
            });
    }

    function getStatusMessage() {
        return (
            `❌ **${player1.username}** vs ⭕ **${player2.username}**\n\n` +
            `👉 Tour actuel : **${currentPlayer.username}** (${symbols[currentPlayer.id]})`
        );
    }

    function createBoard() {
        const buttons = board.map((cell, index) =>
            new ButtonBuilder()
                .setCustomId(`morpion_${index}`)
                .setLabel(cell ?? " ")
                .setStyle(
                    cell === "❌"
                        ? ButtonStyle.Danger
                        : cell === "⭕"
                        ? ButtonStyle.Primary
                        : ButtonStyle.Secondary
                )
                .setDisabled(cell !== null)
        );

        return [
            new ActionRowBuilder().addComponents(buttons.slice(0, 3)),
            new ActionRowBuilder().addComponents(buttons.slice(3, 6)),
            new ActionRowBuilder().addComponents(buttons.slice(6, 9))
        ];
    }

    function checkWin(symbol) {
        const wins = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        return wins.some(combo =>
            combo.every(i => board[i] === symbol)
        );
    }

    /* ========= MESSAGE INITIAL ========= */

    const message = await interaction.reply({
        embeds: [createEmbed(getStatusMessage())],
        components: createBoard(),
        fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
        time: 10 * 60 * 1000
    });

    /* ========= INTERACTIONS ========= */

    collector.on("collect", async i => {

        /* Mauvais joueur */
        if (i.user.id !== currentPlayer.id) {
            return i.reply({
                content: "⛔ Ce n’est pas ton tour.",
                ephemeral: true
            });
        }

        const index = Number(i.customId.split("_")[1]);

        if (board[index] !== null) {
            return i.reply({
                content: "⛔ Cette case est déjà prise.",
                ephemeral: true
            });
        }

        /* Placement */
        board[index] = symbols[currentPlayer.id];

        /* Victoire */
        if (checkWin(symbols[currentPlayer.id])) {
            collector.stop();
            return i.update({
                embeds: [
                    createEmbed(
                        `🏆 **Victoire !**\n\n` +
                        `🎉 **${currentPlayer.username}** a gagné la partie`
                    )
                ],
                components: []
            });
        }

        /* Egalité */
        if (!board.includes(null)) {
            collector.stop();
            return i.update({
                embeds: [
                    createEmbed("🤝 **Match nul !**\n\nAucun gagnant.")
                ],
                components: []
            });
        }

        /* Changement de tour */
        currentPlayer =
            currentPlayer.id === player1.id ? player2 : player1;

        await i.update({
            embeds: [createEmbed(getStatusMessage())],
            components: createBoard()
        });

        /* ========= TOUR DU BOT ========= */

        if (isBotGame && currentPlayer.bot) {
            setTimeout(async () => {

                const freeCases = board
                    .map((v, i) => v === null ? i : null)
                    .filter(v => v !== null);

                const choice =
                    freeCases[Math.floor(Math.random() * freeCases.length)];

                board[choice] = symbols[player2.id];

                if (checkWin(symbols[player2.id])) {
                    collector.stop();
                    return message.edit({
                        embeds: [
                            createEmbed(
                                `🤖 **Le bot a gagné !**\n\n` +
                                `Bonne chance pour la prochaine partie 😉`
                            )
                        ],
                        components: []
                    });
                }

                currentPlayer = player1;

                message.edit({
                    embeds: [createEmbed(getStatusMessage())],
                    components: createBoard()
                });

            }, 800);
        }
    });

    collector.on("end", () => {
        message.edit({
            components: []
        }).catch(() => {});
    });
}

/* ===============================
   📦 EXPORT
================================ */

module.exports = {
    startMorpion
};
