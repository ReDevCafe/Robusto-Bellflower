export class DatabaseHandler
{
  constructor(adapter)
  {
    this.adapter = adapter;
  }

  async connect() 
  {
    return this.adapter.connect();
  }

  async disconnect() 
  {
    return this.adapter.disconnect();
  }

  async incrementCoffeeCount(userIdFrom, userIdTo) 
  {
    return this.adapter.incrementCoffeeCount(userIdFrom, userIdTo);
  }

  async getLeaderboard(limit = 10) 
  {
    return this.adapter.getLeaderboard(limit);
  }

  async getUserCoffeeCount(userId) 
  {
    return this.adapter.getUserCoffeeCount(userId);
  }

  async getUserData(userId) 
  {
    return this.adapter.getUserData(userId);
  }

  async exist(userId)
  {
    return this.adapter.exist(userId);
  }
}