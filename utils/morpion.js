const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const games = new Map();

function renderBoard(board, disabled = false) {
  const rows = [];

  for (let y = 0; y < 3; y++) {
    const row = new ActionRowBuilder();
    for (let x = 0; x < 3; x++) {
      const i = y * 3 + x;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`morpion_${i}`)
          .setLabel(board[i] || " ")
          .setStyle(
            board[i] === "❌"
              ? ButtonStyle.Danger
              : board[i] === "⭕"
              ? ButtonStyle.Success
              : ButtonStyle.Secondary
          )
          .setDisabled(disabled || board[i] !== null)
      );
    }
    rows.push(row);
  }
  return rows;
}

function checkWin(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(v => v)) return "draw";
  return null;
}

function startMorpion(interaction, p1, p2) {
  const board = Array(9).fill(null);

  games.set(interaction.channel.id, {
    board,
    players: [p1.id, p2.id],
    symbols: {
      [p1.id]: "❌",
      [p2.id]: "⭕"
    },
    turn: p1.id
  });

  interaction.channel.send({
    content:
`🎮 **MORPION**
❌ **${p1.username}**
⭕ **${p2.username}**

🎯 **Tour de : ${p1.username} (❌)**`,
    components: renderBoard(board)
  });
}

module.exports = {
  games,
  renderBoard,
  checkWin,
  startMorpion
};
