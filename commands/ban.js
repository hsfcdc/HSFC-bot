const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const db = require("../Models/WarningDB.js")
const { banLog } = require('../Functions/logging.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('ban')
        .setDescription('Ban a member from the server.')
        .addUserOption(option =>
            option.setName('member')
            .setDescription('Member to be banned')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('Reason for ban')
            .setRequired(true))
        .addNumberOption(option =>
            option.setName('days')
            .setDescription('Days of messages to delete')
            .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const { guild, member } = interaction;
        const Target = interaction.options.getMember("member");
        const Reason = interaction.options.getString("reason") || "N/A";
        const Amount = interaction.options.getNumber("days") || "1";

        const banEmbed = new EmbedBuilder()
            .setColor('#F18A8A')
            .setAuthor({ name: 'BAN', iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });

        const dmEmbed = new EmbedBuilder()
            .setColor('#F18A8A')
            .setAuthor({ name: 'BAN', iconURL: interaction.guild.iconURL() })
            .setDescription(`❗ You have been banned from ${guild.name}! Reason: \`${Reason}\``)
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });

        const banEmbed2 = new EmbedBuilder()
            .setColor('#F18A8A')
            .setAuthor({ name: 'BAN', iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });


        if (Target.id === member.id) {
            banEmbed.setDescription("⛔ You cannot ban yourself! 🍂")
            return interaction.reply({ embeds: [banEmbed] });
        }
        if (Target.roles.highest.position >= member.roles.highest.position) {
            banEmbed.setDescription("⛔ You cannot ban someone higher than you on the role hierarchy! 🍂")
            return interaction.reply({ embeds: [banEmbed] });
        }

        if (Amount > 7) {
            banEmbed.setDescription("⛔ You cannot delete messages older than 7 days! 🍂")
            return interaction.reply({ embeds: [banEmbed] });

        }

        Target.send({ embeds: [dmEmbed] })
        banEmbed.setDescription(`${Target} has been banned for: \`${Reason}\`🍂`)
        await interaction.reply({ embeds: [banEmbed] })

        db.findOne({ GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag }, async(error, data) => {
            if (error) throw error;
            if (!data || !data.banData) {
                data = new db({
                    GuildID: interaction.guildId,
                    UserID: Target.id,
                    UserTag: Target.user.tag,
                    BanData: [{
                        ExecutorID: interaction.user.id,
                        ExecutorTag: interaction.user.tag,
                        Reason: Reason,
                        Date: parseInt(interaction.createdTimestamp / 1000),
                    }]
                })
            } else {
                const banDataObject = {
                    ExecutorID: interaction.user.id,
                    ExecutorTag: interaction.user.tag,
                    Reason: Reason,
                    Date: parseInt(interaction.createdTimestamp / 1000),
                }
                data.push(banDataObject)
            }
            data.save()
        })

        Target.ban({ days: Amount, reason: Reason })
            .catch((error) => { console.log(error) })

        banEmbed2.setColor('#F18A8A')
        banEmbed2.addFields({ name: 'User', value: `${Target}`, inline: true })
        banEmbed2.addFields({ name: 'Moderator', value: interaction.user.tag, inline: true })
        banEmbed2.addFields({ name: 'Reason', value: `${Reason}`, inline: true })
        guild.channels.cache.get(reportFilesChannel).send({ embeds: [banEmbed2] })
        guild.channels.cache.get(logChannel).send({ embeds: [banEmbed2] })
    }
}