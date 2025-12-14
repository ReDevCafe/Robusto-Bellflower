const { REST, Routes } = require('discord.js');
const { DatabaseHandler } = require('./src/database/DatabaseHandler');
const { MongoAdapter } = require('./src/database/MongoAdapter');
const { ClassementCommand } = require('./src/commands/CoffeeRankCommand');
const { WhoCoffedCommand } = require('./src/commands/WhoCoffedCommand');

const database = new DatabaseHandler(new MongoAdapter(process.env.MONGODB_URI));

const commands = 
[
  new ClassementCommand(database).toJSON(),
  new WhoCoffedCommand(database).toJSON(),
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => 
{
  try 
  {
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID),{ body: commands });
    console.log('Commands deployed!');
  } catch (error) 
  {
    console.error('Error:', error);
  }
})();
