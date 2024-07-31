const database = require('../../config/db');
const { timestampPlugin, blockCreateBy } = require('./result.middleware');

const resultSchema = new database.mongoose.Schema(
  {
    user_id: {
      type: database.mongoose.Schema.Types.ObjectId,
      ref: 'userModel',
      required: true,
    },
    task_id: {
      type: database.mongoose.Schema.Types.ObjectId,
      ref: 'taskModel',
      required: true,
    },
    name: { type: String, require: false },
    description: { type: String, required: true },
    result_image: { type: Array, required: false },
    score: { type: Number, min: 0, max: 100, required: true },
    feedback: { type: String, required: false },
    is_delete: { type: Boolean, default: false },
    outcome: {
      type: String,
      enum: ['failure', 'partial success', 'pending review', 'success'],
      required: true,
    },
  },
  { collection: 'results', timestamps: true },
);
resultSchema.plugin(timestampPlugin);
blockCreateBy(resultSchema);

let resultModel = database.mongoose.model('resultModel', resultSchema);

module.exports = { resultModel };
