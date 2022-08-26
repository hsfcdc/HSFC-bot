const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const botLogo = 'https://i.imgur.com/vqyKOkZ.png';
const embedFooterText = 'Heartbotter2 - discord.gg/heartstopper';


module.exports.templateEmbedResponse = new EmbedBuilder()
    .setTimestamp()
    .setFooter({ text: embedFooterText, iconURL: botLogo });