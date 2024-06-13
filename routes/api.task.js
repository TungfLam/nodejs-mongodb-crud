const express = require('express');
const router = express.Router();
require('dotenv').config();

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const multer = require('multer');

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

const api_tasks = require('../controllers/api.task');

/**
 * Định tuyến thêm nhiệm vụ mới với ảnh đính kèm.
 *
 * @name POST/api/task/addTask
 * @function
 * @memberof module:api_task
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.post('/addTask', upload.single('Image'), api_tasks.addTask);
/**
 * Định tuyến lấy danh sách nhiệm vụ theo userId.
 *
 * @name GET/api/task/u/:userId
 * @function
 * @memberof module:api_task
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.get('/u/:userId', api_tasks.getByUserId);
/**
 * Định tuyến lấy thông tin nhiệm vụ theo Id.
 *
 * @name GET/api/task/:Id
 * @function
 * @memberof module:api_task
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.get('/:Id', api_tasks.getById);
/**
 * Định tuyến cập nhật thông tin nhiệm vụ.
 *
 * @name PUT/api/task/updateTasks/:taskId
 * @function
 * @memberof module:api_task
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.put('/updateTasks/:taskId',upload.single('Image'), api_tasks.updateById);
/**
 * Định tuyến xóa nhiệm vụ.
 *
 * @name DELETE/api/task/delTasks/:taskId
 * @function
 * @memberof module:api_task
 * @inner
 * @param {string} path - Đường dẫn endpoint.
 * @param {Callback} middleware - Middleware xử lý yêu cầu.
 */
router.delete('/delTasks/:taskId', api_tasks.deleteById);




module.exports = router;
