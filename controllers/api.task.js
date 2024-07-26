var mTask = require('../models/task.model');
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

        const task = await mTask.taskModel.find({ UserID: userId }).sort({ _id: -1 });

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
const addTask = async (req, res, next) => {
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
const deleteById = async (req, res, next) => {
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

module.exports = {
    getById,
    getByUserId,
    addTask,
    updateById,
    deleteById
}
