const express = require('express');
const router = express.Router();
const resultController = require('./result.controller');
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads'); // Thư mục lưu trữ tệp
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        const basename = path.basename(file.originalname, extension);
        cb(null, `${basename}-${uniqueSuffix}${extension}`); // Tạo tên tệp duy nhất
    },
});
const upload = multer({ storage: storage });
const dotenv = require('dotenv');
dotenv.config();

router.get('/:task_id', resultController.getResultsUserTasks);
router.post(
    '/:task_id',
    upload.any('attachments'),
    resultController.createResultsUserTask,
);
router.put(
    '/update/:result_id',
    upload.any('attachments'),
    resultController.updateResultsUserTask,
);
router.delete('/:result_id', resultController.deleteResultsUserTask);
router.get('/detail/:result_id', resultController.getDetailResultsUserTask);

module.exports = router;
