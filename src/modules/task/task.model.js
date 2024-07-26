var db = require('../../config/db');
var taskSchema = new db.mongoose.Schema(
    {
        user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', required: false },
        name: { type: String, required: true},
        desc: { type: String, required: true},
        image: { type: String, required: true},
        create_at: { type: Date, required: true },
        deadline: { type: Date, required: true },
        status: { type: Number, required: true }

    },
    { collection: 'tasks' }
);

let taskModel = db.mongoose.model('taskModel', taskSchema);

module.exports = { taskModel };