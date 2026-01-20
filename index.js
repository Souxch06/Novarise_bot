require('dotenv').config();
const { 
  Client, GatewayIntentBits, ActionRowBuilder, StringSelectMenuBuilder, 
  ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle,
  InteractionType
} = require('discord.js');

const { TOKEN } = process.env;
const { games, renderBoard, checkWin } = require('./utils/morpion');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('clientReady', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {

  // ────────── /minijeux ──────────
  if (interaction.isChatInputCommand() && interaction.commandName === 'minijeux') {
    const menu = new StringSelectMenuBuilder()
      .setCustomId('minijeux_select_game')
      .setPlaceholder('Sélectionne un mini-jeu')
      .addOptions([
        { label: 'Morpion', value: 'morpion' },
        { label: 'Duel', value: 'duel' }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    return await interaction.reply({
      content: '🎮 **Choisis un mini-jeu pour commencer :**',
      components: [row],
      ephemeral: true
    });
  }

  // ────────── Menu déroulant des mini-jeux ──────────
  if (interaction.isStringSelectMenu()) {

    if (interaction.customId === 'minijeux_select_game') {
      const selected = interaction.values[0];

      if (selected === 'morpion') {
        const members = await interaction.guild.members.fetch();
        const options = members
          .filter(m => !m.user.bot && m.id !== interaction.user.id)
          .map(m => ({
            label: `${m.user.username}#${m.user.discriminator}`,
            value: m.id,
            description: `Clique pour défier ${m.user.username}`,
            emoji: "🎮"
          }))
          .slice(0, 25);

        const menuPlayers = new StringSelectMenuBuilder()
          .setCustomId('morpion_choose_player')
          .setPlaceholder('Sélectionne ton adversaire')
          .addOptions(options);

        const buttonSearch = new ButtonBuilder()
          .setCustomId('search_player')
          .setLabel('Rechercher un joueur')
          .setStyle(ButtonStyle.Primary);

        const rowMenu = new ActionRowBuilder().addComponents(menuPlayers);
        const rowButton = new ActionRowBuilder().addComponents(buttonSearch);

        return await interaction.update({
          content: '🎮 **Sélectionne ton adversaire ou recherche un joueur :**',
          components: [rowMenu, rowButton]
        });
      } else if (selected === 'duel') {
        return await interaction.update({
          content: '⚔️ Duel bientôt disponible !',
          components: []
        });
      } else {
        return await interaction.update({ content: '❌ Jeu inconnu.', components: [] });
      }
    }

    // Sélection d’un joueur dans le menu déroulant Morpion
    if (interaction.customId === 'morpion_choose_player') {
      const targetId = interaction.values[0];
      const target = await interaction.guild.members.fetch(targetId);

      await interaction.channel.send({
        content: `🎮 ${target} tu as été défié au Morpion par ❌ <@${interaction.user.id}> !`,
        embeds: [{
          title: "Défi Morpion !",
          description: `Par <@${interaction.user.id}>`,
          thumbnail: { url: target.user.displayAvatarURL({ dynamic: true }) },
          color: 0x00ff00
        }]
      });

      return await interaction.update({ content: '✅ Défi envoyé !', components: [] });
    }
  }

  // ────────── Bouton "Rechercher un joueur" ──────────
  if (interaction.isButton() && interaction.customId === 'search_player') {
    const modal = new ModalBuilder()
      .setCustomId('search_player_modal')
      .setTitle('Rechercher un joueur');

    const input = new TextInputBuilder()
      .setCustomId('player_name')
      .setLabel('Tape une partie du pseudo du joueur')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  // ────────── Modal pour chercher le joueur ──────────
  if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'search_player_modal') {
    const playerName = interaction.fields.getTextInputValue('player_name').toLowerCase();

    // Recherche partielle dans les membres du serveur
    const target = interaction.guild.members.cache.find(m => 
      !m.user.bot && m.user.username.toLowerCase().includes(playerName)
    );

    if (!target) return interaction.reply({ content: '❌ Joueur introuvable.', ephemeral: true });

    await interaction.channel.send({
      content: `🎮 ${target} tu as été défié au Morpion par ❌ <@${interaction.user.id}> !`,
      embeds: [{
        title: "Défi Morpion !",
        description: `Par <@${interaction.user.id}>`,
        thumbnail: { url: target.user.displayAvatarURL({ dynamic: true }) },
        color: 0x00ff00
      }]
    });

    return interaction.reply({ content: '✅ Défi envoyé !', ephemeral: true });
  }

  // ────────── Gestion des tours Morpion ──────────
  if (interaction.isButton() && interaction.customId.startsWith('morpion_')) {
    const game = games.get(interaction.channel.id);
    if (!game) return;

    const index = parseInt(interaction.customId.split('_')[1]);
    const userId = interaction.user.id;

    if (!game.players.includes(userId))
      return await interaction.reply({ content: '❌ Tu ne joues pas dans cette partie.', ephemeral: true });

    if (game.turn !== userId)
      return await interaction.reply({ content: '⏳ Ce n’est pas ton tour.', ephemeral: true });

    if (game.board[index]) return;

    game.board[index] = game.symbols[userId];
    const result = checkWin(game.board);

    if (result) {
      games.delete(interaction.channel.id);
      if (result === 'draw') {
        return await interaction.update({
          content: '🤝 **Match nul !**',
          components: renderBoard(game.board, true)
        });
      }
      return await interaction.update({
        content: `🏆 **Victoire de ${interaction.user.username} (${result}) !**`,
        components: renderBoard(game.board, true)
      });
    }

    game.turn = game.players.find(id => id !== userId);
    const next = interaction.guild.members.cache.get(game.turn);

    await interaction.update({
      content:
`🎮 **MORPION**
❌ <@${game.players[0]}>
⭕ <@${game.players[1]}>

🎯 **Tour de : ${next.user.username} (${game.symbols[game.turn]})**`,
      components: renderBoard(game.board)
    });
  }
});

client.login(TOKEN);
