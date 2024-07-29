const express = require('express');
const router = express.Router();
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const api_tasks = require('./task.controller');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Thư mục trên Cloudinary nơi ảnh sẽ được lưu trữ
    allowed_formats: ['jpg', 'png'],
  },
});
const upload = multer({ storage: storage });

router.post('/addTask', upload.single('image'), api_tasks.addTask);
router.get('/u/:userId', api_tasks.getByUserId);
router.get('/search', api_tasks.getByName);
router.get('/:Id', api_tasks.getById);
router.put(
  '/updateTasks/:taskId',
  upload.single('image'),
  api_tasks.updateById,
);
router.post('/delTasks/:taskId', api_tasks.deleteById);

module.exports = router;
