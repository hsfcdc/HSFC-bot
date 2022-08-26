const fs = require('node:fs');
const path = require('node:path')
const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { clientId, token } = require('./config.json');

// const commands = [];
// const commandsPath = path.join(__dirname, 'commands');
// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// for (const file of commandFiles) {
//     const filePath = path.join(commandsPath, file);
//     const command = require(filePath);
//     commands.push(command.data.toJSON());
// }
const commands = [];
const commandsPath = path.join(__dirname, 'Commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./Commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, folder, file);
        const command = require(filePath);
        commands.push(command.data.toJSON());
    }
}
const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
    .then(() => console.log('Registered commands'))
    .catch(console.error);