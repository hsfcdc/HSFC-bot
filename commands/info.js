// Requirements
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment');

// Export command data
module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Pong! Discord API response time.')
        // User subcommand
        .addSubcommand(subcommand =>
            subcommand
            .setName('user')
            .setDescription('Info about a user')
            .addUserOption(option => option.setName('target').setDescription('The user')))
        // Server subcommand
        .addSubcommand(subcommand =>
            subcommand
            .setName('server')
            .setDescription('Get server info')),
    async execute(interaction) {

        if (interaction.commandName === 'info') {
            // User code
            if (interaction.options.getSubcommand() === 'user') {
                const user = interaction.options.getUser('target');

                // If user was mentioned
                if (user) {
                    const user = interaction.options.getUser('target');
                    const member = interaction.options.getMember('target');
                    let createdAt = moment(user.createdAt);
                    let creationDateFormated = createdAt.format('DD/MM/YYYY') + ' (' + createdAt.fromNow() + ')';
                    let joinedAt = moment(member.joinedAt);
                    let joinDateFormatted = joinedAt.format('DD/MM/YYYY') + ' (' + joinedAt.fromNow() + ')';

                    let memberRoles = member.roles.cache.map(r => `${r}`).join(' ');
                    if (memberRoles.toString().length > 1024) {
                        global.roleList = 'Too many roles to display!'
                    } else {
                        global.roleList = memberRoles
                    }

                    if (member.premiumSince) {
                        global.memberIsBoosting = "Yes"
                    } else {
                        global.memberIsBoosting = "No"
                    }

                    user.fetch()
                        .then(data => {

                            const userInfoEmbed = new EmbedBuilder()
                                .setColor('#a4a3eb')
                                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
                                .setThumbnail(user.displayAvatarURL())
                                .addFields({ name: 'Name', value: `<@${user.id}>\n${user.tag}`, inline: true })
                                .addFields({ name: 'Created at', value: `${creationDateFormated}`, inline: true })
                                .addFields({
                                    name: 'Joined at',
                                    value: `${joinDateFormatted}`,
                                    inline: true
                                })
                                .addFields({ name: 'Boosting?', value: memberIsBoosting, inline: true })
                                .addFields({ name: 'Strikes', value: 'Coming soon', inline: true })
                                .addFields({ name: 'Roles', value: roleList, inline: false })
                                .setImage(user.bannerURL())
                                .setTimestamp()
                                .setFooter({ text: 'Heartbotter2 by noahjs#0725', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

                            interaction.reply({ embeds: [userInfoEmbed] })
                        })
                        // If no user mentioned
                } else {
                    await interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
                }
                // Server code
            } else if (interaction.options.getSubcommand() === 'server') {
                interaction.guild.fetchVanityData()
                    .then(data => {
                        // vanityEmbed
                        const vanityEmbed = new EmbedBuilder()
                            .setColor('#a4a3eb')
                            .setAuthor({ name: interaction.guild.name, iconURL: interaction.guild.iconURL() })
                            .setDescription(interaction.guild.description)
                            .setThumbnail(interaction.guild.iconURL())
                            .addFields({ name: 'Owner', value: `${owner}`, inline: true })
                            .addFields({ name: 'Creation', value: `${dateFormated}`, inline: true })
                            .addFields({
                                name: 'Vanity URL',
                                value: `/${data.code} with ${data.uses} uses.`,
                                inline: true
                            })
                            .addFields({ name: 'Members', value: `${interaction.guild.memberCount}`, inline: true })
                            .addFields({ name: 'Roles', value: `${interaction.guild.roles.cache.size}`, inline: true }, )
                            .addFields({ name: 'Channels', value: `${interaction.guild.channels.cache.size}`, inline: true })
                            .setImage(interaction.guild.bannerURL())
                            .setTimestamp()
                            .setFooter({ text: 'Heartbotter2 by noahjs#0725', iconURL: 'https://i.imgur.com/AfFp7pu.png' });
                        // Send vanityEmbed
                        interaction.reply({ embeds: [vanityEmbed] });
                    })
            };
        }
    },
}