const express = require('express');
const router = express.Router();
const resultController = require('./result.controller');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
const dotenv = require('dotenv');
dotenv.config();

router.get('/:task_id', resultController.getResultsUserTasks);
router.post(
  '/:task_id',
  upload.any('result_image'),
  resultController.createResultsUserTask,
);
router.put(
  '/update/:result_id',
  upload.any('result_image'),
  resultController.updateResultsUserTask,
);
router.delete('/:result_id', resultController.deleteResultsUserTask);
router.get('/detail/:result_id', resultController.getDetailResultsUserTask);

module.exports = router;
