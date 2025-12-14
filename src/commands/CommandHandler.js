import { MessageFlags, PermissionFlagsBits } from 'discord.js';
import { ClassementCommand } from './CoffeeRankCommand';
import { WhoCoffedCommand } from './WhoCoffedCommand';
import config from '../../clientconfig.json';

export class CommandHandler 
{
  constructor(database) 
  {
    this.database = database;
    this.commands = new Map();
    
    this.registerCommand(new ClassementCommand(database));
    this.registerCommand(new WhoCoffedCommand(database));
  }
  
  registerCommand(command) 
  {
    this.commands.set(command.name, command);
  }
  
  async handleCommand(interaction) 
  {
    const command = this.commands.get(interaction.commandName);
    
    if(!command) 
    {
      await interaction.reply({ content: config.command.commandHandler.unknown, flags: MessageFlags.Ephemeral });
      return;
    }
    
    if(command.requiresAdmin && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) 
    {
      await interaction.reply({ content: config.command.commandHandler.noadmin, flags: MessageFlags.Ephemeral });
      return;
    }
    
    try 
    {
      await command.execute(interaction);
    } catch (error) 
    {
      console.error(`Error executing command ${command.name}:`, error);
      await interaction.reply({ content: config.command.commandHandler.failed, flags: MessageFlags.Ephemeral });
    }
  }
}