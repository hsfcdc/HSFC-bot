const { SlashCommandBuilder, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');
const db = require("../../Models/TagDB.js")
const { templateEmbedResponse } = require("../../Import/embedTemplate.js")



module.exports = {
    data: new SlashCommandBuilder()
        .setDMPermission(false)
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
            db.findOne({ TagName: tagName }, async(error, data) => {
                if (error) throw error;
                if (!data) {
                    data = new db({
                        TagName: tagName,
                        TagContent: tagDescription,
                        TagCreator: interaction.user,
                    })
                } else {
                    return interaction.reply(`This tag already exists!`)
                }
                data.save()
                return interaction.reply(`Tag ${tagName} created successfully.`)
            })

        }



        // Send command tag
        else if (interaction.options.getSubcommand() === 'send') {
            db.findOne({ TagName: tagName }, async(error, data) => {
                if (error) throw error;
                if (data) {
                    if (tagMentions) {
                        interaction.reply(`${tagMentions} ` + data.TagContent)
                    } else {
                        interaction.reply(`${data.TagContent}`)
                    }


                } else {
                    interaction.reply(`${tagName} does not exist. 🍂`)
                }
            });

        }
        if (interaction.options.getSubcommand() === 'edit') {
            let name = { TagName: tagName }
            let desc = { TagContent: tagDescription }
            db.findOneAndUpdate(name, desc, { returnOriginal: false }, async(error, data) => {
                if (error) throw error;
                if (data) {
                    return interaction.reply(`${tagName} was edited successfully! 🍂`)
                } else {
                    return interaction.reply(`Could not find a tag with name ${tagName}. 🍂`);
                }
            })




        }
        if (interaction.options.getSubcommand() === 'list') {
            db.find({}, function(error, tag) {
                // console.log(tag)
                const tagsString = tag.map(t => t.TagName).join(', ') || 'No tags set.';
                // console.log(tagsString)
                return interaction.reply(`**Tags**:\n${tagsString}`);
            });
            // console.log(listTag)
            // const tagsString = listTag.map(t => t.name).join(', ') || 'No tags set.';
            // return interaction.reply(`**Tags**:\n${tagsString}`);
        }
        if (interaction.options.getSubcommand() === 'delete') {
            db.findOneAndDelete(tagName, async(error, data) => {
                if (error) throw error;
                if (data) {
                    return interaction.reply(`${tagName} was deleted successfully! 🍂`)
                } else {
                    return interaction.reply(`Could not find a tag with name ${tagName}. 🍂`);
                }
            })
        }

    }
}