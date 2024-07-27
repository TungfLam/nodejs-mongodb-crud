var mTask = require('./task.model');
const mongoose = require('mongoose');
const moment = require('moment');

require('dotenv').config();

let now = moment().format('YYYY-MM-DD HH:mm:ss');
var objReturn = {
    status: 1,
    msg: 'OK'
}
const mFobjReturn = (s, m, d) => {
    objReturn.status = s;
    objReturn.msg = m;
    objReturn.data = d;
}
const getById = async (req, res, next) => {

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
const getByUserId = async (req, res, next) => {
    objReturn.data = null;

    try {
        const userId = req.params.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            mFobjReturn(0, 'userId không hợp lệ', null);

            return res.status(400).json(objReturn);
        }

        const task = await mTask.taskModel.find({ user_id: userId });

        if (task.length <= 0) {
            mFobjReturn(0, 'Không tìm thấy nhiệm vụ', null);

            return res.status(404).json(objReturn);
        }

        mFobjReturn(1, 'tìm thành công', task);


    } catch (error) {
        mFobjReturn(0, error.message, null);

        return res.status(500).json(objReturn);

    }

    res.json(objReturn);
}
const addTask = async (req, res, next) => {
    objReturn.data = null;
    try {
        const { user_id, name, desc, image, deadline, status, create_by, tags } = req.body;


        if (!user_id || !name || !desc || !deadline || status === undefined || !create_by) {
            mFobjReturn(0, 'cách trường yêu cầu nhập đủ', null);

            return res.status(400).json(objReturn);
        }

        const newTask = new mTask.taskModel({
            user_id,
            name,
            desc,
            image,
            deadline,
            status,
            create_by,
            tags,
        });

        const saveTask = await newTask.save();
        mFobjReturn(1, 'task được thêm thành công ', saveTask);

    } catch (error) {

        mFobjReturn(0, error, null);
        return res.status(400).json(objReturn);

    }

    res.json(objReturn);
}
const updateById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const taskId = req.params.taskId;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {

            mFobjReturn(0, 'taskId không hợp lệ', null);

            return res.status(400).json(objReturn);
        }

        const updateFields = req.body;

        if (req.file && req.file.path) {
            updateFields.image = req.file.path;
        }

        delete updateFields.is_delete;
        delete updateFields.createdAt;
        delete updateFields.create_by;
        delete updateFields.user_id;

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
const deleteById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const taskId = req.params.taskId;
        const delete_by = req.body.delete_by;

        if (!mongoose.Types.ObjectId.isValid(taskId)) {

            mFobjReturn(0, 'taskId không hợp lệ', null);
            return res.status(400).json(objReturn);

        }

        // const delTask = await mTask.taskModel.findByIdAndDelete(taskId);
        const delTask = await mTask.taskModel.findByIdAndUpdate(taskId, { delete_by: delete_by, is_delete: true }, { new: true });

        if (!delTask) {

            mFobjReturn(0, 'Không tìm thấy', null);
            return res.status(400).json(objReturn);

        } else {

            mFobjReturn(1, 'xóa thành công', null);

        }
    } catch (error) {

        mFobjReturn(0, error.message, null);
        return res.status(500).json(objReturn);

    }

    res.json(objReturn);
}

module.exports = {
    getById,
    getByUserId,
    addTask,
    updateById,
    deleteById
}
