var db = require('../config/db');
require('dotenv').config();
const privateKEY = process.env.TOKEN_SEC_KEY;
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

var userSchema = new db.mongoose.Schema(
    {
        FullName: { type: String, required: true },
        Email: { type: String, required: true, unique: true },
        PhoneNumber: { type: String, required: true },
        Password: { type: String, required: true },
        token: { type: String, required: false },
        RegistrationDate: { type: Date, required: true }
    },
    { collection: 'users' }
);

userSchema.methods.generateAuthToken = async function () {

    const user = this
    // console.log(user)
    const token = jwt.sign({ _id: user._id, Email: user.Email }, privateKEY)
    // user.tokens = user.tokens.concat({token}) // code này dành cho nhiều token, ở demo này dùng 1 token
    user.token = token;
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (Email, Password) => {

    const user = await userModel.findOne({ Email })
    if (!user) {
        throw new Error('Không tồn tại user');
    }
    const isPasswordMatch = await bcrypt.compare(Password, user.Password)
    if (!isPasswordMatch) {
        throw new Error('Sai password');
    }
    return user
}

let userModel = db.mongoose.model('userModel', userSchema);

module.exports = { userModel };