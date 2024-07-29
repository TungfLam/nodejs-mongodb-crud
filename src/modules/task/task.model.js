var db = require('../../config/db');

var taskSchema = new db.mongoose.Schema(
  {
    user_id: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true,
    },
    name: { type: String, required: true },
    desc: { type: String, required: true },
    image: { type: String, required: false },
    deadline: { type: Date, required: true },
    status: { type: Number, enum: [0, 1], default: 1 },
    create_by: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true,
    },
    update_by: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: false,
    },
    is_delete: { type: Boolean, default: false },
    delete_by: {
      type: db.mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: false,
    },
    tags: [{ type: String }],
    results: [{ type: db.mongoose.Schema.Types.ObjectId, ref: 'resultModel' }],
  },
  { collection: 'tasks', timestamps: true },
);

let taskModel = db.mongoose.model('taskModel', taskSchema);

module.exports = { taskModel };
