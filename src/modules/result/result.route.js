const express = require("express");
const router = express.Router();
const resultController = require("./result.controller");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const dotenv = require("dotenv");
dotenv.config();

router.get("/:id", resultController.getResultsUserTasks);
router.post("/:id", resultController.createResultsUserTask);
router.put(
  "/update/:id",
  //   upload.single("avatar"),
  resultController.updateResultsUserTask
);
router.delete("/:id", resultController.deleteResultsUserTask);

module.exports = router;
