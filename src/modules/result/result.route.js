const express = require("express");
const router = express.Router();
const resultController = require("./result.controller");

router.get("/:id", resultController.getResultsUserTasks);
router.post("/:id", resultController.createResultsUserTask);

module.exports = router;
