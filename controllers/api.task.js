var mTask = require('../models/task.model');
const mongoose = require('mongoose');
const moment = require('moment');

require('dotenv').config();

let now = moment().format('YYYY-MM-DD HH:mm:ss');
var objReturn = {
    status: 1,
    msg: 'OK'
}

/**
 * Cập nhật đối tượng trả về.
 *
 * @param {number} a - Trạng thái.
 * @param {string} b - Thông báo.
 * @param {*} c - Dữ liệu trả về.
 */
const mFobjReturn = (a, b, c) => {
    objReturn.status = a;
    objReturn.msg = b;
    objReturn.data = c;
}

/**
 * Lấy thông tin nhiệm vụ theo ID.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.getById = async (req, res, next) => {

    objReturn.data = null;


    try {
        const Id = req.params.Id;

        if (!mongoose.Types.ObjectId.isValid(Id)) {
            mFobjReturn(0, 'Id không hợp lệ', null);

            return res.status(400).json(objReturn);
        }

        const task = await mTask.taskModel.findById(Id);

        if (task <= 0) {
            mFobjReturn(0, 'Không tìm thấy nhiệm vụ', null);

            return res.status(404).json(objReturn);
        } else {
            mFobjReturn(1, 'tìm thành công', task);

        }
    } catch (error) {
        mFobjReturn(0, error.message, null);

        return res.status(500).json(objReturn);

    }

    res.json(objReturn);
}

/**
 * Lấy thông tin nhiệm vụ theo User ID.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.getByUserId = async (req, res, next) => {
    objReturn.data = null;

    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            mFobjReturn(0, 'userId không hợp lệ', null);

            return res.status(400).json(objReturn);
        }

        const task = await mTask.taskModel.find({ UserID: userId });

        if (task <= 0) {
            mFobjReturn(0, 'Không tìm thấy nhiệm vụ', null);

            return res.status(404).json(objReturn);
        } else {
            mFobjReturn(1, 'tìm thành công', task);

        }
    } catch (error) {
        mFobjReturn(0, error.message, null);

        return res.status(500).json(objReturn);

    }

    res.json(objReturn);
}

/**
 * Thêm nhiệm vụ mới.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.addTask = async (req, res, next) => {
    objReturn.data = null;
    try {
        const { UserID, Desc, Deadline, Name } = req.body;

        if (!Desc || !Deadline || !UserID || !Name) {

            mFobjReturn(0, 'cách trường yêu cầu nhập đủ', null);

            return res.status(400).json(objReturn);
        }

        const newTask = new mTask.taskModel({
            UserID,
            Name,
            Desc,
            Image: req.file.path,
            CreateAt: now,
            Deadline,
            Status: 1
        });

        const saveTask = await newTask.save();
        mFobjReturn(1, 'task được thêm thành công ', saveTask);

    } catch (error) {

        mFobjReturn(0, error.message, null);
        return res.status(400).json(objReturn);

    }

    res.json(objReturn);
}

/**
 * Cập nhật nhiệm vụ theo ID.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.updateById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const taskId = req.params.taskId;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {

            mFobjReturn(0, 'taskId không hợp lệ', null);

            return res.status(400).json(objReturn);
        }

        const updateFields = req.body;

        if (req.file && req.file.path) {
            updateFields.Image = req.file.path;
        }

        delete updateFields.CreateAt;
        delete updateFields.UserID;

        const updateTask = await mTask.taskModel.findByIdAndUpdate(taskId, updateFields, { new: true });

        if (!updateTask) {

            mFobjReturn(0, 'Không tìm thấy hoặc đã bị xóa', null);

            return res.status(400).json(objReturn);
        } else {

            mFobjReturn(1, 'sửa thành công', updateTask);

        }
    } catch (error) {
        mFobjReturn(0, error.message, null);


        return res.status(400).json(objReturn);

    }

    res.json(objReturn);
}
/**
 * Xóa nhiệm vụ theo ID.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.deleteById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const taskId = req.params.taskId;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {

            mFobjReturn(0, 'taskId không hợp lệ', null);
            return res.status(400).json(objReturn);

        }

        const delCart = await mTask.taskModel.findByIdAndDelete(taskId);

        if (!delCart) {

            mFobjReturn(0, 'Không tìm thấy', null);
            return res.status(400).json(objReturn);

        } else {

            mFobjReturn(1, 'xóa thành công', delCart);

        }
    } catch (error) {

        mFobjReturn(0, error.message, null);
        return res.status(400).json(objReturn);

    }

    res.json(objReturn);
}


