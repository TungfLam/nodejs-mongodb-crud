var mdU = require('../models/user.model');
const moment = require('moment-timezone');

const timeZone = 'Asia/Ho_Chi_Minh';
var now = moment().tz(timeZone);


const bcrypt = require('bcrypt');
var objReturn = {
    status: 1,
    msg: 'OK'
}

/**
 * Kiểm tra định dạng email.
 *
 * @param {string} mail - Địa chỉ email cần kiểm tra.
 * @returns {boolean} - Trả về true nếu email hợp lệ, ngược lại false.
 */
const isCheckMail = (mail) => {

    const reg = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const isCheckMail = reg.test(mail)

    return isCheckMail;

}

/**
 * Cập nhật đối tượng trả về.
 *
 * @param {number} a - Trạng thái.
 * @param {string} b - Thông báo.
 * @param {*} c - Dữ liệu trả về.
 */
const mFobjReturn = (a, b, c) => {
    objReturn.status = a;
    objReturn.msg = b;
    objReturn.data = c;
}


/**
 * Lấy thông tin người dùng hiện tại.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {void}
 */
exports.getByU = async (req, res, next) => {

    mFobjReturn(1, 'tìm thành công 2', req.user);

    res.json(objReturn);
}
/**
 * Thêm người dùng mới.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.addUser = async (req, res, next) => {
    objReturn.data = null;

    try {
        const { FullName, Email, PhoneNumber, Password: userPassword } = req.body;

        const mIsCheckMail = isCheckMail(Email)
        if (mIsCheckMail == false) {

            mFobjReturn(0, 'meo lỗi kìa', null);
            return res.status(401).json(objReturn);

        }

        const RegistrationDate = now;
        const existingUser = await mdU.userModel.findOne({ Email });
        if (existingUser) {

            mFobjReturn(0, 'Email đã tồn tại', null);
            return res.status(401).json(objReturn)

        }
        const hashedPassword = await bcrypt.hash(userPassword, 10);

        const newUser = await mdU.userModel.create({
            FullName,
            Password: hashedPassword,
            PhoneNumber,
            Email,
            RegistrationDate
        });

        // const savedUser = await newUser.save();

        const { Password: pwd, ...userWithoutPassword } = newUser.toObject();



        mFobjReturn(1, 'người dùng được tạo thành công', userWithoutPassword);

    } catch (error) {
        objReturn.status = 0;
        objReturn.msg = error.message;
    }

    res.json(objReturn);
}

/**
 * Cập nhật người dùng theo ID.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.updateById = async (req, res, next) => {
    objReturn.data = null;

    try {
        const userId = req.params.userId;
        const updateFields = req.body;

        delete updateFields.Password;

        const mIsCheckMail = isCheckMail(updateFields.Email)
        if (mIsCheckMail == false) {

            mFobjReturn(0, 'meo lỗi kìa ', null);
            return res.status(401).json(objReturn);

        }

        // if (updateFields.password) {
        //     const hashedPassword = await bcrypt.hash(updateFields.password, 10); // 10 là số vòng lặp (cost factor)
        //     updateFields.password = hashedPassword;
        // }


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

/**
 * Thay đổi mật khẩu người dùng.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.changePassword = async (req, res, next) => {
    objReturn.data = null;

    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.params.userId;

        const user = await mdU.userModel.findById(userId);
        if (!user) {

            mFobjReturn(0, 'Người dùng không tồn tại', null);

            return res.status(404).json(objReturn);
        }

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.Password);
        if (!isPasswordMatch) {
            mFobjReturn(0, 'Mật khẩu cũ không chính xác', null);

            return res.status(401).json(objReturn);
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        user.Password = hashedNewPassword;
        await user.save();

        mFobjReturn(1, 'Mật khẩu đã được thay đổi thành công', null);

        return res.status(200).json(objReturn);
    } catch (error) {
        mFobjReturn(0, 'Đã xảy ra lỗi khi thay đổi mật khẩu', null);

        return res.status(500).json(objReturn);
    }
}
/**
 * Đăng nhập người dùng.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
exports.userLogin = async (req, res, next) => {
    const { Email, Password } = req.body;
    objReturn.data = null;

    try {
        const user = await mdU.userModel.findByCredentials(Email, Password);

        if (!user) {
            return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác 1' })
        }
        // const isPasswordmatch = await bcrypt.compare(Password, user.Password);
        // if (!isPasswordmatch) {
        //     return res.status(401).json({ message: 'Tên người dùng hoặc mật khẩu không chính xác' })

        // }


        const token = await user.generateAuthToken()  // bỏ dòng này để có token

        // objReturn.data = ({ user });
        // objReturn.data = ({ user, token });// bỏ dòng này để có token

        mFobjReturn(1, 'đăng nhập thành công ', (user));


    } catch (error) {
        mFobjReturn(0, error.message, null);

        return res.status(500).json(objReturn)

    }
    res.json(objReturn);
}








