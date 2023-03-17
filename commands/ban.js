const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'ban',
  description: 'Bannt einen Benutzer vom Server',
  execute(message, args) {
    // Überprüfen, ob der Benutzer die erforderliche Rolle hat
    if (!message.member.roles.cache.some(role => role.id === config.adminroleid)) {
      return message.reply('Du hast keine Berechtigung, diesen Befehl auszuführen!');
    }

    // Benutzer, der gebannt werden soll, aus Argumenten extrahieren
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Du musst einen Benutzer zum Bannen erwähnen.');
    }

    // Benachrichtigung an den gebannten Benutzer senden
    const reason = args.slice(1).join(' ');
    user.send(`Du wurdest von ${message.guild.name} gebannt von ${message.author.tag} ${reason ? `mit dem Grund: ${reason}` : ''}`).catch(err => {
      console.log(`Fehler beim Senden einer Benachrichtigung an ${user.tag}: ${err}`);
    });

    // Benutzer bannen
    message.guild.members.ban(user, { reason }).then(() => {
      const embed = new MessageEmbed()
        .setColor('#ff0000')
        .setTitle('Benutzer gebannt!')
        .setDescription(`${user.tag} wurde vom Server gebannt.${reason ? ` Grund: ${reason}` : ''}`)
        .addField('Gebannt von', message.author.tag);

      // Log-Nachricht in bestimmtem Channel senden
      const channel = message.guild.channels.cache.get(config.logchannelid);
      if (channel) channel.send({ embeds: [embed] });
    }).catch(error => {
      console.error(error);
      message.reply('Es ist ein Fehler beim Bannen des Benutzers aufgetreten.');
    });
  },
};