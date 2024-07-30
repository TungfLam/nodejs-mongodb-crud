const express = require('express');
const router = express.Router();
const api_tasks = require('./task.controller');
const { upload } = require('./task.service');

router.post('/addTask', upload.single('image'), api_tasks.createTask);
router.get('/u/:userId', api_tasks.getTasksByUserId);
router.get('/search', api_tasks.searchTasksByName);
router.get('/:Id', api_tasks.getTaskById);
router.put(
  '/updateTasks/:taskId',
  // upload.single('image'),
  api_tasks.updateTaskById,
);
router.post('/delTasks/:taskId', api_tasks.deleteTaskById);

module.exports = router;
