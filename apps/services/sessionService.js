const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class SessionService {
    databseConnection = require("./../database/database");
    session = require("./../entities/session");
    client;
    courseDatabase;
    sessionCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.courseDatabase = this.client.db(config.mongodb.database);
        this.sessionCollection = this.courseDatabase.collection("session");
    }
    async addSession(session) {
        return await this.sessionCollection.insertOne(session);
    }
    async getListSession() {
        var result = await this.sessionCollection.find().toArray();
        //duyet qua tung session de lay ten courseDetail
        for (let i = 0; i < result.length; i++) {
            const courseDetail = await this.courseDetailCollection.findOne({ _id: new ObjectId(result[i].idCourseDetail) });
            result[i].courseDetail = courseDetail;
        }
        return result;
    }
    async getSessionByCourseDetailId(id) {
        var result = await this.sessionCollection.find({ idCourseDetail: id }).toArray();
        //duyet qua tung session de lay ten courseDetail
        for (let i = 0; i < result.length; i++) {
            const courseDetail = await this.courseDetailCollection.findOne({ _id: new ObjectId(result[i].idCourseDetail) });
            result[i].courseDetail = courseDetail;
        }
        return result;
    }
    async getSessionById(id) {
        result = await this.sessionCollection.findOne({ _id: new ObjectId(id) });
        var courseDetail = await this.courseDetailCollection.findOne({ _id: new ObjectId(result.idCourseDetail) });
        result.courseDetail = courseDetail;
        return result;
    }
    async updateSession(session) {
        return await this.sessionCollection.updateOne({ _id: ObjectId(session._id) }, { $set: session });
    }
    async deleteSession(id) {
        return await this.sessionCollection.deleteOne({ _id: ObjectId(id) });
    }
}
module.exports = SessionService;