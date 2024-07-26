var db = require('../../config/db');

var commentSchema = new db.mongoose.Schema({
    user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true },
    content: { type: String, required: true }
}, { collection: 'comments', timestamps: true });

let commentModel = db.mongoose.model('commentModel', commentSchema);

module.exports = { commentModel };
