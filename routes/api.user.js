const express = require('express');
const router = express.Router();
var middlewaresAuthJwt = require('../middlewares/authJwt');



const api_user = require('../controllers/api.user');




router.get('/', middlewaresAuthJwt.verifyToken, api_user.getByU);

router.post('/register', api_user.addUser);
router.post('/login', api_user.userLogin);

router.put('/updateUser/:userId', api_user.updateById);
router.post('/changePassword/:userId', api_user.changePassword);



// router.post('/senmail', api_user.sendMail);



module.exports = router;
