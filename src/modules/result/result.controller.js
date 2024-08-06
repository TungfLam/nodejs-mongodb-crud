const resultService = require('./result.service');
const userModel = require('../user/user.model');
const jwt = require('jsonwebtoken');

// Hàm lấy danh sách kết quả khi được submit của mỗi task
const getResultsUserTasks = async (req, res) => {
    try {
        const task_id = req.params.task_id;
        const { limit, page, ...query } = req.query;

        // Kiểm tra id task tồn tại hay không
        if (!task_id) {
            throw new Error('Không tìm thấy id của task!');
        }

        // Biến nhận kết quả trả về từ resultService
        const response = await resultService.getResultsUserTasks(
            task_id,
            Number(limit) || 10,
            Number(page) || 1,
            query,
        );
        return res.status(200).json(response);
    } catch (e) {
        return res.status(400).json({
            message: e.message || e,
        });
    }
};

// Hàm tạo mới 1 bản ghi khi submit result
const createResultsUserTask = async (req, res) => {
    try {
        const task_id = req.params.task_id;
        const body = { ...req.body };
        const { user_id, description, score, outcome, ...data } = body;
        const outcome_exam = [
            'failure',
            'partial success',
            'pending review',
            'success',
        ];
        const files = req?.files;
        // Kiểm tra user_id có giá trị ko
        if (!user_id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'không tìm thấy user_id',
            });
        }
        // Kiểm tra description có giá trị ko
        if (!description) {
            return res.status(400).json({
                status: 'ERR',
                message: 'không tìm thấy description',
            });
        }
        // Kiểm tra trường điểm có phải dạng number không
        if (typeof Number(score) !== 'number') {
            return res.status(400).json({
                status: 'ERR',
                message: 'score phải là số',
            });
        }
        // Kiểm tra socre có trong khoảng quy định không
        if (typeof Number(score) > 0 && Number(score) < 100) {
            return res.status(400).json({
                status: 'ERR',
                message: 'score phải lớn hơn 0 và nhỏ hơn 100',
            });
        }
        // Kiểm tra outcome có thuộc phần tử trong mẫu cho trước không
        if (!outcome_exam.includes(outcome)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'outcome phải là 1 trong những dữ liệu có sẵn',
            });
        }

        // chuyển sang file service để xử lý
        const response = await resultService.createResultsUserTask(
            files,
            body,
            task_id,
        );
        return res.status(200).json(response);
    } catch (e) {
        return res.status(400).json({
            message: e,
        });
    }
};

// Hàm lấy chi tiết dữ liệu của 1 result
const getDetailResultsUserTask = async (req, res) => {
    try {
        const result_id = req.params.result_id;
        if (!result_id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'không tìm thấy result_id',
            });
        }
        // chuyển sang file service để xử lý
        const response =
            await resultService.getDetailResultsUserTask(result_id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(404).json({
            message: e,
        });
    }
};

const updateResultsUserTask = async (req, res) => {
    try {
        const result_id = req.params.result_id;
        const data = { ...req.body };
        const files = req.files;
        const outcome_exam = [
            'failure',
            'partial success',
            'pending review',
            'success',
        ];
        console.log('test');
        // Kiểm tra description có giá trị ko
        if (!data.description) {
            return res.status(400).json({
                status: 'ERR',
                message: 'không tìm thấy description',
            });
        }
        // Kiểm tra trường điểm có phải dạng number không
        if (!data.score) {
            return res.status(400).json({
                status: 'ERR',
                message: 'không tìm thấy score',
            });
        }
        data.score = Number(data.score);
        if (typeof data.score !== 'number') {
            return res.status(400).json({
                status: 'ERR',
                message: 'score phải là số',
            });
        }
        // Kiểm tra outcome có thuộc phần tử trong mẫu cho trước không
        if (!outcome_exam.includes(data.outcome)) {
            return res.status(400).json({
                status: 'ERR',
                message: 'outcome phải là 1 trong những dữ liệu có sẵn',
            });
        }

        // chuyển sang file service để xử lý
        const response = await resultService.updateResultsUserTask(
            files,
            result_id,
            data,
        );
        return res.status(200).json(response);
    } catch (error) {
        return res.status(400).json({
            message: error,
        });
    }
};

// Hàm xóa result đã submit
const deleteResultsUserTask = async (req, res) => {
    try {
        const result_id = req.params.result_id;
        // delete_by đợi lâm nó làm lại user

        // const token = req.headers.token.split(' ')[1];
        // const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        // const delete_by = await userModel.findOne({ _id: decoded.id }, 'id');

        // Kiểm tra result_id có tồn tại không
        if (!result_id) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Không tìm thấy result_id',
            });
        }
        // chuyển sang file service để xử lý
        const response = await resultService.deleteResultsUserTask(result_id);
        return res.status(200).json(response);
    } catch (e) {
        return res.status(400).json({
            message: e,
        });
    }
};

module.exports = {
    getResultsUserTasks,
    createResultsUserTask,
    updateResultsUserTask,
    deleteResultsUserTask,
    getDetailResultsUserTask,
};
