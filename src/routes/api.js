const express = require("express");
const router = express.Router();

const apiUserRoute = require("../modules/user/user.route");
const apiTasksRoute = require("../modules/task/task.route");

router.use("/u", apiUserRoute);

router.use("/task", apiTasksRoute);

module.exports = router;