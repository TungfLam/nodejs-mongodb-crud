var database = require('../../config/db');
require('dotenv').config();

var userSchema = new database.mongoose.Schema(
  {
    full_name: { type: String, required: true }, // Tên đầy đủ của người dùng.
    email: { type: String, required: true, unique: true }, // Email của người dùng (phải là duy nhất).
    phone_number: { type: String, required: true }, // Số điện thoại của người dùng.
    password: { type: String, required: true }, // Mật khẩu của người dùng.
    registration_date: { type: Date, default: Date.now() }, // Ngày đăng ký (mặc định là thời điểm hiện tại).
  },
  { collection: 'users' }, // Lưu trữ trong collection 'users'.
);

let userModel = database.mongoose.model('userModel', userSchema);

module.exports = { userModel };
