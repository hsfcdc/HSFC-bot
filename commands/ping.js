const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong! Discord API response time.'),
    async execute(interaction) {
        const delay = Math.abs(Date.now() - interaction.createdTimestamp);
        await interaction.reply(`:ping_pong: Pong! Latency is **${delay}ms**. API Latency is **${Math.round(client.ws.ping)}ms**`);
    },
};