const express = require('express');
const router = express.Router();

const api_user = require('./user.controller');

// Route để đăng ký người dùng mới
router.post('/register', api_user.createUser);

// Route để đăng nhập người dùng
router.post('/login', api_user.loginUser);

// Route để lấy thông tin người dùng theo id
router.get('/:id', api_user.getUserById);

// Route để cập nhật thông tin người dùng theo userId
router.put('/updateUser/:userId', api_user.updateUserById);

// Route để thay đổi mật khẩu người dùng theo userId
router.post('/changePassword/:userId', api_user.updatePassword);

module.exports = router;
