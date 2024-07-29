const express = require("express");
const router = express.Router();

const apiUserRoute = require("../modules/user/user.route");
const apiTasksRoute = require("../modules/task/task.route");
const apiResultRoute = require("../modules/result/result.route");
const apiCreateDocument = require("../modules/tool/createDocument.route");

router.use("/u", apiUserRoute);

router.use("/task", apiTasksRoute);
router.use("/result", apiResultRoute);

router.use("/run", apiCreateDocument);

module.exports = router;
