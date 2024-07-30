const userService = require('./user.service');

/**
 * Lấy thông tin người dùng theo ID.
 *
 * @async
 * @function
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin người dùng hoặc thông báo lỗi.
 */
const getUserById = async (req, res, next) => {
  try {
    // Lấy ID người dùng từ tham số yêu cầu
    const id = req.params.id;

    // Kiểm tra tính hợp lệ của ID người dùng
    if (!userService.isValidObjectId(id)) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'ID user không hợp lệ',
        data: null,
      });
    }

    // Tìm người dùng theo ID
    const user = await userService.findUserById(id);

    // Kiểm tra nếu người dùng không tồn tại
    if (!user) {
      return res.status(404).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy user',
        data: null,
      });
    }

    // Trả về thông tin người dùng nếu tìm thấy
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: user,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi tìm người dùng: ${error.message}`,
      data: null,
    });
  }
};

/**
 * Tạo người dùng mới.
 *
 * @async
 * @function
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin người dùng hoặc thông báo lỗi.
 */
const createUser = async (req, res, next) => {
  try {
    // Lấy thông tin người dùng từ yêu cầu
    const { full_name, email, phone_number, password: userPassword } = req.body;

    // Kiểm tra tính hợp lệ của email
    if (!isCheckMail(email)) {
      return res
        .status(401)
        .json({ ...objectReturn, status: 0, msg: 'Email lỗi', data: null });
    }

    // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Email đã tồn tại',
        data: null,
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await userService.hashPassword(userPassword);

    // Tạo người dùng mới với thông tin đã cung cấp
    const newUser = await userService.createUser({
      full_name,
      password: hashedPassword,
      phone_number,
      email,
    });

    // Loại bỏ mật khẩu khỏi thông tin người dùng để trả về
    const { password, ...userWithoutPassword } = newUser;

    // Trả về thông tin người dùng mới tạo thành công
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Người dùng được tạo thành công',
      data: userWithoutPassword,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi tạo người dùng: ${error.message}`,
      data: null,
    });
  }
};

/**
 * Cập nhật thông tin của người dùng theo ID.
 *
 * @async
 * @function
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin người dùng đã cập nhật hoặc thông báo lỗi.
 */
const updateUserById = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const userId = req.params.userId;
    const updateFields = req.body;

    // Loại bỏ các trường không cần thiết khỏi thông tin cập nhật
    delete updateFields.password;
    delete updateFields.registration_date;

    // Kiểm tra tính hợp lệ của email
    if (!isCheckMail(updateFields.email)) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Email lỗi',
        data: null,
      });
    }

    // Cập nhật thông tin người dùng theo ID
    const updatedUser = await userService.updateUserById(userId, updateFields);

    if (!updatedUser) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy người dùng',
        data: null,
      });
    } else {
      return res.status(200).json({
        ...objectReturn,
        status: 1,
        msg: 'Cập nhật thành công',
        data: updatedUser,
      });
    }
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi cập nhật người dùng: ${error.message}`,
      data: null,
    });
  }
};

/**
 * Cập nhật mật khẩu người dùng.
 *
 * @async
 * @function
 * @return {Promise<void>} Trả về phản hồi HTTP với thông báo thành công hoặc lỗi.
 */
const updatePassword = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.userId;

    // Kiểm tra tính hợp lệ của mật khẩu
    if (!oldPassword || !newPassword) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Nhập đầy đủ mật khẩu',
        data: null,
      });
    }
    if (newPassword.length < 8) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Mật khẩu mới phải có ít nhất 8 ký tự',
        data: null,
      });
    }

    // Tìm kiếm người dùng theo ID
    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Người dùng không tồn tại',
        data: null,
      });
    }

    // So sánh mật khẩu cũ
    const isPasswordMatch = await userService.comparePassword(
      oldPassword,
      user.password,
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Mật khẩu cũ không chính xác',
        data: null,
      });
    }

    // Mã hóa mật khẩu mới và cập nhật trong cơ sở dữ liệu
    const hashedNewPassword = await userService.hashPassword(newPassword);
    await userService.updatePassword(user, hashedNewPassword);

    // Trả về phản hồi thành công
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Mật khẩu đã được thay đổi thành công',
      data: null,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi thay đổi mật khẩu: ${error.message}`,
      data: null,
    });
  }
};

/**
 * Đăng nhập người dùng.
 *
 * @async
 * @function
 * @return {Promise<void>} Trả về phản hồi HTTP với thông tin người dùng đã đăng nhập hoặc thông báo lỗi.
 */
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  objectReturn.data = null;

  try {
    // Tìm kiếm người dùng theo email
    const user = await userService.findUserByEmail(email);

    // Kiểm tra nếu người dùng không tồn tại
    if (!user) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Tên người dùng hoặc mật khẩu không chính xác',
        data: null,
      });
    }

    // So sánh mật khẩu cung cấp với mật khẩu lưu trữ
    const isPasswordMatch = await userService.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Tên người dùng hoặc mật khẩu không chính xác',
        data: null,
      });
    }

    // Đặt thông tin người dùng vào dữ liệu phản hồi
    objectReturn.data = { user };

    // Trả về phản hồi thành công với thông tin người dùng
    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Đăng nhập thành công',
      data: user,
    });
  } catch (error) {
    // Xử lý lỗi và trả về thông báo lỗi
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message, data: null });
  }
};

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
 * Kiểm tra tính hợp lệ của địa chỉ email.
 *
 * @function
 * @param {string} mail - Địa chỉ email cần kiểm tra.
 * @return {boolean} Trả về true nếu địa chỉ email hợp lệ, false nếu không hợp lệ.
 */
const isCheckMail = (mail) => {
  // Biểu thức chính quy kiểm tra định dạng email
  const reg =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  // Kiểm tra địa chỉ email với biểu thức chính quy
  const isValidEmail = reg.test(mail);

  // Trả về kết quả kiểm tra
  return isValidEmail;
};

module.exports = {
  getUserById,
  createUser,
  updateUserById,
  updatePassword,
  loginUser,
};
