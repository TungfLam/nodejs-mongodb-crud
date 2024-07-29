const express = require("express");
const router = express.Router();
const createDocument = require("./createDocument");

router.get("/", createDocument.run);

module.exports = router;
