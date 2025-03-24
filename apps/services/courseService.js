const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class CourseService {
    databseConnection = require("./../database/database");
    course = require("./../entities/course");
    client;
    courseDatabase;
    courseCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.courseDatabase = this.client.db(config.mongodb.database);
        this.courseCollection = this.courseDatabase.collection("course");
    }

    async addCourse(course) {
        return await this.courseCollection.insertOne(course);
    }
    async getCourses() {
        return await this.courseCollection.find().toArray();
    }
    async getCourseById(id) {
        return await this.courseCollection.findOne({ _id: new ObjectId(id)});
    }
    async updateCourse(course) {
        return await this.courseCollection.updateOne({ _id: ObjectId(course._id) }, { $set: course });
    }
    async deleteCourse(id) {
        return await this.courseCollection.deleteOne({ _id: ObjectId(id) });
    }
}
module.exports = CourseService;