var mTask = require('./task.model');
const mongoose = require('mongoose');
const moment = require('moment');

require('dotenv').config();

let now = moment().format('YYYY-MM-DD HH:mm:ss');
var objReturn = {
  status: 1,
  msg: 'OK',
  data: null,
};
const getById = async (req, res, next) => {
  objReturn.data = null;

  try {
    const Id = req.params.Id;

    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return res
        .status(401)
        .json({ ...objReturn, status: 0, msg: 'Id không hợp lệ' });
    }

    const task = await mTask.taskModel.findById(Id);

    if (!task) {
      return res
        .status(404)
        .json({ ...objReturn, status: 0, msg: 'Không tìm thấy nhiệm vụ' });
    } else {
      return res
        .status(200)
        .json({
          ...objReturn,
          status: 1,
          msg: 'đăng nhập thành công',
          data: task,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ ...objReturn, status: 0, msg: error.message });
  }
};
const getByUserId = async (req, res, next) => {
  const objReturn = { data: null, status: 0, msg: '' };

  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res
        .status(400)
        .json({ ...objReturn, msg: 'userId không hợp lệ' });
    }

    const totalItems = await mTask.taskModel.countDocuments({ user_id: userId });
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const tasks = await mTask.taskModel
      .find({ user_id: userId })
      .populate('results')
      .skip(skip)
      .limit(limit);

    if (tasks.length <= 0) {
      return res
        .status(404)
        .json({ ...objReturn, msg: 'Không tìm thấy nhiệm vụ' });
    }

    const paginationInfo = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return res.status(200).json({
      ...objReturn,
      status: 1,
      msg: 'Tìm thành công',
      pagination: paginationInfo,
      data: tasks
    });
  } catch (error) {
    return res
      .status(500)
      .json({ ...objReturn, msg: error.message });
  }
};
const addTask = async (req, res, next) => {
  objReturn.data = null;
  try {
    const { user_id, name, desc, image, deadline, create_by, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(user_id)) {
      return res
        .status(401)
        .json({ ...objReturn, status: 0, msg: 'userId không hợp lệ' });
    }

    if (!user_id || !name || !desc || !deadline || !create_by) {
      return res
        .status(401)
        .json({
          ...objReturn,
          status: 0,
          msg: 'các trường yêu cầu nhập đủ',
          data: null,
        });
    }

    const newTask = new mTask.taskModel({
      user_id,
      name,
      desc,
      image,
      deadline,
      create_by,
      tags,
    });

    const saveTask = await newTask.save();
    return res
      .status(200)
      .json({
        ...objReturn,
        status: 1,
        msg: 'task được thêm thành công',
        data: saveTask,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        ...objReturn,
        status: 0,
        msg: `error.message : ${error.message}`,
        data: null,
      });
  }
};
const updateById = async (req, res, next) => {
  objReturn.data = null;

  try {
    const taskId = req.params.taskId;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res
        .status(401)
        .json({ ...objReturn, status: 0, msg: 'taskId không hợp lệ' });
    }

    const findTask = await mTask.taskModel.findById(taskId);

    if (!findTask) {
      return res
        .status(404)
        .json({ ...objReturn, status: 0, msg: 'taskId not found' });
    }

    const updateFields = req.body;

    if (req.file && req.file.path) {
      updateFields.image = req.file.path;
    }

    delete updateFields.is_delete;
    delete updateFields.createdAt;
    delete updateFields.create_by;
    delete updateFields.user_id;

    const updateTask = await mTask.taskModel.findByIdAndUpdate(
      taskId,
      updateFields,
      { new: true },
    );

    if (!updateTask) {
      return res
        .status(401)
        .json({
          ...objReturn,
          status: 0,
          msg: 'Không tìm thấy hoặc đã bị xóa',
        });
    } else {
      return res
        .status(200)
        .json({
          ...objReturn,
          status: 1,
          msg: 'sửa thành công',
          data: updateTask,
        });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ ...objReturn, status: 0, msg: error.message });
  }
};
const deleteById = async (req, res, next) => {
  objReturn.data = null;

  try {
    const taskId = req.params.taskId;
    const delete_by = req.body.delete_by;

    if (
      !mongoose.Types.ObjectId.isValid(taskId) ||
      !mongoose.Types.ObjectId.isValid(delete_by)
    ) {
      return res
        .status(401)
        .json({
          ...objReturn,
          status: 0,
          msg: 'taskId hoặc delete_by không hợp lệ',
        });
    }
    const findTask = await mTask.taskModel.findById(taskId);
    if (!findTask) {
      return res
        .status(404)
        .json({ ...objReturn, status: 0, msg: 'taskId not found' });
    }

    const delTask = await mTask.taskModel.findByIdAndUpdate(
      taskId,
      { delete_by: delete_by, is_delete: true },
      { new: true },
    );

    if (!delTask) {
      return res
        .status(401)
        .json({ ...objReturn, status: 0, msg: 'Không tìm thấy' });
    } else {
      return res
        .status(200)
        .json({ ...objReturn, status: 1, msg: 'xóa thành công', data: null });
    }
  } catch (error) {
    return res
      .status(500)
      .json({
        ...objReturn,
        status: 0,
        msg: `error.message : ${error.message}`,
        data: null,
      });
  }
};
const getByName = async (req, res, next) => {
  const objReturn = { data: null, status: 0, msg: '' };

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchName = req.query.name || '';

    // Tạo điều kiện tìm kiếm
    const searchCondition = {
      name: { $regex: searchName, $options: 'i' }, // Tìm kiếm không phân biệt chữ hoa/thường
    };

    const totalItems = await mTask.taskModel.countDocuments(searchCondition);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const tasks = await mTask.taskModel
      .find(searchCondition)
      .populate('results')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Sắp xếp theo thời gian tạo mới nhất

    if (tasks.length <= 0) {
      return res
        .status(404)
        .json({ ...objReturn, status: 0, msg: 'Không tìm thấy nhiệm vụ', data: null });

    }

    const paginationInfo = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };

    return res.status(200).json({
      ...objReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: tasks,
      pagination: paginationInfo
    });
  } catch (error) {
    return res
      .status(500)
      .json({ ...objReturn, msg: error.message });
  }
};
module.exports = {
  getById,
  getByUserId,
  addTask,
  updateById,
  deleteById,
  getByName
};
