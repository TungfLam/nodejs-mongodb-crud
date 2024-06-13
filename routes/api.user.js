const express = require('express');
const router = express.Router();
var middlewaresAuthJwt = require('../middlewares/authJwt');

const api_user = require('../controllers/api.user');

/**
 * Định tuyến lấy thông tin người dùng hiện tại.
 *
 * @name GET/api/u
 * @function
 * @memberof module:api_user
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xác thực token JWT.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.get('/', middlewaresAuthJwt.verifyToken, api_user.getByU);
/**
 * Định tuyến đăng ký người dùng mới.
 *
 * @name POST/api/u/register
 * @function
 * @memberof module:api_user
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.post('/register', api_user.addUser);
/**
 * Định tuyến đăng nhập người dùng.
 *
 * @name POST/api/u/login
 * @function
 * @memberof module:api_user
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.post('/login', api_user.userLogin);
/**
 * Định tuyến cập nhật thông tin người dùng.
 *
 * @name PUT/api/u/updateUser/:userId
 * @function
 * @memberof module:api_user
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.put('/updateUser/:userId', api_user.updateById);

/**
 * Định tuyến thay đổi mật khẩu của người dùng.
 *
 * @name POST/api/u/changePassword/:userId
 * @function
 * @memberof module:api_user
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.post('/changePassword/:userId', api_user.changePassword);

module.exports = router;
