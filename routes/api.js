const express = require("express");
const router = express.Router();


const apiUserRoute = require("./api.user");
const apiTasksRoute = require("./api.task");

/**
 * Định tuyến cho các API liên quan đến người dùng.
 *
 * @module apiUserRoute
 */
router.use("/u", apiUserRoute);



/**
 * Định tuyến cho các API liên quan đến nhiệm vụ.
 *
 * @module apiTasksRoute
 */
router.use("/task", apiTasksRoute);


module.exports = router;
