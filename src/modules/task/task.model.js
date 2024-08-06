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
            required: false,
        }, // Người cập nhật nhiệm vụ (không bắt buộc).
        is_delete: { type: Boolean, default: false }, // Đánh dấu nhiệm vụ đã bị xóa.
        delete_by: {
            type: database.mongoose.Schema.Types.ObjectId,
            ref: 'userModel',
            required: false,
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
        progress: { type: Number, required: false }, // Tỷ lệ hoàn thành nhiệm vụ (0 - 100%)
        category: { type: String, required: false }, // Phân loại nhiệm vụ
        permissions: {
            can_edit: { type: Boolean, default: false },
            can_delete: { type: Boolean, default: false },
            can_view: { type: Boolean, default: false },
        }, // Quyền hạn của người thực hiện nhiệm vụ
        reminders: [
            {
                time: { type: Date, required: false },
                message: { type: String, required: false },
            },
        ], // Các nhắc nhở liên quan đến nhiệm vụ
        feedback: [
            {
                user_id: {
                    type: database.mongoose.Schema.Types.ObjectId,
                    ref: 'userModel',
                },
                rating: { type: Number, required: false },
                comment: { type: String, required: false },
            },
        ], // Đánh giá và nhận xét sau khi hoàn thành nhiệm vụ
        completed_address: { type: String, required: false }, // Địa chỉ hoàn thành nhiệm vụ
        note1: { type: String, required: false }, // Ghi chú nhiệm vụ
        note2: { type: String, required: false }, // Ghi chú nhiệm vụ
        note3: { type: String, required: false }, // Ghi chú nhiệm vụ
        note4: { type: String, required: false }, // Ghi chú nhiệm vụ
        note5: { type: String, required: false }, // Ghi chú nhiệm vụ
        note6: { type: String, required: false }, // Ghi chú nhiệm vụ
        note7: { type: String, required: false }, // Ghi chú nhiệm vụ
        note8: { type: String, required: false }, // Ghi chú nhiệm vụ
        note9: { type: String, required: false }, // Ghi chú nhiệm vụ
        note10: { type: String, required: false }, // Ghi chú nhiệm vụ
    },
    {
        collection: 'tasks',
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }, // Lưu trữ trong collection 'tasks' và thêm timestamp tự động.
);

// Tạo index
taskSchema.index({
    deadline: 1,
    user_id: 1,
    is_delete: 1,
    name: 1,
    status: 1,
    priority: 1,
    is_completed: 1,
    difficulty: 1,
    location: 1,
    created_at: -1,
});

let taskModel = database.mongoose.model('taskModel', taskSchema);

// Tạo index khi khởi động ứng dụng
const createIndexes = async () => {
    try {
        await taskModel.createIndexes();
        console.log('Indexes created successfully');
    } catch (error) {
        console.error('Error creating indexes:', error);
    }
};

// Gọi hàm tạo index
createIndexes();

// Hàm để lấy danh sách index (có thể gọi khi cần)
const getIndexes = async () => {
    try {
        const indexes = await taskModel.listIndexes();
        console.log('Indexes:', indexes);
    } catch (error) {
        console.error('Error getting indexes:', error);
    }
};
module.exports = { taskModel };
