/**
 * Đọc cấu hình từ file .env.
 */
require('dotenv').config();

const mongoose = require('mongoose');

/**
 * Kết nối tới cơ sở dữ liệu MongoDB Atlas sử dụng URI từ biến môi trường.
 */
mongoose.connect(process.env.URI_DATABASE_MONGODB_ATLAS)
    .then(() => {
        console.log("CONNECT MONGODB SUCCESSFULLY");
    })
    .catch((err) => {
        console.log('ERROR CONNECT MONGODB ATLAS');
        console.log(err);
    });

/**
 * Xuất đối tượng mongoose để sử dụng trong các phần khác của ứng dụng.
 * @module mongoose
 */
module.exports = { mongoose };
