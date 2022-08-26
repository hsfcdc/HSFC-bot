const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require("discord.js")
const db = require("../../Models/WelcomeDB.js")



module.exports = {

    data: new SlashCommandBuilder()
        .setDMPermission(false)
        .setName('welcome')
        .setDescription('Warn a member in the server.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)

        .addSubcommand(subcommand =>
        subcommand
        .setName('setup')
        .setDescription('Setup your welcome message')
        .addStringOption(option =>
            option.setName('title')
            .setDescription('Add a title to your welcome message.')
            .setRequired(true)
        )

        .addStringOption(option =>
            option.setName('color')
            .setDescription('Add some color to your welcome message.')
            .setRequired(true)
        )

        .addRoleOption(option =>
            option.setName('role')
            .setDescription('Select a role to mention in your welcome message.')
            .setRequired(true)
        )
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('Select the channel I should send your welcome message.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('media')
            .setDescription('Add a GIF or image to your welcome message.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('line1')
            .setDescription('Add a message to your welcome message.')
            .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('line2')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line3')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line4')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line5')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line6')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line7')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line8')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('line9')
            .setDescription('Add a message to your welcome message.')
            .setRequired(false)
        )
    )


        .addSubcommand(subcommand =>
        subcommand
        .setName('reset')
        .setDescription('Reset all welcome options (disables message)')
    )

        .addSubcommand(subcommand =>
        subcommand
        .setName('preview')
        .setDescription('Preview your welcome message.')

    ),



    async execute(interaction) {
        const Sub = interaction.options.getSubcommand(['setup', 'reset', 'preview']);
        const { guild, user, member } = interaction;

        const errorEmbed = new EmbedBuilder()
            .setColor('#f0c499')
            .setAuthor({ name: 'Welcomer', iconURL: interaction.guild.iconURL() })
            .setTimestamp()
            .setFooter({ text: embedFooterText, iconURL: botLogo });



        if (Sub === 'setup') {

            const Title = interaction.options.getString("title");
            const Content = [interaction.options.getString("line1"),
                interaction.options.getString(`line2`),
                interaction.options.getString(`line3`),
                interaction.options.getString(`line4`),
                interaction.options.getString(`line5`),
                interaction.options.getString(`line6`),
                interaction.options.getString(`line7`),
                interaction.options.getString(`line8`),
                interaction.options.getString(`line9`)
            ];
            const Color = interaction.options.getString("color");
            const Role = interaction.options.getRole("role");
            const Media = interaction.options.getString("media");
            const ChannelOption = interaction.options.getChannel("channel");
            var filtered = Content.filter(function(el) {
                return el != null;
            });

            let contentSplit = filtered.map(c => `${c}`).join(`\n`);
            console.log(Title);
            console.log(contentSplit);
            console.log(Color);
            console.log(Role.id);
            console.log(ChannelOption.id);

            function checkHex(color) {
                return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
            }


            function isImgLink(str) {
                return (str.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gmi) !== null);
            }



            if (!checkHex(Color) && !Object.keys(Discord.Constants.Colors).includes(colorArg.toUpperCase())) {
                errorEmbed.setDescription(`⚠️ | You did not provide a valid hex colour! Remember to include the '#'. 🍂`)
                return interaction.reply({ embeds: [errorEmbed] })
            }

            const ValidMedia = isImgLink(Media);
            if (!ValidMedia) {
                errorEmbed.setDescription("⚠️ | You did not provide a valid link to media (supported file types:jpg/gif/png)")
                return interaction.reply({ embeds: [errorEmbed] })
            }


            db.findOne({ GuildID: interaction.guildId }, async(error, data) => {
                if (error) throw error;
                if (!data) {
                    data = new db({
                        GuildID: interaction.guildId,
                        WelcomeInfo: [{
                            EmbedTitle: Title,
                            EmbedContent: contentSplit,
                            EmbedColor: Color,
                            EmbedRole: Role.id,
                            EmbedChannel: ChannelOption.id,
                            EmbedMedia: Media,
                        }],
                    })


                } else {
                    errorEmbed.setDescription(`⚠️ | You have already configured a welcome message. \n\nUse \`/welcome reset\` before you can use this command. 🍂`)
                    return interaction.reply({ embeds: [errorEmbed] })
                }
                errorEmbed.setDescription(`✅ | Successfully set welcome message in <#${ChannelOption.id}>! Use \`/welcome preview\` to see it!`)
                interaction.reply({ embeds: [errorEmbed] })
                data.save()
            })

        } else if (Sub === 'reset') {

            db.findOneAndDelete({ GuildID: interaction.guildId }, async(error, data) => {
                if (error) throw error;
                if (data) {
                    errorEmbed.setDescription(`✅ | Welcome message has been reset successfully. \n\nYou now need to use \`/welcome set\` to re-enable welcome messages 🍂`)
                    return interaction.reply({ embeds: [errorEmbed] })
                } else {
                    errorEmbed.setDescription(`⚠️ | You do not have welcome messages configured. \n\nYou need to use \`/welcome set\` before you can reset. 🍂`)
                    return interaction.reply({ embeds: [errorEmbed] })
                }
            })

        } else if (Sub === 'preview') {
            db.findOne({ GuildID: interaction.guildId }, async(error, data) => {
                if (data) {
                    data.WelcomeInfo.map(
                        (w) => {
                            const user = interaction.user;
                            const server = interaction.guild.name;
                            console.log(w.EmbedTitle, w.EmbedContent, w.EmbedMedia)
                            welcomeEmbed = new EmbedBuilder()
                                .setTitle(w.EmbedTitle.toString())
                                .setDescription(`${w.EmbedContent}`)
                                .setColor(w.EmbedColor)
                                .setImage(w.EmbedMedia)
                                .setTimestamp()
                                .setFooter({ text: embedFooterText, iconURL: botLogo });
                            interaction.reply({ content: `Sending...`, ephemeral: true })
                            return guild.channels.cache.get(interaction.channelId).send({ content: `Welcome, [MEMBER] | <@&${w.EmbedRole}>`, embeds: [welcomeEmbed] })
                        })
                } else {
                    errorEmbed.setDescription(`⚠️ | You do not have welcome messages configured. \n\nYou need to use \`/welcome set\` before you can preview. 🍂`)
                    return interaction.reply({ embeds: [errorEmbed] })
                }
            })
        }

    }
}