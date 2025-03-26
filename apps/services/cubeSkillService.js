const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class CubeSkillService {
    databseConnection = require("./../database/database");
    cubeSkill = require("../entities/cubeskill");
    client;
    cubeSkillDatabase;
    cubeSkillCollection;
    cubeSubjectCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.cubeSkillDatabase = this.client.db(config.mongodb.database);
        this.cubeSkillCollection = this.cubeSkillDatabase.collection("cubeSkill");
        this.cubeSubjectCollection = this.cubeSkillDatabase.collection("cubeSubject");
    }

    async addCubeSkill(cubeSkill) {
        return await this.cubeSkillCollection.insertOne(cubeSkill);
    }
    async getCubeSkills() {
        var cubeSkills = await this.cubeSkillCollection.find().toArray();
        // Duyệt từng CubeSubject để lấy danh sách cubeSkills
        for (let cubeSkill of cubeSkills) {
            const skillIds = cubeSkill.cubeSubject.map(id => new ObjectId(id));

            // Truy vấn danh sách cubeSkills theo skillIds
            const cubeSubjects = await this.cubeSubjectCollection
                .find({ _id: { $in: skillIds } })
                .project({ name: 1 }) // Chỉ lấy field "name"
                .toArray();

            cubeSkill.cubeSubject = cubeSubjects; // Gán danh sách cubeSkills vào CubeSubject
        }

        return cubeSkills;
    }
    async getCubeSkillById(id) {
        return await this.cubeSkillCollection.findOne({ _id: new ObjectId(id) });
    }
    async updateCubeSkill(cubeSkill) {
        return await this.cubeSkillCollection.updateOne({ _id: ObjectId(cubeSkill._id) }, { $set: cubeSkill });
    }
    async deleteCubeSkill(id) {
        return await this.cubeSkillCollection.deleteOne({ _id: ObjectId(id) });
    }
    async getCubeSkillNameById(id) {
        return await this.cubeSkillCollection.findOne({ _id: new ObjectId(id) }).select(" name");
    }
}
module.exports = CubeSkillService; 