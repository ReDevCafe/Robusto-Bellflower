import { Client, GatewayIntentBits, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } from 'discord.js';
import config from "../clientconfig.json";
import { DatabaseHandler } from "./database/DatabaseHandler";
import { MongoAdapter } from "./database/MongoAdapter"
import { CommandHandler } from "./commands/CommandHandler"

const client = new Client(
{
  intents: 
  [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers
  ]
});

// Je savais pas quelle base de données vous utiliseriez, donc j’ai préparé ça, aucune idée si ce sera utile, mais c’est ici :>
const database = new DatabaseHandler(new MongoAdapter(Bun.env.DATABASE_HOST));
const commandHandler = new CommandHandler(database);
const activeWelcomeCache = new Map();

client.once(Events.ClientReady, async () => 
{
  console.log(`${client.user.tag} is ready!`);
  await database.connect();
  console.log(`Database is ready!`);
});

client.on(Events.GuildMemberAdd, async (member) => 
{
  const channel = member.guild.channels.cache.get(config.channelId.toString());
  if(!channel) 
  {
    console.error(`Channel not found.`);
    return;
  }
  
  if(config.welcomeMessage.unique && await database.exist(member.id)) 
  {
    console.log(`Member ${member.user.username} already has a welcome message`);
    return;
  }
  
  const coffeeButton = new ButtonBuilder()
    .setCustomId('offer_coffee')
    .setLabel(config.welcomeMessage.button.label)
    .setStyle(ButtonStyle.Primary);
  
  if(config.welcomeMessage.button.iconId) coffeeButton.setEmoji(config.welcomeMessage.button.iconId);

  
  const content = config.welcomeMessage.content.replace('${newMember}', member.user.username);
  const row = new ActionRowBuilder().addComponents(coffeeButton);
  const message = await channel.send({ content: content, components: [row] });
  
  activeWelcomeCache.set(message.id, member.id);
});

client.on(Events.GuildMemberRemove, async (member) => 
{
  if(!config.welcomeMessage.deleteIfUserQuit) return;
  
  let messageIdToDelete = null;
  for (const [msgId, membId] of activeWelcomeCache.entries()) 
  {
    if (membId === member.id) 
    {
      messageIdToDelete = msgId;
      break;
    }
  }

  if(!messageIdToDelete) return;
  
  try 
  {
    const channel = member.guild.channels.cache.get(config.channelId.toString());
    const message = await channel.messages.fetch(messageIdToDelete);
    await message.delete();
    activeWelcomeCache.delete(messageIdToDelete);
  } catch (error) 
  {
    console.log(`Error while deleting message: ${error}`);
  }
});

client.on(Events.InteractionCreate, async (interaction) => 
{
  if(interaction.isButton()) 
  {
    if(interaction.customId !== 'offer_coffee') return;
    const messageId = interaction.message.id;
    const newMemberId = activeWelcomeCache.get(messageId);
    
    if(!newMemberId) 
    {
      await interaction.reply({ content: config.interaction.message.invalid, flags: MessageFlags.Ephemeral });
      return;
    }
    
    const fastClicker = interaction.user;
    if(fastClicker.id === newMemberId) 
    {
      await interaction.reply({ content: config.interaction.message.self, flags: MessageFlags.Ephemeral });
      return;
    }
    
    await interaction.message.delete();
    activeWelcomeCache.delete(messageId);
    
    await interaction.channel.send({ content: config.interaction.message.success
                                      .replace('${fastClicker}', `<@${fastClicker.username}>`)
                                      .replace('${newMember}', `<@${newMemberId}>`) 
    });
    await database.incrementCoffeeCount(fastClicker.id, newMemberId);
    await interaction.reply({ content: config.interaction.message.gifted, flags: MessageFlags.Ephemeral });
  }
  if(interaction.isChatInputCommand()) 
  {
    await commandHandler.handleCommand(interaction);
  }
});

client.login(Bun.env.DISCORD_TOKEN);