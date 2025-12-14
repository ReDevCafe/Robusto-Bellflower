import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from './BaseCommand';
import config from '../../clientconfig.json';

export class WhoCoffedCommand extends BaseCommand 
{
  constructor(database) 
  {
    super('whocoffed', 'Affiche qui a offert un café à un utilisateur', true);
    this.database = database;
  }
  
  async execute(interaction) 
  {
    const targetUser = interaction.options.getUser('utilisateur');
    const userData = await this.database.getUserData(targetUser.id);

    if (!userData || userData.coffed === "0") 
    {
      await interaction.reply({content: config.command.whoCoffed.nocoffee.replace('${member}', `<@${targetUser.id}>`), flags: MessageFlags.Ephemeral });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(config.command.whoCoffed.color)
      .setTitle(config.command.whoCoffed.title)
      .setDescription(config.command.whoCoffed.description
                        .replace('${coffed}', `<@${userData.coffed}>`)
                        .replace('${member}', `<@${targetUser.id}>`)
      )
      .addFields(
        { name: config.command.whoCoffed.fields.beneficiary, value: `<@${targetUser.id}>`, inline: true },
        { name: config.command.whoCoffed.fields.donor, value: `<@${userData.coffed}>`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
  
  toJSON() {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption(option =>
        option
          .setName('utilisateur')
          .setDescription(`L'utilisateur à vérifier`)
          .setRequired(true)
      )
      .toJSON();
  }
}