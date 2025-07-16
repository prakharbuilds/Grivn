const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('file') 
    .setDescription('View a member\'s moderation history.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The member whose file you want to check')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const member = interaction.options.getUser('user');

    if (!member) {
      return interaction.reply({ content: '❌ Could not find that user.', flags: 64 });
    }

    const history = await db.get(`infractions_${member.id}`) || [];

    if (history.length === 0) {
      return interaction.reply({ content: `✅ ${member.tag} has no recorded infractions.`, flags: 64 });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📋 Case File for ${member.tag}`)
      .setColor(0x0099ff)
      .setTimestamp();

    history.slice(-10).forEach((entry, index) => {
      embed.addFields({
        name: `${entry.type} #${index + 1}`,
        value: `**Reason:** ${entry.reason}\n**By:** ${entry.moderator}\n**Date:** <t:${Math.floor(new Date(entry.timestamp).getTime() / 1000)}:f>`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed], flags: 64 });
  }
};
