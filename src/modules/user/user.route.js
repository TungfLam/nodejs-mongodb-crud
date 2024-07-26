const express = require('express');
const router = express.Router();

const api_user = require('./user.controller');

router.get('/', api_user.getByU);
router.post('/register', api_user.addUser);
router.post('/login', api_user.userLogin);
router.put('/updateUser/:userId', api_user.updateById);
router.post('/changePassword/:userId', api_user.changePassword);

module.exports = router;
