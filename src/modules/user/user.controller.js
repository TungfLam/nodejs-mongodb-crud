const userService = require('./user.service');

var objectReturn = {
  status: 1,
  msg: 'OK',
  data: null,
};
/**
 * Function to check if the email is valid
 * @param {string} mail - The email to be checked
 * @returns {boolean} - Returns true if the email is valid, false otherwise
 */
const isCheckMail = (mail) => {
  const reg =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  const isCheckMail = reg.test(mail);

  return isCheckMail;
};
const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!userService.isValidObjectId(id)) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'ID user không hợp lệ',
        data: null,
      });
    }

    const user = await userService.findUserById(id);

    if (!user) {
      return res.status(404).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy user',
        data: null,
      });
    }

    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Tìm thành công',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi tìm người dùng: ${error.message}`,
      data: null,
    });
  }
};
const createUser = async (req, res, next) => {
  try {
    const { full_name, email, phone_number, password: userPassword } = req.body;

    if (!isCheckMail(email)) {
      return res
        .status(401)
        .json({ ...objectReturn, status: 0, msg: 'Email lỗi', data: null });
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Email đã tồn tại',
        data: null,
      });
    }

    const hashedPassword = await userService.hashPassword(userPassword);

    const newUser = await userService.createUser({
      full_name,
      password: hashedPassword,
      phone_number,
      email,
    });

    const { password, ...userWithoutPassword } = newUser;

    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Người dùng được tạo thành công',
      data: userWithoutPassword,
    });
  } catch (error) {
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi tạo người dùng: ${error.message}`,
      data: null,
    });
  }
};
const updateUserById = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const userId = req.params.userId;
    const updateFields = req.body;

    delete updateFields.password;
    delete updateFields.registration_date;

    if (!isCheckMail(updateFields.email)) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Email lỗi',
        data: null,
      });
    }

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
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi cập nhật người dùng: ${error.message}`,
      data: null,
    });
  }
};
const updatePassword = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.userId;

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

    const user = await userService.findUserById(userId);
    if (!user) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Người dùng không tồn tại',
        data: null,
      });
    }

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

    const hashedNewPassword = await userService.hashPassword(newPassword);
    await userService.updatePassword(user, hashedNewPassword);

    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Mật khẩu đã được thay đổi thành công',
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      ...objectReturn,
      status: 0,
      msg: `Đã xảy ra lỗi khi thay đổi mật khẩu: ${error.message}`,
      data: null,
    });
  }
};
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  objectReturn.data = null;

  try {
    const user = await userService.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Tên người dùng hoặc mật khẩu không chính xác',
        data: null,
      });
    }

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

    objectReturn.data = { user };

    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'Đăng nhập thành công',
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message, data: null });
  }
};

module.exports = {
  getUserById,
  createUser,
  updateUserById,
  updatePassword,
  loginUser,
};
