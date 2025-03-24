const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class LevelService {
    databseConnection = require("./../database/database");
    level = require("./../entities/level");
    client;
    levelDatabase;
    levelCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.levelDatabase = this.client.db(config.mongodb.database);
        this.levelCollection = this.levelDatabase.collection("level");
    }

    async addLevel(level) {
        return await this.levelCollection.insertOne(level);
    }
    async getLevels() {
        return await this.levelCollection.find().toArray();
    }
    async getLevelById(id) {
        return await this.levelCollection.findOne({ _id:new ObjectId(id) });
    }
    async updateLevel(level) {
        return await this.levelCollection.updateOne({ _id: ObjectId(level._id) }, { $set: level });
    }
    async deleteLevel(id) {
        return await this.levelCollection.deleteOne({ _id: ObjectId(id) });
    }
}
module.exports = LevelService;