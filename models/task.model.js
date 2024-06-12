var db = require('../config/db');
var taskSchema = new db.mongoose.Schema(
    {
        UserID: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', required: false },
        Name: { type: String, required: false},
        Desc: { type: String, required: false},
        Image: { type: String, required: false},
        CreateAt: { type: Date, required: false },
        Deadline: { type: Date, required: false },
        Status: { type: Number, required: false }


    },
    { collection: 'tasks' }
);

let taskModel = db.mongoose.model('taskModel', taskSchema);

module.exports = { taskModel };