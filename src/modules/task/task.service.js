const task = require('./task.model');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

/**
 * Đếm số lượng tài liệu trong tập hợp nhiệm vụ theo điều kiện tìm kiếm.
 *
 * @param {Object} searchCondition - Điều kiện tìm kiếm để đếm số lượng nhiệm vụ.
 * @return {Promise<number>} Một Promise sẽ trả về số lượng tài liệu (nhiệm vụ) thỏa mãn điều kiện tìm kiếm.
 */
const countTasks = async (searchCondition) => {
    // Đếm số lượng tài liệu trong tập hợp nhiệm vụ theo điều kiện tìm kiếm sử dụng countDocuments.
    // Trả về số lượng tài liệu được bọc trong một Promise.
    return await task.taskModel.countDocuments(searchCondition);
};

/**
 * Tìm kiếm nhiệm vụ theo điều kiện tìm kiếm với phân trang và sắp xếp.
 *
 * @param {Object} searchCondition - Điều kiện tìm kiếm để lọc các nhiệm vụ.
 * @param {number} skip - Số lượng tài liệu cần bỏ qua (phân trang).
 * @param {number} limit - Số lượng tài liệu tối đa cần lấy (phân trang).
 * @return {Promise<Array<Object>>} Một Promise sẽ trả về một mảng các nhiệm vụ thỏa mãn điều kiện tìm kiếm.
 */
const findTasks = async (searchCondition, skip, limit) => {
    return await task.taskModel
        .find(searchCondition) // Tìm nhiệm vụ theo điều kiện tìm kiếm.
        .populate('results') // Nạp các tài liệu liên quan từ trường `results`.
        .skip(skip) // Bỏ qua số lượng tài liệu theo `skip` để phân trang.
        .limit(limit) // Giới hạn số lượng tài liệu lấy theo `limit` để phân trang.
        .sort({ createdAt: -1 }); // Sắp xếp kết quả theo trường `createdAt` theo thứ tự giảm dần.
};

/**
 * Kiểm tra tính hợp lệ của ID đối tượng MongoDB.
 *
 * @param {string} id - ID đối tượng cần kiểm tra tính hợp lệ.
 * @return {boolean} Trả về true nếu ID là hợp lệ theo định dạng ObjectId của MongoDB, false nếu không hợp lệ.
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Tìm nhiệm vụ theo ID và nạp các tài liệu liên quan từ trường `results`.
 *
 * @param {string} taskId - ID của nhiệm vụ cần tìm.
 * @return {Promise<Object|null>} Một Promise sẽ trả về đối tượng nhiệm vụ nếu tìm thấy, hoặc null nếu không tìm thấy.
 */
const findTaskById = async (taskId) => {
    return await task.taskModel.findById(taskId).populate('results');
};

/**
 * Xóa nhiệm vụ theo ID bằng cách đánh dấu nó là đã xóa.
 *
 * @param {string} taskId - ID của nhiệm vụ cần xóa.
 * @param {string} deleteBy - Thông tin về người hoặc lý do xóa nhiệm vụ.
 * @return {Promise<Object|null>} Một Promise sẽ trả về đối tượng nhiệm vụ đã được cập nhật nếu thành công, hoặc null nếu không tìm thấy nhiệm vụ.
 */
const deleteTaskById = async (taskId, deleteBy) => {
    return await task.taskModel.findByIdAndUpdate(
        taskId,
        { delete_by: deleteBy, is_delete: true }, // Cập nhật nhiệm vụ với thông tin xóa.
        { new: true }, // Trả về đối tượng nhiệm vụ đã cập nhật.
    );
};

/**
 * Cập nhật thông tin của nhiệm vụ theo ID.
 *
 * @param {string} taskId - ID của nhiệm vụ cần cập nhật.
 * @param {Object} updateFields - Các trường dữ liệu cần cập nhật.
 * @return {Promise<Object|null>} Một Promise sẽ trả về đối tượng nhiệm vụ đã được cập nhật nếu thành công, hoặc null nếu không tìm thấy nhiệm vụ.
 */
const updateTaskById = async (taskId, updateFields) => {
    return await task.taskModel.findByIdAndUpdate(taskId, updateFields, {
        new: true, // Trả về đối tượng nhiệm vụ đã cập nhật.
    });
};

/**
 * Thêm một nhiệm vụ mới vào cơ sở dữ liệu.
 *
 * @param {Object} taskData - Dữ liệu của nhiệm vụ mới cần thêm.
 * @return {Promise<Object>} Một Promise sẽ trả về đối tượng nhiệm vụ mới được lưu.
 */
const addNewTask = async (taskData) => {
    const newTask = new task.taskModel(taskData); // Tạo một đối tượng nhiệm vụ mới với dữ liệu cung cấp.
    return await newTask.save(); // Lưu nhiệm vụ mới vào cơ sở dữ liệu và trả về đối tượng nhiệm vụ đã lưu.
};

/**
 * Tìm nhiệm vụ theo ID người dùng với phân trang và làm phong phú kết quả.
 *
 * @param {string} userId - ID của người dùng để lọc nhiệm vụ.
 * @param {number} skip - Số lượng tài liệu cần bỏ qua (phân trang).
 * @param {number} limit - Số lượng tài liệu tối đa cần lấy (phân trang).
 * @return {Promise<Array<Object>>} Một Promise sẽ trả về một mảng các nhiệm vụ thỏa mãn điều kiện tìm kiếm.
 */
const findTasksByUserId = async (userId, skip, limit) => {
    return await task.taskModel
        .find({ user_id: userId, is_delete: false }) // Tìm nhiệm vụ của người dùng và chưa bị xóa.
        .populate('results') // Nạp các tài liệu liên quan từ trường `results`.
        .skip(skip) // Bỏ qua số lượng tài liệu theo `skip` để phân trang.
        .limit(limit); // Giới hạn số lượng tài liệu lấy theo `limit` để phân trang.
};

/**
 * Đếm số lượng nhiệm vụ của người dùng.
 *
 * @param {string} userId - ID của người dùng để đếm số lượng nhiệm vụ.
 * @return {Promise<number>} Một Promise sẽ trả về số lượng nhiệm vụ thỏa mãn điều kiện.
 */
const countTasksByUserId = async (searchCondition, userId) => {
    return await task.taskModel.countDocuments(
        searchCondition
    );
};

/**
 * Cấu hình Cloudinary với thông tin từ biến môi trường.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Tên cloud của Cloudinary.
    api_key: process.env.CLOUDINARY_API_KEY, // Khóa API của Cloudinary.
    api_secret: process.env.CLOUDINARY_API_SECRET, // Bí mật API của Cloudinary.
});

/**
 * Cấu hình lưu trữ cho Multer sử dụng Cloudinary.
 */
const storage = new CloudinaryStorage({
    cloudinary: cloudinary, // Đối tượng Cloudinary đã cấu hình.
    params: {
        folder: 'uploads', // Thư mục lưu trữ trong Cloudinary.
        allowed_formats: ['jpg', 'png'], // Các định dạng hình ảnh được phép tải lên.
    },
});

/**
 * Tạo một đối tượng Multer với cấu hình lưu trữ Cloudinary.
 */
const upload = multer({ storage: storage }); // Đối tượng Multer để xử lý tệp tải lên.

module.exports = {
    countTasks,
    findTasks,
    isValidObjectId,
    findTaskById,
    deleteTaskById,
    updateTaskById,
    addNewTask,
    findTasksByUserId,
    countTasksByUserId,
    upload,
};
