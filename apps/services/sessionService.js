const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class SessionService {
  databseConnection = require("./../database/database");
  session = require("./../entities/session");
  client;
  sessionDatabase;
  sessionCollection;
  courseDetailCollection;
  constructor() {
    this.client = this.databseConnection.getMongoClient();
    this.sessionDatabase = this.client.db(config.mongodb.database);
    this.sessionCollection = this.sessionDatabase.collection("session");
    this.courseDetailCollection =
      this.sessionDatabase.collection("courseDetail");
  }
  async addSession(session) {
    return await this.sessionCollection.insertOne(session);
  }
  async getListSession() {
    var result = await this.sessionCollection.find().toArray();
    //duyet qua tung session de lay ten courseDetail
    for (let i = 0; i < result.length; i++) {
      const courseDetail = await this.courseDetailCollection.findOne({
        _id: new ObjectId(result[i].idCourseDetail),
      });
      result[i].courseDetail = courseDetail;
    }
    return result;
  }
  async getSessionByCourseDetailId(id) {
    var result = await this.sessionCollection
      .find({ idCourseDetail: new ObjectId(id) })
      .toArray();
    //duyet qua tung session de lay ten courseDetail
    for (let i = 0; i < result.length; i++) {
      const courseDetail = await this.courseDetailCollection.findOne({
        _id: new ObjectId(result[i].idCourseDetail),
      });
      result[i].courseDetail = courseDetail;
    }

    return result;
  }
  async getSessionById(id) {
    var result = await this.sessionCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!result) {
      return null;
    }
    var courseDetail = await this.courseDetailCollection.findOne({
      _id: new ObjectId(result.idCourseDetail),
    });
    result.courseDetail = courseDetail;
    return result;
  }
  async updateSession(session) {
    const { _id, ...updateData } = session; // Exclude _id from the update data
    return await this.sessionCollection.updateOne(
      { _id: new ObjectId(_id) }, // Use _id for the query
      { $set: updateData } // Only update the other fields
    );
  }
  async deleteSession(id) {
    return await this.sessionCollection.deleteOne({ _id: new ObjectId(id) });
  }
}
module.exports = SessionService;
