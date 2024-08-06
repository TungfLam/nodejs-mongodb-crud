const database = require('../../config/db');
const { timestampPlugin, blockCreateBy } = require('./result.middleware');

const resultSchema = new database.mongoose.Schema(
    {
        user_id: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
            index: true,
        },
        task_id: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'taskModel',
            required: true,
            index: true,
        },
        description: { type: String, required: true }, // Mô tả nội dung kết quả.
        score: { type: Number, min: 0, max: 100, required: true, index: true }, // Điểm số kết quả.
        feedback: { type: String, required: false }, // Phản hồi về kết quả.
        is_delete: { type: Boolean, default: false }, // Đánh dấu kết quả đã bị xóa.
        outcome: {
            type: String,
            enum: ['failure', 'partial success', 'pending review', 'success'],
            required: true,
            index: true,
        }, // Kết quả của công việc.
        duration: { type: Number, required: false }, // Thời gian hoàn thành công việc (tính bằng giờ).
        notes: { type: String, required: false }, // Ghi chú thêm từ người submit hoặc người đánh giá.
        approval_status: {
            type: String,
            enum: ['approved', 'rejected', 'pending'],
            default: 'pending',
            index: true,
        }, // Trạng thái phê duyệt của kết quả.
        effort_level: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
            index: true,
        }, // Mức độ nỗ lực cần thiết.
        is_public: { type: Boolean, default: false }, // Trạng thái công khai của kết quả.

        // Thêm các trường mới
        reviewer_id: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: false,
            index: true,
        }, // Người đánh giá kết quả.
        review_date: { type: Date, required: false }, // Ngày đánh giá kết quả.
        comments: { type: String, required: false }, // Các nhận xét thêm về kết quả.
        improvement_suggestions: { type: String, required: false }, // Gợi ý cải thiện.
        next_steps: { type: String, required: false }, // Bước tiếp theo sau kết quả này.
        performance_level: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
            index: true,
        }, // Mức độ hiệu suất của kết quả.
        updated_by: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: false,
        }, // Người cập nhật kết quả.
        deleted_by: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: false,
        }, // Người xóa kết quả.

        // Lưu ID của các bảng mới
        attachments: [
            {
                type: database.mongoose.Schema.Types.ObjectId,
                ref: 'attachmentModel',
                required: false,
            },
        ],
        tags: [{ type: String, required: false }],
    },
    {
        collection: 'results',
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }, // Lưu trữ trong collection 'results' và thêm timestamp tự động.
);

resultSchema.plugin(timestampPlugin);
blockCreateBy(resultSchema);

let resultModel = database.mongoose.model('resultModel', resultSchema);

// Bảng attachment
const attachmentSchema = new database.mongoose.Schema(
    {
        file_name: { type: String, required: true },
        file_url: { type: String, required: true },
    },
    {
        collection: 'attachments',
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    },
);

const attachmentModel = database.mongoose.model(
    'attachmentModel',
    attachmentSchema,
);

module.exports = { resultModel, attachmentModel };
