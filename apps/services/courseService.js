const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class CourseService {
    databseConnection = require("./../database/database");
    course = require("./../entities/course");
    client;
    courseDatabase;
    courseCollection;
    cubeSubjectCollection;
    cubeSkillCollection;
    levelCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.courseDatabase = this.client.db(config.mongodb.database);
        this.courseCollection = this.courseDatabase.collection("course");
        this.cubeSubjectCollection = this.courseDatabase.collection("cubeSubject");
        this.cubeSkillCollection = this.courseDatabase.collection("cubeSkill");
        this.levelCollection = this.courseDatabase.collection("level");
    }

    async addCourse(course) {

        // 1️⃣ Chạy song song 2 truy vấn lấy Level và CubeSubject
        const [level, cubeSubject] = await Promise.all([
            this.levelCollection.findOne({ _id: new ObjectId(course.level) }),
            this.cubeSubjectCollection.findOne({ _id: new ObjectId(course.cubeSubject) })
        ]);

        if (!level) throw new Error("Level không tồn tại");
        if (!cubeSubject) throw new Error("CubeSubject không tồn tại");

        // 2️⃣ Gán trực tiếp Level vào course
        course.level = {
            _id: level._id,
            name: level.name
        };

        // 3️⃣ Lấy danh sách CubeSkill (nếu có)
        const cubeSkillIds = (cubeSubject.cubeSkills || []).map(id => new ObjectId(id));
        const cubeSkills = cubeSkillIds.length > 0
            ? await this.cubeSkillCollection.find({ _id: { $in: cubeSkillIds } }).toArray()
            : [];

        // 4️⃣ Gán CubeSkills với progress = 0
        const cubeSkillsObject = cubeSkills.map(skill => ({
            _id: skill._id,
            name: skill.name
        }));

        // 5️⃣ Gán CubeSubject vào course
        course.cubeSubject = {
            _id: cubeSubject._id,
            name: cubeSubject.name,
            cubeSkills: cubeSkillsObject
        };

        // 6️⃣ Lưu vào DB
        return await this.courseCollection.insertOne(course);

    }

    async getCourses() {
        return await this.courseCollection.find().toArray();
    }
    async getCourseById(id) {
        return await this.courseCollection.findOne({ _id: new ObjectId(id) });
    }
    async updateCourse(course) {
        return await this.courseCollection.updateOne({ _id: ObjectId(course._id) }, { $set: course });
    }
    async deleteCourse(id) {
        return await this.courseCollection.deleteOne({ _id: ObjectId(id) });
    }
}
module.exports = CourseService;