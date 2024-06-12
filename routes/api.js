const express = require("express");
const router = express.Router();


const apiUserRoute = require("./api.user");
const apiTasksRoute = require("./api.task");

router.use("/u", apiUserRoute);
router.use("/task", apiTasksRoute);


module.exports = router;
