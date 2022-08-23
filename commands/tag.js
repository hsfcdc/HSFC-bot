const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

global.Tags = sequelize.define('tags', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    description: Sequelize.TEXT,
    username: Sequelize.STRING,
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Quickly create or send custom messages.')
        .addSubcommand(subcommand =>
            subcommand
            .setName('add')
            .setDescription('Create a new tag')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input a name for your tag')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('content')
                .setDescription('Input content for your tag')
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('send')
            .setDescription('Send your pre-programmed tag')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input the name of your tag')
                .setRequired(true))
            .addUserOption(option =>
                option.setName('user')
                .setDescription('Mention a user with your tag where possible')
                .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('edit')
            .setDescription('Edit your pre-programmed tag')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input the name of your tag')
                .setRequired(true))
            .addStringOption(option =>
                option.setName('content')
                .setDescription('Add the new content for your tag')
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('delete')
            .setDescription('Deletes a tag')
            .addStringOption(option =>
                option.setName('name')
                .setDescription('Input the name of your tag')
                .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
            .setName('list')
            .setDescription('List all tags')),

    async execute(interaction) {
        const tagName = interaction.options.getString('name');
        const tagDescription = interaction.options.getString('content');
        const tagMentions = interaction.options.getUser('user');
        // Add tag command
        if (interaction.options.getSubcommand() === 'add') {
            try {
                const tag = await Tags.create({
                    name: tagName,
                    description: tagDescription,
                    username: interaction.user.username,
                });

                return interaction.reply(`Tag ${tag.name} created successfully.`)
            } catch (error) {
                if (error.name === 'SequelizeUniqueConstraintError') {
                    return interaction.reply(':x: Error! That tag already exists.')
                }

                return interaction.reply('Something went wrong. Please try again later.')

            }
            // Send command tag
        } else if (interaction.options.getSubcommand() === 'send') {
            const tag = await Tags.findOne({ where: { name: tagName } });

            if (tag) {
                tag.increment('usage_count');
                if (tagMentions) {
                    return interaction.reply(`${tagMentions}` + " " + tag.get('description'));
                }
                return interaction.reply(tag.get('description'));

            }

            return interaction.reply(`Could not find a tag named ${tagName}`)
        }
        if (interaction.options.getSubcommand() === 'edit') {
            const editedRows = await Tags.update({ description: tagDescription }, { where: { name: tagName } });

            if (editedRows > 0) {
                return interaction.reply(`Tag ${tagName} was edited successfully.`);
            }
            return interaction.reply(`Could not find a tag with name ${tagName}.`);
        }
        if (interaction.options.getSubcommand() === 'list') {
            const listTag = await Tags.findAll({ attribute: ['name'] });
            const tagsString = listTag.map(t => t.name).join(', ') || 'No tags set.';
            return interaction.reply(`**Tags**:\n${tagsString}`);
        }
        if (interaction.options.getSubcommand() === 'delete') {
            const tagName = interaction.options.getString('name');
            const rowCount = await Tags.destroy({ where: { name: tagName } });

            if (!rowCount) return interaction.reply('That tag doesn\'t exist.');

            return interaction.reply('Tag deleted.');
        }
    }
}