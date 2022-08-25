const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const db = require("../../Models/WarningDB.js")
module.exports = {

        data: new SlashCommandBuilder()
            .setDMPermission(false)
            .setName('warns')
            .setDescription('Warn a member in the server.')
            .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
            .addSubcommand(subcommand =>
                subcommand
                .setName('add')
                .setDescription('Add a warning')
                .addUserOption(option =>
                    option.setName('user')
                    .setDescription('Select a user')
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                    .setDescription('Provide a reason')
                    .setRequired(true)))

            .addSubcommand(subcommand =>
            subcommand
            .setName('check')
            .setDescription('Check warnings')
            .addUserOption(option =>
                option.setName('user')
                .setDescription('Select a user')
                .setRequired(true)))

            .addSubcommand(subcommand =>
            subcommand
            .setName('remove')
            .setDescription('Remove specific warning')
            .addUserOption(option =>
                option.setName('user')
                .setDescription('Provide a user')
                .setRequired(true))
            .addNumberOption(option =>
                option.setName('warning_id')
                .setDescription('Provide the warning ID')
                .setRequired(true)))

            .addSubcommand(subcommand =>
            subcommand
            .setName('clear')
            .setDescription('Clear all warnings.')
            .addUserOption(option =>
                option.setName('user')
                .setDescription('Select a user')
                .setRequired(true))),


        async execute(interaction) {


            const { guild, user, member } = interaction;
            const Sub = interaction.options.getSubcommand(['add', 'check', 'remove', 'clear']);
            const Target = interaction.options.getMember("user")
            const Reason = interaction.options.getString("reason") || `\`None\``;
            const WarnID = interaction.options.getNumber("warnId") - 1;
            const WarnDate = new Date(interaction.createdTimestamp).toLocaleDateString();

            const banEmbed2 = new EmbedBuilder()
                .setColor('#F18A8A')
                .setAuthor({ name: 'BAN', iconURL: interaction.guild.iconURL() })
                .setTimestamp()
                .setFooter({ text: embedFooterText, iconURL: botLogo });

            const errorEmbed = new EmbedBuilder()
                .setColor('#f0c499')
                .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                .setTimestamp()
                .setFooter({ text: embedFooterText, iconURL: botLogo });

            const logEmbed = new EmbedBuilder()
                .setTimestamp()
                .setFooter({ text: embedFooterText, iconURL: botLogo })
                .addFields({ name: 'User', value: `${Target}`, inline: true })
                .addFields({ name: 'Moderator', value: `${interaction.user}`, inline: true })
                .addFields({ name: 'Reason', value: `${Reason}`, inline: true });


            if (Sub === 'add') {



                if (Target.id === member.id) {
                    errorEmbed.setDescription("⛔ You cannot warn yourself! 🍂")
                    return interaction.reply({ embeds: [errorEmbed] });
                }

                if (Target.roles.highest.position >= member.roles.highest.position) {
                    errorEmbed.setDescription("⛔ You cannot warn someone higher than you on the role hierarchy! 🍂")
                    return interaction.reply({ embeds: [errorEmbed] });
                }

                db.findOne({ GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag }, async(error, data) => {
                    if (error) throw error;
                    if (!data) {
                        data = new db({
                            GuildID: interaction.guildId,
                            UserID: Target.id,
                            UserTag: Target.user.tag,
                            WarnData: [{
                                ExecutorID: interaction.user.id,
                                ExecutorTag: interaction.user.tag,
                                Reason: Reason,
                                Date: WarnDate,
                                IsActive: true,

                            }],

                        })
                    } else {
                        const obj = {
                            ExecutorID: interaction.user.id,
                            ExecutorTag: interaction.user.tag,
                            Reason: Reason,
                            Date: WarnDate,
                            IsActive: true,
                        }
                        data.WarnData.push(obj)
                    }

                    data.save()
                })
                if (data.WarnData.length >= 3) {
                    Target.ban({ reason: `3rd warning reached! Final warning: \`${Reason}\`` }).catch(() => {
                        errorEmbed.setDescription(`⛔ **${Target}** has reached 3 strikes, but I was unable to ban them! 🍂`);
                        return guild.channels.cache.get(interaction.channelId).send({ embeds: [errorEmbed] })
                    })

                    db.findOne({ GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag }, async(error, data) => {
                        if (error) throw error;
                        if (!data) {
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

                    logEmbed.setColor('#F18A8A')
                    logEmbed.setAuthor({ name: `BAN | ${Target.user.tag}`, iconURL: interaction.guild.iconURL() })
                    logEmbed.addFields({ name: 'User', value: `${Target}`, inline: true })
                    logEmbed.addFields({ name: 'Moderator', value: interaction.user.tag, inline: true })
                    logEmbed.addFields({ name: 'Reason', value: `3rd warning reached! Final warning: \`${Reason}\``, inline: true })
                    guild.channels.cache.get(reportFilesChannel).send({ embeds: [logEmbed] })
                    guild.channels.cache.get(logChannel).send({ embeds: [logEmbed] })
                    Target.send({
                        embeds: [new EmbedBuilder()
                            .setColor('#f0c499')
                            .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                            .setDescription(`❗You have been banned from ${guild.name}! \n**Reason**: 3 strikes auto-ban`)
                            .setTimestamp()
                            .setFooter({ text: embedFooterText, iconURL: botLogo })
                        ]

                    }).catch(() => {
                        errorEmbed.setDescription(`⛔ I was unable to message **${Target}** about their 3-strikes ban! 🍂`);
                        guild.channels.cache.get(interaction.channelId).send({ embeds: [errorEmbed] })
                    })



                    Target.send({
                        embeds: [new EmbedBuilder()
                            .setColor('#f0c499')
                            .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                            .setDescription(`❗You have been warned in ${guild.name}! \n**Reason**: \`${Reason}\``)
                            .setTimestamp()
                            .setFooter({ text: embedFooterText, iconURL: botLogo })
                        ]
                    }).catch(() => {
                        errorEmbed.setDescription(`⛔ I was unable to message **${Target}** about their warning! 🍂`);
                        guild.channels.cache.get(interaction.channelId).send({ embeds: [errorEmbed] })
                    })
                    interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor('#f0c499')
                            .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                            .setDescription(`✅ Warning added to ${Target.user.tag}!\n**Reason:** \`${Reason}\``)
                            .setTimestamp()
                            .setFooter({ text: embedFooterText + ` | ${Target.id}`, iconURL: botLogo })
                        ]
                    })
                    logEmbed.setColor('#f0c499')
                    logEmbed.setAuthor({ name: `WARN | ${Target.user.tag}`, iconURL: interaction.guild.iconURL() })
                    guild.channels.cache.get(reportFilesChannel).send({ embeds: [logEmbed] })
                    guild.channels.cache.get(logChannel).send({ embeds: [logEmbed] })
                } else if (Sub === 'check') {

                    db.findOne({ GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag }, async(error, data) => {
                                if (error) throw error;
                                if (data) {
                                    interaction.reply({
                                                embeds: [new EmbedBuilder()
                                                        .setTimestamp()
                                                        .setFooter({ text: embedFooterText, iconURL: botLogo })
                                                        .setColor('#f0c499')
                                                        .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                                                        .setDescription(`${data.WarnData.map(
                                        (w, i) => `**ID**: ${i + 1}\n**By**:${w.ExecutorTag}\n**Date**:${w.Date}\n**Reason**: ${w.Reason}\n\n`
                                    ).join(' ')}`)], ephemeral: true})} else {
                                        interaction.reply({
                                            embeds: [new EmbedBuilder()
                                                .setTimestamp()
                                                .setFooter({ text: embedFooterText, iconURL: botLogo })
                                                .setColor('#f0c499')
                                                .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                                                .setDescription(`ℹ️ This user has no warnings! 🍂`)
                                    ], ephemeral: true})}


                }

                )}
                else if (Sub === 'remove') {

                    db.findOne({GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag}, async(error, data) =>{
                        if (error) throw error;
                        if (data) {
                            data.WarnData.splice(WarnID, 1);
                            interaction.reply({
                                embeds: [new EmbedBuilder()
                                    .setTimestamp()
                                    .setFooter({ text: embedFooterText, iconURL: botLogo })
                                    .setColor('#f0c499')
                                    .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                                    .setDescription(`✅ ${Target.user.tag}'s warning ID: ${WarnID + 1} has been removed! 🍂`)]}); 

                            logEmbed.setColor('#f0c499')
                            logEmbed.setAuthor({ name: `WARN REMOVED | ${Target.user.tag}`, iconURL: interaction.guild.iconURL() })
                            logEmbed.setDescription(`✅ Warn ID: \`${WarnID + 1}\` has been removed from ${Target.user.tag}. 🍂`)
                            guild.channels.cache.get(reportFilesChannel).send({ embeds: [logEmbed] })
                            guild.channels.cache.get(logChannel).send({ embeds: [logEmbed] })
                        data.save() 
                        } else {
                            interaction.reply({
                                embeds: [new EmbedBuilder()
                                    .setTimestamp()
                                    .setFooter({ text: embedFooterText, iconURL: botLogo })
                                    .setColor('#f0c499')
                                    .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                                    .setDescription(`ℹ️ This user has no warnings! 🍂`)
                        ]})
                        }
                    })

                } else if (Sub === 'clear') {

db.findOne({GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag}, async(error, data) =>{
    if (error) throw error;
    if (data){
        await db.findOneAndDelete({GuildID: interaction.guildId, UserID: Target.id, UserTag: Target.user.tag})
        interaction.reply({embeds: [new EmbedBuilder()
        .setTimestamp()
        .setFooter({ text: embedFooterText, iconURL: botLogo })
        .setColor('#f0c499')
        .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
        .setDescription(`✅ ${Target.user.tag}'s warnings were cleared. 🍂`)
]})
    }else {
        interaction.reply({
            embeds: [new EmbedBuilder()
                .setTimestamp()
                .setFooter({ text: embedFooterText, iconURL: botLogo })
                .setColor('#f0c499')
                .setAuthor({ name: 'WARN', iconURL: interaction.guild.iconURL() })
                .setDescription(`ℹ️ This user has no warnings! 🍂`)
    ]})
    }})

                }
            }
        }
    }