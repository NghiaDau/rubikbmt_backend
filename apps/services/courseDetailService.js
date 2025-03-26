const { ObjectId } = require("mongodb");
var config = require("./../../config/setting.json");
class CourseDetailService {
    databseConnection = require("./../database/database");
    courseDetail = require("./../entities/coursedetail");
    client;
    courseDatabase;
    courseCollection;
    cubeSubjectCollection;
    cubeSkillCollection;
    levelCollection;
    courseDetailCollection;
    userCollection;
    sessionCollection;
    constructor() {
        this.client = this.databseConnection.getMongoClient();
        this.courseDatabase = this.client.db(config.mongodb.database);
        this.courseDetailCollection = this.courseDatabase.collection("courseDetail");
        this.courseCollection = this.courseDatabase.collection("course");
        this.cubeSubjectCollection = this.courseDatabase.collection("cubeSubject");
        this.cubeSkillCollection = this.courseDatabase.collection("cubeSkill");
        this.levelCollection = this.courseDatabase.collection("level");
        this.userCollection = this.courseDatabase.collection("users");
        this.sessionCollection = this.courseDatabase.collection("session");
    }

    async addCourseDetail(courseDetail, sessions) {
        try {
            // Thêm CourseDetail vào database
            const result = await this.courseDetailCollection.insertOne(courseDetail);
            const courseDetailId = result.insertedId;
            console.log("sessions:", sessions);
            if (!sessions || sessions.length === 0) {
                return result;
            }
            
            // Chuẩn bị danh sách sessions để chèn vào
            let sessionsToInsert = sessions.map(session => ({
                ...session,
                idCourseDetail: courseDetailId
            }));
            console.log("sessionsToInsert:", sessionsToInsert);
            // Chèn tất cả session cùng lúc (tránh await trong vòng lặp)
            const sessionInsertResult = await this.sessionCollection.insertMany(sessionsToInsert);

            // Lấy danh sách _id của session mới
            const listSessionIds = Object.values(sessionInsertResult.insertedIds);

            // Cập nhật lại danh sách session trong CourseDetail
            await this.courseDetailCollection.updateOne(
                { _id: courseDetailId },
                { $set: { session: listSessionIds } }
            );

            return result;
        } catch (error) {
            console.error("Lỗi khi thêm CourseDetail:", error);
            throw new Error("Không thể thêm CourseDetail");
        }
    }

    async getCourseDetailById(id) {
        try {
            // Lấy CourseDetail theo ID
            let courseDetail = await this.courseDetailCollection.findOne({ _id: new ObjectId(id) });

            if (!courseDetail) {
                throw new Error("CourseDetail không tồn tại");
            }

            // Lấy thông tin `course`, `student`, `teacher` từ ID
            let [course, student, teacher] = await Promise.all([
                this.courseCollection.findOne({ _id: new ObjectId(courseDetail.course) }),
                this.userCollection.findOne({ _id: new ObjectId(courseDetail.student) }),
                this.userCollection.findOne({ _id: new ObjectId(courseDetail.teacher) })
            ]);

            // Lấy danh sách `session` từ danh sách ID trong `courseDetail`
            let sessions = await this.sessionCollection.find({
                _id: { $in: courseDetail.session.map(id => new ObjectId(id)) }
            }).toArray();

            // Trả về dữ liệu đã ghép nối
            return {
                _id: courseDetail._id,
                actualFee: courseDetail.actualFee,
                Paid: courseDetail.Paid,
                numberOfStudied: courseDetail.numberOfStudied,
                course: course || null,
                student: student || null,
                teacher: teacher || null,
                evaluation: courseDetail.evaluation || [],
                session: sessions
            };
        } catch (error) {
            console.error("Lỗi khi lấy CourseDetail:", error);
            throw new Error("Không thể lấy thông tin CourseDetail");
        }
    }

    async updateCourseDetail(courseDetail) {
        return await this.courseDetailCollection.updateOne({ _id: new ObjectId(courseDetail._id) }, { $set: courseDetail });
    }

}
module.exports = CourseDetailService;