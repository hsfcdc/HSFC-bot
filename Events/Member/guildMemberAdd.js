const config = require('../../config.json')
const { Message, EmbedBuilder } = require('discord.js');
const db = require("../../Models/WelcomeDB.js")

module.exports = {
    name: 'guildMemberAdd',
    execute(client, member, guild) {
        console.log('member joined')
        console.log(member.guild.id)
        db.findOne({ GuildID: member.guild.id }, async(error, data) => {
            if (error) throw error;
            if (data) {
                data.WelcomeInfo.map(
                    (w) => {
                        console.log(w.EmbedTitle, w.EmbedContent, w.EmbedMedia)
                        welcomeEmbed = new EmbedBuilder()
                            .setAuthor({ name: `${member.user.tag}`, iconURL: member.user.avatarURL() })
                            .setTitle(w.EmbedTitle.toString())
                            .setDescription(w.EmbedContent.toString())
                            .setColor(w.EmbedColor)
                            .setImage(w.EmbedMedia)
                            .setTimestamp()
                            .setFooter({ text: embedFooterText, iconURL: botLogo });
                        member.guild.channels.cache.get(w.EmbedChannel).send({ content: `Welcome, <@${member.user.id}> | <@&${w.EmbedRole}>`, embeds: [welcomeEmbed] })

                    })
            } else { console.log('wtf just happened') }
        })

        /// LOGS ///
        // member.guild.channels.cache.get(config.InfractionsLogs).send(new MessageEmbed() /// Log Embed
        //     .setDescription(`${member} just joined the server.`).setColor(config.GREEN));
    }
}