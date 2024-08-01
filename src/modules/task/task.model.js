var database = require('../../config/db');

var taskSchema = new database.mongoose.Schema(
    {
        user_id: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        },
        name: { type: String, required: true }, // Tên nhiệm vụ.
        desc: { type: String, required: true }, // Mô tả nhiệm vụ.
        image: { type: String }, // Đường dẫn ảnh (không bắt buộc).
        deadline: { type: Date, required: true }, // Hạn chót nhiệm vụ.
        status: { type: Number, enum: [0, 1], default: 1 }, // Trạng thái nhiệm vụ (0 hoặc 1).
        create_by: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: true,
        }, // Người tạo nhiệm vụ.
        update_by: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
        }, // Người cập nhật nhiệm vụ (không bắt buộc).
        is_delete: { type: Boolean, default: false }, // Đánh dấu nhiệm vụ đã bị xóa.
        delete_by: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
        }, // Người xóa nhiệm vụ (không bắt buộc).
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        }, // Mức độ ưu tiên.
        estimated_time: { type: Number, required: false }, // Thời gian ước tính để hoàn thành nhiệm vụ (giờ).
        actual_time_spent: { type: Number, required: false }, // Thời gian thực tế đã hoàn thành (giờ).
        is_completed: { type: Boolean, default: false }, // Trạng thái hoàn thành.
        difficulty: {
            type: String,
            enum: ['easy', 'intermediate', 'hard'],
            default: 'intermediate',
        }, // Độ khó.
        resources: [{ type: String, required: false }], // Liên kết tài liệu tham khảo.
        location: {
            type: String,
            enum: ['Online', 'Office', 'Home'],
            default: 'Online',
        }, // Địa điểm thực hiện.
        attachments: [
            {
                file_id: { type: String, required: false },
                file_name: { type: String, required: false },
                file_url: { type: String, required: false },
            },
        ], // File đính kèm hoặc tài liệu liên quan.
        tags: [{ type: String, required: false }], // Các thẻ gán cho nhiệm vụ.
        results: [
            {
                type: database.mongoose.Schema.Types.ObjectId,
                ref: 'resultModel',
            },
        ], // Kết quả liên quan đến nhiệm vụ.
    },
    { collection: 'tasks', timestamps: true }, // Lưu trữ trong collection 'tasks' và thêm timestamp tự động.
);

let taskModel = database.mongoose.model('taskModel', taskSchema);

module.exports = { taskModel };
