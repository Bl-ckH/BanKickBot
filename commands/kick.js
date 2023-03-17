const { MessageEmbed } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'kick',
  description: 'Wirft einen Benutzer vom Server',
  execute(message, args) {
    // Überprüfen, ob der Benutzer die erforderliche Rolle hat
    if (!message.member.roles.cache.some(role => role.id === config.adminroleid)) {
      return message.reply('Du hast keine Berechtigung, diesen Befehl auszuführen!');
    }

    // Überprüfen, ob ein Benutzer angegeben wurde
    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Bitte gib einen Benutzer an, den du kicken möchtest.');
    }

    // Kick-Grund erhalten
    const reason = args.slice(1).join(' ');

    // Kick-Nachricht senden
    user.send(`Du wurdest vom Server **${message.guild.name}** gekickt${reason ? ` wegen: ${reason}` : '.'}`).then(() => {
      // Nachricht an Moderator senden
      const embed = new MessageEmbed()
        .setColor('#FF0000')
        .setTitle('Erfolgreich gekickt!')
        .setDescription(`Der Benutzer ${user.tag} wurde erfolgreich vom Server gekickt.`)
        .addField('Moderator', message.author.tag)
        .addField('Grund', reason || 'Nicht angegeben');

      message.channel.send({ embeds: [embed] }).then(msg => {
        setTimeout(() => msg.delete(), 5000); // Lösche Erfolgsmeldung nach 5 Sekunden
      });

      // Benutzer aus Server kicken
      message.guild.members.kick(user, reason).then(() => {
        // Log-Nachricht senden
        const logEmbed = new MessageEmbed()
          .setColor('#FF0000')
          .setTitle('Benutzer gekickt')
          .addField('Benutzer', user.tag)
          .addField('Moderator', message.author.tag)
          .addField('Grund', reason || 'Nicht angegeben')
          .setTimestamp();

        const logChannel = message.guild.channels.cache.get(config.logchannelid);
        if (logChannel) {
          logChannel.send({ embeds: [logEmbed] });
        } else {
          console.error(`Log-Channel mit ID ${config.logchannel} nicht gefunden.`);
        }
      }).catch(error => {
        console.error(error);
        message.reply('Es ist ein Fehler beim Kicken des Benutzers aufgetreten.');
      });
    }).catch(error => {
      console.error(error);
      message.reply('Es ist ein Fehler beim Senden einer Nachricht an den Benutzer aufgetreten.');
    });
  },
};