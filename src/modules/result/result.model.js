var db = require('../../config/db');

var resultSchema = new db.mongoose.Schema({
    user_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'userModel', required: true },
    task_id: { type: db.mongoose.Schema.Types.ObjectId, ref: 'taskModel', required: true },
    description: { type: String, required: true },
    result_image: { type: String, required: false },
    score: { type: Number, required: true },
    feedback: { type: String, required: false },
    outcome: { type: String, enum: ['failure', 'partial success', 'pending review', 'success'], required: true },
}, { collection: 'results', timestamps: true });

let resultModel = db.mongoose.model('resultModel', resultSchema);

module.exports = { resultModel };
