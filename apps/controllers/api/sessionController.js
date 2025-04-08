var express = require("express");
var router = express.Router();
var Session = require("./../../entities/session");
var SessionService = require("./../../services/sessionService");
var verifyToken = require("./../../utils/verifyToken");
var validateObjectId = require("./../../utils/validateObjectId");

class SessionController {
    constructor() {
        this.sessionService = new SessionService();
    }

    async addSession(req, res) {
        try {
            var { name, startTime, endTime, idcourseDetail } = req.body;
            var session = new Session(name, startTime, endTime, idcourseDetail);
            var result = await this.sessionService.addSession(session);

            res.status(201).json({
                status: true,
                message: "Thêm session thành công",
                data: { session: result },
            });
        } catch (error) {
            console.error("Lỗi ở /add:", error);
            res.status(500).json({
                status: false,
                message: "Xảy ra lỗi trên Server",
                error: error.message
            });
        }
    }
    async getListSession(req, res) {
        try {
            var result = await this.sessionService.getListSession();
            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Không tìm thấy session"
                });
            }
            res.status(200).json({
                status: true,
                message: "Lấy danh sách session thành công",
                data: { sessions: result },
            });
        } catch (error) {
            console.error("Lỗi ở /get-list:", error);
            res.status(500).json({
                status: false,
                message: "Xảy ra lỗi trên Server",
                error: error.message
            });
        }
    }

    async getSessionByCourseDetailId(req, res) {
        try {
            var result = await this.sessionService.getSessionByCourseDetailId(req.query.id);
            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Không tìm thấy session"
                });
            }
            res.status(200).json({
                status: true,
                message: "Lấy danh sách session thành công",
                data: { sessions: result },
            });
        } catch (error) {
            console.error("Lỗi ở /get:", error);
            res.status(500).json({
                status: false,
                message: "Xảy ra lỗi trên Server",
                error: error.message
            });
        }
    }
    async getSessionById(req, res) {
        try {
            var result = await this.sessionService.getSessionById(req.query.id);
            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Không tìm thấy session"
                });
            }
            res.status(200).json({
                status: true,
                message: "Lấy session thành công",
                data: { session: result },
            });
        } catch (error) {
            console.error("Lỗi ở /get:", error);
            res.status(500).json({
                status: false,
                message: "Xảy ra lỗi trên Server",
                error: error.message
            });
        }
    }
    async updateSession(req, res) {
        try {
            var { id, name, startTime, endTime, courseDetail } = req.body;
            var session = new Session(name, startTime, endTime, courseDetail);
            session._id = id;
            var result = await this.sessionService.updateSession(session);

            res.status(200).json({
                status: true,
                message: "Cập nhật session thành công",
                data: { session: result },
            });
        } catch (error) {
            console.error("Lỗi ở /update:", error);
            res.status(500).json({
                status: false,
                message: "Xảy ra lỗi trên Server",
                error: error.message
            });
        }
    }
    async deleteSession(req, res) {
        try {
            var result = await this.sessionService.deleteSession(req.query.id);
            if (!result) {
                return res.status(404).json({
                    status: false,
                    message: "Không tìm thấy session"
                });
            }
            res.status(200).json({
                status: true,
                message: "Xóa session thành công",
                data: { session: result },
            });
        } catch (error) {
            console.error("Lỗi ở /delete:", error);
            res.status(500).json({
                status: false,
                message: "Xảy ra lỗi trên Server",
                error: error.message
            });
        }
    }
}
module.exports = router;
