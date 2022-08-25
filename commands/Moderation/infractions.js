const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const db = require("../../Models/WarningDB.js")


module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('infractions')
        .setDescription('Check member infractions.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
        .addUserOption(option =>
            option.setName('user')
            .setDescription('Select user.')
            .setRequired(true))
        .addStringOption(option =>
            option.setName('check')
            .setDescription('Select type of infraction to check.')
            .setRequired(true)
            .addChoices({ name: 'All', value: 'all' }, { name: 'Warnings', value: 'warnings' }, { name: 'Bans', value: 'bans' }, { name: 'Kicks', value: 'kicks' })
        ),

    async execute(interaction) {
        const { guild, user, member, options } = interaction;
        const Target = options.getUser("user");
        const choice = options.getString("check");

        const Response = new EmbedBuilder()
            .setColor('#f0c499')
            .setAuthor({ name: 'Infractions', iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });

        switch (choice) {
            case "all":
                {
                    db.findOne({ GuildID: guild.id, UserID: Target.id },
                        async(error, data) => {
                            if (error) throw error;
                            if (data) {

                                const W = data.WarnData.length;
                                const B = data.BanData.length;
                                const K = data.KickData.length;
                                console.log('hello world')

                                Response.setDescription(`**Member**: ${Target}\n
                                **Warnings**: ${W}\n**Bans**: ${B}\n**Kicks**: ${K}`)
                                return interaction.reply({ embeds: [Response] })

                            } else {
                                Response.setDescription(`${Target} has no infractions. 🍂`)
                                return interaction.reply({ embeds: [Response] })
                            }
                        })
                }
                break;
            case "warnings":
                {
                    db.findOne({ GuildID: guild.id, UserID: Target.id },
                        async(error, data) => {
                            if (error) throw error;
                            if (data) {
                                if (data.WarnData.length < 1) {
                                    Response.setDescription(`${Target} has no warnings. 🍂`)
                                    return interaction.reply({ embeds: [Response] })
                                } else {
                                    const W = data.WarnData.length;
                                    Response.setDescription(`**Member**: ${Target}\n
                                **Warnings**: ${W}`)
                                    return interaction.reply({ embeds: [Response] })
                                }
                            } else {
                                Response.setDescription(`${Target} has no warnings. 🍂`)
                                return interaction.reply({ embeds: [Response] })
                            }
                        })

                }
                break;

            case "bans":
                {
                    db.findOne({ GuildID: guild.id, UserID: Target.id },
                        async(error, data) => {
                            if (error) throw error;
                            if (data) {

                                const B = data.BanData.length;
                                Response.setDescription(`**Member**: ${Target}\n
                                    **Bans**: ${B}`)
                                return interaction.reply({ embeds: [Response] })

                            } else {
                                Response.setDescription(`${Target} has no bans. 🍂`)
                                return interaction.reply({ embeds: [Response] })
                            }
                        });
                }
                break;

            case "kicks":
                {
                    db.findOne({ GuildID: guild.id, UserID: Target.id },
                        async(error, data) => {
                            if (error) throw error;
                            if (data) {
                                if (data.KickData.length < 1) {
                                    Response.setDescription(`${Target} has no kicks. 🍂`)
                                    return interaction.reply({ embeds: [Response] })
                                } else {
                                    const W = data.KickData.length;
                                    Response.setDescription(`**Member**: ${Target}\n
                                    **Kicks**: ${W}`)
                                    return interaction.reply({ embeds: [Response] })
                                }
                            } else {
                                Response.setDescription(`${Target} has no kicks. 🍂`)
                                return interaction.reply({ embeds: [Response] })
                            }
                        })


                }
                break;
        }
    }
}