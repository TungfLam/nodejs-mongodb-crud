const taskService = require('./task.service');

/**
 * Mẫu phản hồi chuẩn cho các API.
 *
 * @typedef {Object} ObjectReturn
 * @property {number} status - Trạng thái của phản hồi, 1 thường biểu thị thành công, 0 biểu thị lỗi.
 * @property {string} msg - Tin nhắn mô tả trạng thái của phản hồi, có thể là thông báo thành công hoặc lỗi.
 * @property {Object|null} data - Dữ liệu liên quan đến phản hồi. Có thể là dữ liệu thực tế hoặc null nếu không có dữ liệu.
 */

var objectReturn = {
  status: 1, // Trạng thái của phản hồi, 1 thường biểu thị thành công.
  msg: 'OK', // Tin nhắn mô tả trạng thái của phản hồi, mặc định là 'OK'.
  data: null, // Dữ liệu trả về, mặc định là null.
};
/**
 * Lấy nhiệm vụ theo ID từ yêu cầu và trả về thông tin nhiệm vụ.
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin nhiệm vụ nếu tìm thấy, hoặc thông báo lỗi nếu không tìm thấy hoặc có lỗi xảy ra.
 */
const getTaskById = async (req, res, next) => {
  try {
    const Id = req.params.Id;

    // Kiểm tra tính hợp lệ của ID
    if (!taskService.isValidObjectId(Id)) {
      return res
        .status(400)
        .json({ ...objectReturn, status: 0, msg: 'Id không hợp lệ' });
    }

    // Tìm nhiệm vụ theo ID
    const task = await taskService.findTaskById(Id);

    // Kiểm tra xem nhiệm vụ có tồn tại không
    if (!task) {
      return res
        .status(404)
        .json({ ...objectReturn, status: 0, msg: 'Không tìm thấy nhiệm vụ' });
    }

    // Trả về thông tin nhiệm vụ nếu tìm thấy
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: task,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message });
  }
};

/**
 * Lấy danh sách nhiệm vụ theo ID người dùng với phân trang và trả về thông tin nhiệm vụ.
 * @return {Promise<void>} Trả về phản hồi HTTP với danh sách nhiệm vụ, thông tin phân trang nếu tìm thấy, hoặc thông báo lỗi nếu không tìm thấy hoặc có lỗi xảy ra.
 */
const getTasksByUserId = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
    const limit = parseInt(req.query.limit) || 12; // Số lượng nhiệm vụ trên mỗi trang, mặc định là 12

    // Kiểm tra tính hợp lệ của ID người dùng
    if (!taskService.isValidObjectId(userId)) {
      return res
        .status(400)
        .json({ ...objectReturn, msg: 'userId không hợp lệ' });
    }

    // Tính tổng số nhiệm vụ và số trang cần thiết cho phân trang
    const totalItems = await taskService.countTasksByUserId(userId);
    const totalPages = Math.ceil(totalItems / limit);
    const skip = (page - 1) * limit;

    // Tìm nhiệm vụ của người dùng với phân trang
    const tasks = await taskService.findTasksByUserId(userId, skip, limit);

    // Kiểm tra xem có nhiệm vụ nào không
    if (tasks.length <= 0) {
      return res
        .status(404)
        .json({ ...objectReturn, msg: 'Không tìm thấy nhiệm vụ' });
    }

    // Thông tin phân trang
    const paginationInfo = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    // Trả về thông tin nhiệm vụ và phân trang
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Tìm thành công',
      pagination: paginationInfo,
      data: tasks,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({ ...objectReturn, msg: error.message });
  }
};

/**
 * Tạo một nhiệm vụ mới và lưu trữ vào cơ sở dữ liệu.
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin nhiệm vụ mới nếu thành công, hoặc thông báo lỗi nếu không thành công hoặc có lỗi xảy ra.
 */
const createTask = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const { user_id, name, desc, image, deadline, create_by, tags } = req.body;

    // Kiểm tra tính hợp lệ của ID người dùng
    if (!taskService.isValidObjectId(user_id)) {
      return res
        .status(401)
        .json({ ...objectReturn, status: 0, msg: 'userId không hợp lệ' });
    }

    // Kiểm tra xem tất cả các trường yêu cầu có được cung cấp đầy đủ không
    if (!user_id || !name || !desc || !deadline || !create_by) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'các trường yêu cầu nhập đủ',
        data: null,
      });
    }

    // Tạo đối tượng nhiệm vụ mới với thông tin đã cung cấp
    const taskData = { user_id, name, desc, image, deadline, create_by, tags };
    const saveTask = await taskService.addNewTask(taskData);

    // Trả về thông tin nhiệm vụ mới nếu tạo thành công
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'task được thêm thành công',
      data: saveTask,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `error.message : ${error.message}`,
      data: null,
    });
  }
};

/**
 * Cập nhật thông tin của một nhiệm vụ dựa trên ID của nó.
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin nhiệm vụ sau khi cập nhật thành công, hoặc thông báo lỗi nếu không thành công hoặc có lỗi xảy ra.
 */
const updateTaskById = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const taskId = req.params.taskId;

    // Kiểm tra tính hợp lệ của ID nhiệm vụ
    if (!taskService.isValidObjectId(taskId)) {
      return res
        .status(401)
        .json({ ...objectReturn, status: 0, msg: 'taskId không hợp lệ' });
    }

    // Tìm nhiệm vụ theo ID
    const findTask = await taskService.findTaskById(taskId);

    // Kiểm tra xem nhiệm vụ có tồn tại không
    if (!findTask) {
      return res
        .status(404)
        .json({ ...objectReturn, status: 0, msg: 'Không tìm thấy taskId' });
    }

    // Lấy các trường cần cập nhật từ thân yêu cầu
    const updateFields = req.body;

    // Cập nhật đường dẫn hình ảnh nếu có tệp hình ảnh được tải lên
    if (req.file && req.file.path) {
      updateFields.image = req.file.path;
    }

    // Xóa các trường không được phép cập nhật
    delete updateFields.is_delete;
    delete updateFields.createdAt;
    delete updateFields.create_by;
    delete updateFields.user_id;

    // Cập nhật nhiệm vụ với các trường mới
    const updateTask = await taskService.updateTaskById(taskId, updateFields);

    // Kiểm tra kết quả cập nhật
    if (!updateTask) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy hoặc đã bị xóa',
      });
    } else {
      return res.status(200).json({
        ...objectReturn,
        status: 1,
        msg: 'Cập nhật thành công',
        data: updateTask,
      });
    }
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message });
  }
};

/**
 * Xóa một nhiệm vụ dựa trên ID của nó.
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin về kết quả xóa, hoặc thông báo lỗi nếu không thành công hoặc có lỗi xảy ra.
 */
const deleteTaskById = async (req, res, next) => {
  try {
    const taskId = req.params.taskId;
    const delete_by = req.body.delete_by;

    // Kiểm tra tính hợp lệ của ID nhiệm vụ và ID của người xóa
    if (
      !taskService.isValidObjectId(taskId) ||
      !taskService.isValidObjectId(delete_by)
    ) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'taskId hoặc delete_by không hợp lệ',
      });
    }

    // Tìm nhiệm vụ theo ID
    const findTask = await taskService.findTaskById(taskId);
    if (!findTask) {
      return res.status(404).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy taskId',
      });
    }

    // Xóa nhiệm vụ và cập nhật thông tin người xóa
    const delTask = await taskService.deleteTaskById(taskId, delete_by);
    if (!delTask) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy nhiệm vụ',
      });
    } else {
      return res.status(200).json({
        ...objectReturn,
        status: 1,
        msg: 'Xóa thành công',
        data: null,
      });
    }
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `error.message : ${error.message}`,
      data: null,
    });
  }
};

/**
 * Tìm kiếm nhiệm vụ theo tên với phân trang.
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin về kết quả tìm kiếm, hoặc thông báo lỗi nếu không thành công hoặc có lỗi xảy ra.
 */
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
        ...objectReturn,
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
      ...objectReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: tasks,
      pagination: paginationInfo,
    });
  } catch (error) {
    return res.status(500).json({ ...objectReturn, msg: error.message });
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
