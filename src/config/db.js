require('dotenv').config();

const mongoose = require('mongoose');

mongoose
    .connect(process.env.URI_DATABASE_MONGODB_ATLAS)
    .then(() => {
        console.log('CONNECT MONGODB SUCCESSFULLY');
    })
    .catch((err) => {
        console.log('ERROR CONNECT MONGODB ATLAS');
        console.log(err);
    });

module.exports = { mongoose };
