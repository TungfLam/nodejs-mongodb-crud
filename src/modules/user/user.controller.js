var mdU = require('./user.model');
const moment = require('moment-timezone');
const mongoose = require('mongoose');

const timeZone = 'Asia/Ho_Chi_Minh';
var now = moment().tz(timeZone);

const bcrypt = require('bcrypt');
var objReturn = {
    status: 1,
    msg: 'OK'
}
const isCheckMail = (mail) => {

    const reg = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const isCheckMail = reg.test(mail)

    return isCheckMail;

}
const mFobjReturn = (a, b, c) => {
    objReturn.status = a;
    objReturn.msg = b;
    objReturn.data = c;
}


const getById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const Id = req.params.Id;

        if (!mongoose.Types.ObjectId.isValid(Id)) {
            mFobjReturn(0, 'Id không hợp lệ', null);

            return res.status(400).json(objReturn);
        }

        const task = await mdU.userModel.findById(Id);

        if (!task) {
            mFobjReturn(0, 'Không tìm user', null);

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
const addUser = async (req, res, next) => {
    objReturn.data = null;

    try {
        const { full_name, email, phone_number, password: userPassword } = req.body;

        const mIsCheckMail = isCheckMail(email)
        if (mIsCheckMail == false) {

            mFobjReturn(0, 'meo lỗi kìa', null);
            return res.status(401).json(objReturn);

        }

        const existingUser = await mdU.userModel.findOne({ email });
        if (existingUser) {

            mFobjReturn(0, 'email đã tồn tại', null);
            return res.status(401).json(objReturn)

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



        mFobjReturn(1, 'người dùng được tạo thành công', userWithoutPassword);

    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
}
const updateById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const userId = req.params.userId;
        const updateFields = req.body;

        delete updateFields.password;
        delete updateFields.registration_date;

        const mIsCheckMail = isCheckMail(updateFields.email)
        if (mIsCheckMail == false) {

            mFobjReturn(0, 'meo lỗi kìa ', null);
            return res.status(401).json(objReturn);

        }

        const updatedUser = await mdU.userModel.findByIdAndUpdate(userId, updateFields, { new: true });

        if (!updatedUser) {
            mFobjReturn(0, 'Không tìm thấy người dùng', null);

        } else {

            mFobjReturn(1, 'Cập nhật thành công', updatedUser);

        }
    } catch (error) {
        mFobjReturn(0, error.message, null);

        return res.status(401).json(objReturn)

    }

    res.json(objReturn);
}
const changePassword = async (req, res, next) => {
    objReturn.data = null;

    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.userId;

        if (!oldPassword || !newPassword) {
            mFobjReturn(0, 'Nhập đầy đủ mật khẩu', null);
            return res.status(400).json(objReturn);

        }
        if (newPassword.length < 8) {
            mFobjReturn(0, 'Mật khẩu mới phải có ít nhất 8 ký tự', null);

            return res.status(400).json(objReturn);
        }

        const user = await mdU.userModel.findById(userId);
        if (!user) {

            mFobjReturn(0, 'Người dùng không tồn tại', null);

            return res.status(404).json(objReturn);
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatch) {
            mFobjReturn(0, 'Mật khẩu cũ không chính xác', null);

            return res.status(401).json(objReturn);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedNewPassword;
        await user.save();

        mFobjReturn(1, 'Mật khẩu đã được thay đổi thành công', null);

        return res.status(200).json(objReturn);
    } catch (error) {
        mFobjReturn(0, 'Đã xảy ra lỗi khi thay đổi mật khẩu', null);

        return res.status(500).json(objReturn);
    }
}
const userLogin = async (req, res, next) => {
    const { email, password } = req.body;
    objReturn.data = null;

    try {
        const user = await mdU.userModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác 1' })
        }
        const isPasswordmatch = await bcrypt.compare(password, user.password);
        if (!isPasswordmatch) {
            return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác' })

        }

        objReturn.data = ({ user });

        mFobjReturn(1, 'đăng nhập thành công ', (user));

    } catch (error) {
        mFobjReturn(0, error.message, null);

        return res.status(500).json(objReturn)

    }
    res.json(objReturn);
}

module.exports = {
    getById,
    addUser,
    updateById,
    changePassword,
    userLogin
}