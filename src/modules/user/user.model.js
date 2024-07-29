var db = require('../../config/db');
require('dotenv').config();

var userSchema = new db.mongoose.Schema(
    {
        full_name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phone_number: { type: String, required: true },
        password: { type: String, required: true },
        registration_date: { type: Date, default: Date.now() }
    },
    { collection: 'users' }
);


let userModel = db.mongoose.model('userModel', userSchema);

module.exports = { userModel };