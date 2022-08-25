const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const db = require("../../Models/WarningDB.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('kick')
        .setDescription('Kick a member from the server.')
        .addUserOption(option =>
            option.setName('member')
            .setDescription('Member to be kicked')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
            .setDescription('Reason for kick')
            .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const { guild, member } = interaction;
        const Target = interaction.options.getMember("member");
        const Reason = interaction.options.getString("reason") || "N/A";

        const kickEmbed = new EmbedBuilder()
            .setColor('#b1ee9e')
            .setAuthor({ name: 'KICK', iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });

        const dmEmbed = new EmbedBuilder()
            .setColor('#b1ee9e')
            .setAuthor({ name: 'KICK', iconURL: interaction.guild.iconURL() })
            .setDescription(`❗ You have been kicked from ${guild.name}! Reason: \`${Reason}\``)
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });

        const kickEmbed2 = new EmbedBuilder()
            .setColor('#b1ee9e')
            .setAuthor({ name: 'KICK', iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });


        if (Target.id === member.id) {
            kickEmbed.setDescription("⛔ You cannot kick yourself! 🍂")
            return interaction.reply({ embeds: [kickEmbed] });
        }
        if (Target.roles.highest.position >= member.roles.highest.position) {
            kickEmbed.setDescription("⛔ You cannot kick someone higher than you on the role hierarchy! 🍂")
            return interaction.reply({ embeds: [kickEmbed] });
        }

        Target.send({ embeds: [dmEmbed] })
        kickEmbed.setDescription(`${Target} has been kicked for: \`${Reason}\`🍂`)
        await interaction.reply({ embeds: [kickEmbed] })

        db.findOne({ GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag }, async(error, data) => {
            if (error) throw error;
            if (!data || !data.kickData) {
                data = new db({
                    GuildID: interaction.guildId,
                    UserID: Target.id,
                    UserTag: Target.user.tag,
                    KickData: [{
                        ExecutorID: interaction.user.id,
                        ExecutorTag: interaction.user.tag,
                        Reason: Reason,
                        Date: parseInt(interaction.createdTimestamp / 1000),
                    }]
                })
            } else {
                const kickDataObject = {
                    ExecutorID: interaction.user.id,
                    ExecutorTag: interaction.user.tag,
                    Reason: Reason,
                    Date: parseInt(interaction.createdTimestamp / 1000),
                }
                data.push(kickDataObject)
            }
            data.save()
        })

        Target.kick({ reason: Reason })
            .catch((error) => { console.log(error) })

        kickEmbed2.setColor('#b1ee9e')
        kickEmbed2.setAuthor({ name: `KICK | ${Target.user.tag}`, iconURL: interaction.guild.iconURL() })
        kickEmbed2.addFields({ name: 'User', value: `${Target}`, inline: true })
        kickEmbed2.addFields({ name: 'Moderator', value: interaction.user.tag, inline: true })
        kickEmbed2.addFields({ name: 'Reason', value: `${Reason}`, inline: true })
        guild.channels.cache.get(reportFilesChannel).send({ embeds: [kickEmbed2] })
        guild.channels.cache.get(logChannel).send({ embeds: [kickEmbed2] })
    }
}