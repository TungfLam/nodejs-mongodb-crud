const user = require('./user.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

/**
 * Tìm người dùng theo ID một cách bất đồng bộ.
 *
 * @param {string} userId - ID của người dùng cần tìm.
 * @return {Promise<Object|null>} Một Promise sẽ trả về đối tượng người dùng nếu tìm thấy, hoặc null nếu không tìm thấy.
 */
const findUserById = async (userId) => {
    // Tìm người dùng theo ID sử dụng userModel.
    // Trả về đối tượng người dùng được tìm thấy được bọc trong một Promise.
    return await user.userModel.findById(userId);
};

/**
 * Cập nhật mật khẩu của người dùng và lưu thay đổi.
 *
 * @param {Object} user - Đối tượng người dùng cần cập nhật mật khẩu.
 * @param {string} newPassword - Mật khẩu mới của người dùng.
 * @return {Promise<Object>} Một Promise sẽ trả về đối tượng người dùng đã được cập nhật sau khi lưu thay đổi.
 */
const updatePassword = async (user, newPassword) => {
    user.password = newPassword; // Cập nhật mật khẩu mới cho đối tượng người dùng
    return await user.save(); // Lưu thay đổi và trả về đối tượng người dùng đã cập nhật
};

/**
 * So sánh mật khẩu đầu vào với mật khẩu đã lưu.
 *
 * @param {string} inputPassword - Mật khẩu do người dùng nhập vào.
 * @param {string} storedPassword - Mật khẩu đã được lưu trữ (đã được mã hóa).
 * @return {Promise<boolean>} Một Promise sẽ trả về true nếu mật khẩu đầu vào khớp với mật khẩu đã lưu, ngược lại trả về false.
 */
const comparePassword = async (inputPassword, storedPassword) => {
    return await bcrypt.compare(inputPassword, storedPassword); // So sánh mật khẩu đầu vào với mật khẩu đã lưu và trả về kết quả
};

/**
 * Cập nhật thông tin của người dùng theo ID.
 *
 * @param {string} userId - ID của người dùng cần cập nhật.
 * @param {Object} updateFields - Các trường thông tin cần cập nhật.
 * @return {Promise<Object|null>} Một Promise sẽ trả về đối tượng người dùng đã được cập nhật nếu thành công, hoặc null nếu không tìm thấy người dùng.
 */
const updateUserById = async (userId, updateFields) => {
    return await user.userModel.findByIdAndUpdate(userId, updateFields, {
        new: true, // Trả về đối tượng đã được cập nhật
    });
};

/**
 * Tìm kiếm người dùng theo địa chỉ email.
 *
 * @param {string} email - Địa chỉ email của người dùng cần tìm.
 * @return {Promise<Object|null>} Một Promise sẽ trả về đối tượng người dùng nếu tìm thấy, hoặc null nếu không tìm thấy.
 */
const findUserByEmail = async (email) => {
    return await user.userModel.findOne({ email });
};

/**
 * Mã hóa mật khẩu bằng thuật toán bcrypt.
 *
 * @param {string} password - Mật khẩu cần mã hóa.
 * @return {Promise<string>} Một Promise sẽ trả về mật khẩu đã được mã hóa.
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10); // Mã hóa mật khẩu với độ khó 10
};

/**
 * Tạo người dùng mới và lưu vào cơ sở dữ liệu.
 *
 * @param {Object} userData - Dữ liệu của người dùng cần tạo.
 * @return {Promise<Object>} Một Promise sẽ trả về đối tượng người dùng đã được tạo.
 */
const createUser = async (userData) => {
    const newUser = new user.userModel(userData); // Tạo đối tượng người dùng mới
    await newUser.save(); // Lưu đối tượng người dùng vào cơ sở dữ liệu
    return newUser.toObject(); // Trả về đối tượng người dùng dưới dạng plain object
};

/**
 * Kiểm tra xem ID có phải là ObjectId hợp lệ không.
 *
 * @param {string} id - ID cần kiểm tra.
 * @return {boolean} Trả về true nếu ID là ObjectId hợp lệ, ngược lại trả về false.
 */
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id); // Kiểm tra tính hợp lệ của ObjectId
};

module.exports = {
    findUserByEmail,
    comparePassword,
    findUserById,
    hashPassword,
    updatePassword,
    updateUserById,
    createUser,
    isValidObjectId,
};
