const { SlashCommandBuilder, Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, guildId, token } = require('./config.json');

const commands = [
        new SlashCommandBuilder().setName('ping').setDescription(`Get the ping time to Discord's API`),
        new SlashCommandBuilder().setName('server').setDescription(`Get the server's info`),

    ]
    .map(command => command.toJSON());
const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: [] })
    .then(() => console.log('Commands reset. You now need to redeploy.'))
    .catch(console.error);