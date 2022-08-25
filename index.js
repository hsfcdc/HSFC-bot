// Requirements
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const { token, mongooseLogin } = require('./config.json');
const mongoose = require('mongoose');
global.reportFilesChannel = ("936604221464281149")
global.logChannel = ("974067076819988500")

// Define bot logo
global.botLogo = 'https://i.imgur.com/vqyKOkZ.png';
global.embedFooterText = 'Heartbotter2 - discord.gg/heartstopper';

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
client.once('ready', async() => {
    console.log(`✅ Online as ${client.user.tag} 🍂`);

    client.user.setPresence({
        activities: [{ name: `discord.gg/heartstopper`, type: ActivityType.Watching }],
        status: 'dnd',
    });

    if (!mongooseLogin) return;
    await mongoose.connect(mongooseLogin, {
        keepAlive: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => { console.log('✅ Client has successfully connected to MongoDB') }).catch((error) => {
        console.log(error)
    });

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