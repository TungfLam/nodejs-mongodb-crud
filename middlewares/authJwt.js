const jwt = require('jsonwebtoken')
const mUser = require('../models/user.model');
require('dotenv').config(); // su dung thu vien doc file env
const priveteKEY = process.env.TOKEN_SEC_KEY;
/**
 * Middleware xác thực token JWT.
 *
 * @param {Object} req - Yêu cầu từ client.
 * @param {Object} res - Đối tượng trả về cho client.
 * @param {Function} next - Hàm middleware tiếp theo.
 * @returns {Promise<void>}
 */
const verifyToken = async (req, res, next) => {
    let header_token = req.header('Authorization');

    if (typeof (header_token) == 'undefined') {
        return res.status(403).json({ msg: 'Không xác định token' });
    }
    const token = header_token.replace('Bearer ', '')


    try {
        const data = jwt.verify(token, priveteKEY)
        console.log(data);
        const user = await mUser.userModel.findOne({ _id: data._id, token: token })
        if (!user) {
            throw new Error("Không xác định được người dùng")
        }
        // console.log(user);

        req.user = user
        req.token = token
        next();
    } catch (error) {
        console.log(error);
        res.status(401).send({ error: error.message })
    }

}
module.exports = { verifyToken }
