const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong! Discord API response time.'),
    async execute(interaction) {
        await interaction.reply('Pong!');
    },
};