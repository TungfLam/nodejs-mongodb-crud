const taskService = require('./task.service');

var objReturn = {
  status: 1,
  msg: 'OK',
  data: null,
};
const getTaskById = async (req, res, next) => {
  const objReturn = { data: null, status: 0, msg: '' };

  try {
    const Id = req.params.Id;
    if (!taskService.isValidObjectId(Id)) {
      return res
        .status(400)
        .json({ ...objReturn, status: 0, msg: 'Id không hợp lệ' });
    }

    const task = await taskService.findTaskById(Id);

    if (!task) {
      return res
        .status(404)
        .json({ ...objReturn, status: 0, msg: 'Không tìm thấy nhiệm vụ' });
    }

    return res.status(200).json({
      ...objReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: task,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ ...objReturn, status: 0, msg: error.message });
  }
};
const getTasksByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!taskService.isValidObjectId(userId)) {
      return res.status(400).json({ ...objReturn, msg: 'userId không hợp lệ' });
    }

    const totalItems = await taskService.countTasksByUserId(userId);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const tasks = await taskService.findTasksByUserId(userId, skip, limit);

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
      hasPrevPage: page > 1,
    };

    return res.status(200).json({
      ...objReturn,
      status: 1,
      msg: 'Tìm thành công',
      pagination: paginationInfo,
      data: tasks,
    });
  } catch (error) {
    return res.status(500).json({ ...objReturn, msg: error.message });
  }
};
const createTask = async (req, res, next) => {
  objReturn.data = null;

  try {
    const { user_id, name, desc, image, deadline, create_by, tags } = req.body;

    if (!taskService.isValidObjectId(user_id)) {
      return res
        .status(401)
        .json({ ...objReturn, status: 0, msg: 'userId không hợp lệ' });
    }

    if (!user_id || !name || !desc || !deadline || !create_by) {
      return res.status(401).json({
        ...objReturn,
        status: 0,
        msg: 'các trường yêu cầu nhập đủ',
        data: null,
      });
    }

    const taskData = { user_id, name, desc, image, deadline, create_by, tags };
    const saveTask = await taskService.addNewTask(taskData);

    return res.status(200).json({
      ...objReturn,
      status: 1,
      msg: 'task được thêm thành công',
      data: saveTask,
    });
  } catch (error) {
    return res.status(500).json({
      ...objReturn,
      status: 0,
      msg: `error.message : ${error.message}`,
      data: null,
    });
  }
};
const updateTaskById = async (req, res, next) => {
  objReturn.data = null;

  try {
    const taskId = req.params.taskId;

    if (!taskService.isValidObjectId(taskId)) {
      return res
        .status(401)
        .json({ ...objReturn, status: 0, msg: 'taskId không hợp lệ' });
    }

    const findTask = await taskService.findTaskById(taskId);

    if (!findTask) {
      return res
        .status(404)
        .json({ ...objReturn, status: 0, msg: 'Không tìm thấy taskId' });
    }

    const updateFields = req.body;

    if (req.file && req.file.path) {
      updateFields.image = req.file.path;
    }

    delete updateFields.is_delete;
    delete updateFields.createdAt;
    delete updateFields.create_by;
    delete updateFields.user_id;

    const updateTask = await taskService.updateTaskById(taskId, updateFields);

    if (!updateTask) {
      return res.status(401).json({
        ...objReturn,
        status: 0,
        msg: 'Không tìm thấy hoặc đã bị xóa',
      });
    } else {
      return res.status(200).json({
        ...objReturn,
        status: 1,
        msg: 'Cập nhật thành công',
        data: updateTask,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ ...objReturn, status: 0, msg: error.message });
  }
};
const deleteTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const delete_by = req.body.delete_by;

    if (
      !taskService.isValidObjectId(taskId) ||
      !taskService.isValidObjectId(delete_by)
    ) {
      return res.status(401).json({
        ...objReturn,
        status: 0,
        msg: 'taskId hoặc delete_by không hợp lệ',
      });
    }

    const findTask = await taskService.findTaskById(taskId);
    if (!findTask) {
      return res.status(404).json({
        ...objReturn,
        status: 0,
        msg: 'Không tìm thấy taskId',
      });
    }

    const delTask = await taskService.deleteTaskById(taskId, delete_by);
    if (!delTask) {
      return res.status(401).json({
        ...objReturn,
        status: 0,
        msg: 'Không tìm thấy nhiệm vụ',
      });
    } else {
      return res.status(200).json({
        ...objReturn,
        status: 1,
        msg: 'Xóa thành công',
        data: null,
      });
    }
  } catch (error) {
    return res.status(500).json({
      ...objReturn,
      status: 0,
      msg: `error.message : ${error.message}`,
      data: null,
    });
  }
};
const searchTasksByName = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const searchName = req.query.name || '';

    // Tạo điều kiện tìm kiếm
    const searchCondition = {
      is_delete: false,
      name: { $regex: searchName, $options: 'i' }, // Tìm kiếm không phân biệt chữ hoa/thường
    };

    const totalItems = await taskService.countTasks(searchCondition);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    const tasks = await taskService.findTasks(searchCondition, skip, limit);

    if (tasks.length === 0) {
      return res.status(404).json({
        ...objReturn,
        status: 0,
        msg: 'Không tìm thấy nhiệm vụ',
        data: null,
      });
    }

    const paginationInfo = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return res.status(200).json({
      ...objReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: tasks,
      pagination: paginationInfo,
    });
  } catch (error) {
    return res.status(500).json({ ...objReturn, msg: error.message });
  }
};

module.exports = {
  getTaskById,
  getTasksByUserId,
  createTask,
  updateTaskById,
  deleteTaskById,
  searchTasksByName,
};
