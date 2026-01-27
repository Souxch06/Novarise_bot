const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');

const games = new Map();

/* ===== OUTILS ===== */
function renderBoard(board) {
    return board.map(v => v ?? '⬜').join('');
}

function checkWin(board, s) {
    const win = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
    ];
    return win.some(c => c.every(i => board[i] === s));
}

function botMove(board) {
    const free = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
    return free[Math.floor(Math.random()*free.length)];
}

function createGrid(board) {
    const rows = [];
    for (let r = 0; r < 3; r++) {
        const row = new ActionRowBuilder();
        for (let c = 0; c < 3; c++) {
            const i = r * 3 + c;
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`morpion_cell_${i}`)
                    .setLabel(board[i] ?? ' ')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(board[i] !== null)
            );
        }
        rows.push(row);
    }
    return rows;
}

/* ===== SAFE REPLY ===== */
async function respond(interaction, payload) {
    if (interaction.replied || interaction.deferred) {
        return interaction.editReply(payload);
    }
    return interaction.reply(payload);
}

module.exports = {
    name: 'morpion',

    async chooseMode(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('morpion_bot')
                .setLabel('🤖 Contre le bot')
                .setStyle(ButtonStyle.Primary)
        );

        await respond(interaction, {
            content: '❌⭕ **Morpion** — Choisis un mode',
            components: [row],
            ephemeral: true
        });
    },

    async startBot(interaction) {
        games.set(interaction.user.id, {
            board: Array(9).fill(null),
            turn: 'player'
        });

        const embed = new EmbedBuilder()
            .setTitle('❌⭕ Morpion — Contre le bot')
            .setDescription(
                `❌ : <@${interaction.user.id}>\n` +
                `⭕ : Bot\n\n` +
                `${renderBoard(Array(9).fill(null))}\n\n` +
                `➡️ **À ton tour**`
            )
            .setColor(0xf1c40f);

        await respond(interaction, {
            embeds: [embed],
            components: createGrid(Array(9).fill(null))
        });
    },

    async execute(interaction) {
        const id = interaction.customId;

        if (id === 'morpion_bot') return this.startBot(interaction);

        if (!id.startsWith('morpion_cell_')) return;

        const index = Number(id.split('_').pop());
        const game = games.get(interaction.user.id);
        if (!game || game.turn !== 'player') return;

        game.board[index] = '❌';

        if (checkWin(game.board, '❌')) {
            games.delete(interaction.user.id);
            return interaction.update({
                content: '🎉 **Tu as gagné !**',
                components: []
            });
        }

        if (!game.board.includes(null)) {
            games.delete(interaction.user.id);
            return interaction.update({
                content: '🤝 **Match nul !**',
                components: []
            });
        }

        const botIndex = botMove(game.board);
        game.board[botIndex] = '⭕';

        if (checkWin(game.board, '⭕')) {
            games.delete(interaction.user.id);
            return interaction.update({
                content: '😵 **Le bot a gagné !**',
                components: []
            });
        }

        interaction.update({
            embeds: [
                new EmbedBuilder()
                    .setTitle('❌⭕ Morpion — Contre le bot')
                    .setDescription(
                        `❌ : <@${interaction.user.id}>\n` +
                        `⭕ : Bot\n\n` +
                        `${renderBoard(game.board)}\n\n` +
                        `➡️ **À ton tour**`
                    )
                    .setColor(0xf1c40f)
            ],
            components: createGrid(game.board)
        });
    }
};
