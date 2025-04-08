var config = require("./../../config/setting.json");
class DatabaseConnection {
  url;
  user;
  pass;
  constructor() {}
  static getMongoClient() {
    this.user = config.mongodb.username;
    this.pass = config.mongodb.password;
    this.url = `mongodb://localhost:27017/`;
    // this.url = `mongodb+srv://${this.user}:${this.pass}@cluster1.7fyah.mongodb.net/?retryWrites=true&w=majority`;
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(this.url);
    return client;
  }
}

module.exports = DatabaseConnection;
