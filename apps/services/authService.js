const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class AuthService {
  databseConnection = require("./../database/database");
  user = require("./../entities/user");
  client;
  userDatabase;
  userCollection;
  constructor() {
    this.client = this.databseConnection.getMongoClient();
    this.userDatabase = this.client.db(config.mongodb.database);
    this.userCollection = this.userDatabase.collection("user");
  }

  async register(user) {
    return await this.userCollection.insertOne(user);
  }
}
module.exports = AuthService;
