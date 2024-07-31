const express = require("express");
const router = express.Router();
const createDocument = require("./createDocument");
const createTaskAndResult = require("./createTaskAndResult");

router.get("/", createDocument.run);

router.get("/v2", createTaskAndResult.generateDataInsertMany);
router.get("/bulk", createTaskAndResult.generateDataInsertBulk);


module.exports = router;
