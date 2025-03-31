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
            var course = await this.courseCollection.findOne({ _id: new ObjectId(courseDetail.course) });
            if (sessions.length === 0 || sessions.length != course.numOfSessions) {
                throw new Error("Số lượng session không hợp lệ");
            }

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

            // Thêm CourseDetail vào danh sách courseDetail của Course
            await this.courseCollection.updateOne(
                { _id: new ObjectId(courseDetail.course) },
                { $addToSet: { courseDetail: courseDetailId } });

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

            const evaluationDetails = [];
            for (let evalItem of courseDetail.evaluation) {
                const cubeSkill = await this.cubeSkillCollection.findOne({ _id: new ObjectId(evalItem.idCubeSkill) });
                if (cubeSkill) {
                    evaluationDetails.push({
                        idCubeSkill: cubeSkill._id,
                        name: cubeSkill.name,
                        rate: evalItem.rate
                    });
                }
            }
            // Trả về dữ liệu đã ghép nối
            return {
                _id: courseDetail._id,
                actualFee: courseDetail.actualFee,
                Paid: courseDetail.Paid,
                numberOfStudied: courseDetail.numberOfStudied,
                course: course || null,
                student: student || null,
                teacher: teacher || null,
                evaluation: evaluationDetails|| [],
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

    async evaluateCourseDetail(id, evaluations) {
        try {
            // Kiểm tra xem CourseDetail có tồn tại không
            const courseDetail = await this.courseDetailCollection.findOne({ _id: new ObjectId(id) });
            if (!courseDetail) {
                throw new Error("CourseDetail không tồn tại");
            }

            // Duyệt qua danh sách đánh giá và cập nhật từng CubeSkill
            for (let evaluation of evaluations) {
                const idCubeSkill = new ObjectId(evaluation.idCubeSkill);
                const rate = evaluation.rate;

                await this.courseDetailCollection.updateOne(
                    {
                        _id: courseDetail._id,
                        "evaluation.idCubeSkill": idCubeSkill // Kiểm tra CubeSkill đã có chưa
                    },
                    {
                        $set: { "evaluation.$.rate": rate } // Cập nhật rate nếu đã tồn tại
                    }
                );

                // Nếu CubeSkill chưa có, thêm mới vào danh sách
                await this.courseDetailCollection.updateOne(
                    {
                        _id: courseDetail._id,
                        "evaluation.idCubeSkill": { $ne: idCubeSkill } // Chỉ thêm nếu chưa tồn tại
                    },
                    {
                        $push: { evaluation: { idCubeSkill, rate } }
                    }
                );
            }

            return { message: "Đánh giá cập nhật thành công" };
        } catch (error) {
            console.error("Lỗi khi đánh giá CourseDetail:", error);
            throw new Error("Không thể cập nhật đánh giá CourseDetail");
        }
    }

    async search(search, skip, limit) {
        const query = search ? { name: { $regex: search, $options: "i" } } : {}; // Tìm kiếm không phân biệt hoa thường
        var result =  await this.courseDetailCollection.find(query).skip(skip).limit(limit);
        return result.toArray();
    }
    async countCourseDetail(search) {
        const query = search ? { name: { $regex: search, $options: "i" } } : {};
        return await this.courseDetailCollection.countDocuments(query);
    }


}

module.exports = CourseDetailService;