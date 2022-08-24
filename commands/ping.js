const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('ping')
        .setDescription('Pong! Discord API response time.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const delay = await Math.abs(Date.now() - interaction.createdTimestamp);
        interaction.reply(`:ping_pong: Pong! Latency is **${delay}ms**. API Latency is **${Math.round(client.ws.ping)}ms**`);
    },
};