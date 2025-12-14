import { EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { BaseCommand } from './BaseCommand';
import config from '../../clientconfig.json';

export class ClassementCommand extends BaseCommand 
{
  constructor(database) 
  {
    super('coffeerank', 'Affiche le classement des cafés offerts', true);
    this.database = database;
  }
  
  async execute(interaction) 
  {
    const rankSize = interaction.options.getInteger('rank_size');
    const leaderboard = await this.database.getLeaderboard(rankSize ?? 10);

    if (leaderboard.length === 0) 
    {
      await interaction.reply({ content: config.command.coffeeRank.nocoffee, flags: MessageFlags.Ephemeral });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(config.command.coffeeRank.color)
      .setTitle(config.command.coffeeRank.title)
      .setDescription(
        leaderboard.map((user, index) => 
        {
          const count = user.coffeeCount;
          return `**${index + 1}.** <@${user.userId}> - ${count} café${count > 1 ? 's' : ''}`;
        }).join('\n')
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
  
  toJSON() 
  {
    return new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addIntegerOption(option =>
        option
          .setName(`rank_size`)
          .setDescription(`Taille du classement`)
          .setRequired(false)
          .setMinValue(10)
          .setMaxValue(50)
          
      )
      .toJSON();
  }
}