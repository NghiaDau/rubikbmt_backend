const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class CubeSubjectService {
    databseConnection = require("./../database/database");
    cubeSubject = require("../entities/cubesubject");
    client;
    cubeSubjectDatabase;
    cubeSubjectCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.cubeSubjectDatabase = this.client.db(config.mongodb.database);
        this.cubeSubjectCollection = this.cubeSubjectDatabase.collection("cubeSubject");
    }

    async addCubeSubject(cubeSubject) {
        return await this.cubeSubjectCollection.insertOne(cubeSubject);
    }
    async getCubeSubjects() {
        return await this.cubeSubjectCollection.find().toArray();
    }
    async getCubeSubjectById(id) {
        return await this.cubeSubjectCollection.findOne({ _id: new ObjectId(id) });
    }
    async updateCubeSubject(cubeSubject) {
        return await this.cubeSubjectCollection.updateOne({ _id: ObjectId(cubeSubject._id) }, { $set: cubeSubject });
    }
    async deleteCubeSubject(id) {
        return await this.cubeSubjectCollection.deleteOne({ _id: ObjectId(id) });
    }
}
module.exports = CubeSubjectService;