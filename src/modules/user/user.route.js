const express = require('express');
const router = express.Router();

const api_user = require('./user.controller');

router.post('/register', api_user.createUser);
router.post('/login', api_user.loginUser);

router.get('/:id', api_user.getUserById);
router.put('/updateUser/:userId', api_user.updateUserById);
router.post('/changePassword/:userId', api_user.updatePassword);

module.exports = router;
