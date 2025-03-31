const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class CubeSubjectService {
    databseConnection = require("./../database/database");
    cubeSubject = require("../entities/cubesubject");
    client;
    cubeSubjectDatabase;
    cubeSubjectCollection;
    cubeSkillCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.cubeSubjectDatabase = this.client.db(config.mongodb.database);
        this.cubeSubjectCollection = this.cubeSubjectDatabase.collection("cubeSubject");
        this.cubeSkillCollection = this.cubeSubjectDatabase.collection("cubeSkill");
    }

    async addCubeSubject(cubeSubject) {
        var objCubeSkill = cubeSubject.cubeSkills.map(id => new ObjectId(id));
        // Chuyển danh sách cubeSkills thành ObjectId
        cubeSubject.cubeSkills = objCubeSkill;
        var result = await this.cubeSubjectCollection.insertOne(cubeSubject);
        // Cập nhật CubeSkill: thêm CubeSubject vào danh sách cubeSubject của CubeSkill

        await this.cubeSkillCollection.updateMany(
            { _id: { $in: cubeSubject.cubeSkills.map(id => new ObjectId(id)) } },
            { $addToSet: { cubeSubject: cubeSubject._id } }
        );
        return result;
    }
    async getCubeSubjects() {
        const cubeSubjects = await this.cubeSubjectCollection.find().toArray();

        // Duyệt từng CubeSubject để lấy danh sách cubeSkills
        for (let cubeSubject of cubeSubjects) {
            const skillIds = cubeSubject.cubeSkills.map(id => new ObjectId(id));

            // Truy vấn danh sách cubeSkills theo skillIds
            const cubeSkills = await this.cubeSkillCollection
                .find({ _id: { $in: skillIds } })
                .project({ name: 1 }) // Chỉ lấy field "name"
                .toArray();

            cubeSubject.cubeSkills = cubeSkills; // Gán danh sách cubeSkills vào CubeSubject
        }

        return cubeSubjects;
    }

    async getCubeSubjectById(id) {

        // Tìm CubeSubject
        const cubeSubject = await this.cubeSubjectCollection.findOne({ _id: new ObjectId(id) });
        if (!cubeSubject) return null;

        // Chuyển danh sách cubeSkills thành ObjectId
        const skillIds = cubeSubject.cubeSkills.map(skillId => new ObjectId(skillId));

        // Lấy danh sách cubeSkills từ MongoDB
        const cubeSkills = await this.cubeSkillCollection
            .find({ "_id": { $in: skillIds } })
            .project({ "name": 1 }) // Chỉ lấy trường "name"
            .toArray();

        // Gán danh sách cubeSkills vào cubeSubject
        cubeSubject.cubeSkills = cubeSkills;

        return cubeSubject;

    }
    async updateCubeSubject(cubeSubject) {
        const { _id, name, cubeSkills } = cubeSubject;

        // Chuyển danh sách cubeSkills thành ObjectId
        const skillIds = cubeSkills.map(id => new ObjectId(id));
        // 1️⃣ Cập nhật CubeSubject
        const result = await this.cubeSubjectCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: { name, cubeSkills: skillIds } }
        );;
        // 2️⃣ Xóa CubeSubject khỏi tất cả CubeSkill cũ trước khi cập nhật mới
        await this.cubeSkillCollection.updateMany(
            { cubeSubject: new ObjectId(_id) },
            { $pull: { cubeSubject: new ObjectId(_id) } }
        );
        // Cập nhật CubeSkill: thêm CubeSubject vào danh sách cubeSubject của CubeSkill
        await this.cubeSkillCollection.updateMany(
            { _id: { $in: cubeSkills.map(id => new ObjectId(id)) } },
            { $addToSet: { cubeSubject: new ObjectId(_id) } }
        );
        return result;
    }
    async deleteCubeSubject(id) {
        return await this.cubeSubjectCollection.deleteOne({ _id: ObjectId(id) });
    }
    async getCubeSubjectNameById(id) {
        return await this.cubeSubjectCollection.findOne({ _id: new ObjectId(id) }).select(" name");
    }
    async searchCubeSubjects(search, skip, limit) {
        var query = search ? { name: { $regex: search, $options: "i" } } : {}; // Tìm kiếm không phân biệt hoa thường
        var result = await this.cubeSubjectCollection.find(query).skip(skip).limit(limit);
        return result.toArray();

    }
    async countCubeSubject(search) {
        const query = search ? { name: { $regex: search, $options: "i" } } : {};
        return await this.cubeSubjectCollection.countDocuments(query);
    }

}
module.exports = CubeSubjectService;