export class BaseCommand 
{
  constructor(name, description, requiresAdmin = false) 
  {
    this.name = name;
    this.description = description;
    this.requiresAdmin = requiresAdmin;
  }
  
  async execute(interaction) 
  {
    throw new Error('Execute method must be implemented');
  }
  
  toJSON() 
  {
    throw new Error('toJSON method must be implemented');
  }
}