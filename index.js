// Requirements
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');

// Define bot logo
global.botLogo = 'https://i.imgur.com/vqyKOkZ.png';
global.embedFooterText = 'Heartbotter2 by noahjs#0725';

// New client instance
global.client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Add commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath)

    client.commands.set(command.data.name, command);
}



// Log when online
client.once('ready', () => {
    Tags.sync();
    console.log(`Online as ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error)
        await interaction.reply({ content: 'There was a problem while running this command! Please try again later.', ephemeral: true });
    }

});

// Login from config.json
client.login(token);