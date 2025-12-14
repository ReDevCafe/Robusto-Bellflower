import mongoose from 'mongoose';

const CoffeeSchem = new mongoose.Schema(
{
  userId:      { type: String, required: true, unique: true },
  coffed:      { type: String, default: "0" },
  coffeeCount: { type: Number, default: 0 },
});

const CoffeeModel = mongoose.model('coffee', CoffeeSchem);

class MongoAdapter
{
  constructor(connectionString)
  {
    this.connectionString = connectionString;
  }  

  async connect()
  {
    await mongoose.connect(this.connectionString);
  }

  async disconnect()
  {
    await mongoose.disconnect();
  }

  async incrementCoffeeCount(userIdFrom, userIdTo)
  {
    await CoffeeModel.findOneAndUpdate
    (
      { userId: userIdFrom },
      { $inc: { coffeeCount: 1 }},
      { upsert: true, new: true }
    );

    await CoffeeModel.findOneAndUpdate
    (
      { userId: userIdTo },
      { $set: { coffed: userIdFrom } },
      { upsert: true, new: true }
    );

    return true;
  }

  async getLeaderboard(limit = 10) 
  {
    const results = await CoffeeModel
      .find()
      .sort({ coffeeCount: -1 })
      .limit(limit)
      .lean();
    return results;
  }

  async getUserCoffeeCount(userId) 
  {
    const user = await CoffeeModel.findOne({ userId }).lean();
    return user ? user.coffeeCount : 0;
  }

  async getUserData(userId) 
  {
    const user = await CoffeeModel.findOne({ userId }).lean();
    return user;
  }

  async exist(userId) 
  {
    const user = await CoffeeModel.findOne({ userId }).lean();
    return user !== null;
  }
}

export { MongoAdapter };