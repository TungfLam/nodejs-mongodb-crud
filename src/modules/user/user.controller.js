var mdU = require('./user.model');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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
const getById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'id user không hợp lệ',
        data: null,
      });
    }

    const task = await mdU.userModel.findById(id);

    if (!task) {
      return res.status(404).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm user',
        data: null,
      });
    } else {
      return res.status(200).json({
        ...objectReturn,
        status: 1,
        msg: 'tìm thành công',
        data: task,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message, data: null });
  }
};
const addUser = async (req, res, next) => {
  try {
    const { full_name, email, phone_number, password: userPassword } = req.body;

    const mIsCheckMail = isCheckMail(email);
    if (mIsCheckMail == false) {
      return res
        .status(401)
        .json({ ...objectReturn, status: 0, msg: 'email lỗi', data: null });
    }

    const existingUser = await mdU.userModel.findOne({ email });
    if (existingUser) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'email đã tồn tại',
        data: null,
      });
    }
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    const newUser = mdU.userModel({
      full_name,
      password: hashedPassword,
      phone_number,
      email,
    });

    await newUser.save();

    const { Password: pwd, ...userWithoutPassword } = newUser.toObject();

    return res.status(200).json({
      ...objectReturn,
      status: 1,
      msg: 'người dùng được tạo thành công',
      data: userWithoutPassword,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message, data: null });
  }
};
const updateById = async (req, res, next) => {
  objectReturn.data = null;

  try {
    const userId = req.params.userId;
    const updateFields = req.body;

    delete updateFields.password;
    delete updateFields.registration_date;

    const mIsCheckMail = isCheckMail(updateFields.email);
    if (mIsCheckMail == false) {
      return res
        .status(401)
        .json({ ...objectReturn, status: 0, msg: 'email lỗi', data: null });
    }

    const updatedUser = await mdU.userModel.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true },
    );

    if (!updatedUser) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Không tìm thấy người dùng',
        data: null,
      });
    } else {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Cập nhật thành công',
        data: null,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message, data: null });
  }
};
const changePassword = async (req, res, next) => {
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

    const user = await mdU.userModel.findById(userId);
    if (!user) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Người dùng không tồn tại',
        data: null,
      });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Mật khẩu cũ không chính xác',
        data: null,
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();
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
      msg: `Đã xảy ra lỗi khi thay đổi mật khẩu ${error.message}F`,
      data: null,
    });
  }
};
const userLogin = async (req, res, next) => {
  const { email, password } = req.body;
  objectReturn.data = null;

  try {
    const user = await mdU.userModel.findOne({ email });

    if (!user) {
      return res.status(401).json({
        ...objectReturn,
        status: 0,
        msg: 'Tên người dùng hoặc mật khẩu không chính xác',
        data: null,
      });
    }
    const isPasswordmatch = await bcrypt.compare(password, user.password);
    if (!isPasswordmatch) {
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
      msg: 'đăng nhập thành công',
      data: user,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ ...objectReturn, status: 0, msg: error.message, data: null });
  }
};

module.exports = {
  getById,
  addUser,
  updateById,
  changePassword,
  userLogin,
};
