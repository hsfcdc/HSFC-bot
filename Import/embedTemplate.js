const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
module.exports.templateEmbedResponse = new EmbedBuilder()
    .setTimestamp()
    .setFooter({ text: embedFooterText, iconURL: botLogo });