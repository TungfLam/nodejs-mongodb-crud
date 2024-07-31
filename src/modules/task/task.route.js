const express = require('express');
const router = express.Router();
const api_tasks = require('./task.controller');
const { upload } = require('./task.service');

// Route để thêm nhiệm vụ mới, sử dụng middleware upload để xử lý ảnh
router.post('/addTask', upload.single('image'), api_tasks.createTask);

// Route để lấy tất cả nhiệm vụ của người dùng theo userId
router.get('/u/:userId', api_tasks.getTasksByUserId);

// Route để tìm kiếm nhiệm vụ theo tên
router.get('/search', api_tasks.searchTasksByName);

// Route để lấy nhiệm vụ theo Id
router.get('/:Id', api_tasks.getTaskById);

// Route để cập nhật nhiệm vụ theo taskId, sử dụng middleware upload để xử lý ảnh
router.put(
    '/updateTasks/:taskId',
    // upload.single('image'),
    api_tasks.updateTaskById,
);

// Route để xóa nhiệm vụ theo taskId
router.post('/delTasks/:taskId', api_tasks.deleteTaskById);

module.exports = router;
