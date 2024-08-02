const mongoose = require('mongoose');
const { resultModel } = require('../result/result.model'); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án
const { taskModel } = require('../task/task.model'); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án
const { userModel } = require('../user/user.model'); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án

/**
 * Hàm tạo bản ghi mẫu cho `resultModel`.
 * @param {Array} tasks - Danh sách các task.
 * @param {number} userCount - Số lượng user.
 * @param {Array} users - Danh sách các user.
 * @returns {Promise<void>} - Một Promise khi việc chèn bản ghi hoàn tất.
 */
async function createResultRecords(tasks, userCount, users) {
    try {
        const tasks = await taskModel.find({}, '_id').exec();
        const taskCount = tasks.length;

        if (taskCount === 0) {
            console.log(
                'No tasks found. Please create tasks before creating results.',
            );
            return;
        }
        // Tạo các bản ghi mới
        let records = [];
        let bulkOps = [];
        tasks.forEach((task) => {
            const resultCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < resultCount; i++) {
                const randomUser =
                    users[Math.floor(Math.random() * userCount)]._id;
                const randomUpdateUser =
                    users[Math.floor(Math.random() * userCount)]._id;

                const newResult = {
                    user_id: randomUser, // Thay thế bằng ObjectId của user thật nếu cần
                    name: `Result for Task ${task._id} - ${i}`,
                    task_id: task._id,
                    description: `Description for result ${i}`,
                    score: Math.floor(Math.random() * 101), // Random score từ 0 đến 100
                    outcome: [
                        'failure',
                        'partial success',
                        'pending review',
                        'success',
                    ][Math.floor(Math.random() * 4)],
                    update_by: randomUpdateUser,
                    result_image:
                        'https://res-console.cloudinary.com/dklylkfoe/thumbnails/v1/image/upload/v1718182681/bGlmZXRlay9qN2Zpc2FmbXVubGNqazV2aWZoMg==/drilldown',
                    is_delete: false,
                    feedback: `Task ${task._id} đã được feedback bởi ${randomUser}`,
                    delete_by: null,
                    duration: { type: Number, required: false }, // Thời gian hoàn thành công việc (tính bằng giờ).
                    notes: { type: String, required: false }, // Ghi chú thêm từ người submit hoặc người đánh giá.
                    attachments: [
                        {
                            file_id: { type: String, required: false },
                            file_name: { type: String, required: false },
                            file_url: { type: String, required: false },
                        },
                    ], // Các file đính kèm liên quan đến kết quả.
                    approval_status: {
                        type: String,
                        enum: ['approved', 'rejected', 'pending'],
                        default: 'pending',
                    }, // Trạng thái phê duyệt của kết quả.
                    tags: [{ type: String, required: false }], // Các thẻ liên quan đến kết quả.
                    effort_level: {
                        type: String,
                        enum: ['low', 'medium', 'high'],
                        default: 'medium',
                    }, // Mức độ nỗ lực cần thiết.
                    is_public: { type: Boolean, default: false }, // Trạng thái công khai của kết quả.
                };
                records.push(newResult);
                console.log(`result ${i} created`);
            }
        });

        // Chèn tất cả các bản ghi cùng một lúc
        const createdResults = await resultModel.insertMany(records);

        // Chuẩn bị các thao tác bulk update
        createdResults.forEach((result) => {
            bulkOps.push({
                updateOne: {
                    filter: { _id: result.task_id },
                    update: { $push: { results: result._id } },
                },
            });
        });

        // Thực hiện các thao tác bulk update
        await taskModel.bulkWrite(bulkOps);

        console.log(`${createdResults.length} result records inserted!`);
    } catch (err) {
        console.error('Error creating result records:', err);
    }
}

/**
 * Hàm tạo bản ghi mẫu cho `taskModel`.
 * @param {number} count - Số lượng bản ghi cần tạo.
 * @returns {Promise<void>} - Một Promise khi việc chèn bản ghi hoàn tất.
 */
async function createTaskRecords(count) {
    try {
        // Lấy tất cả các user_id
        const users = await userModel.find({}, '_id').exec();
        const userCount = users.length;

        if (userCount === 0) {
            console.log(
                'No users found. Please create users before creating tasks.',
            );
            return;
        }

        let records = [];
        for (let i = 0; i < count; i++) {
            const randomUser = users[Math.floor(Math.random() * userCount)]._id;
            const randomUpdateUser =
                users[Math.floor(Math.random() * userCount)]._id;

            // Chọn ngẫu nhiên số lượng user được chỉ định (giả sử tối đa 5 user)
            const assignedUserCount = Math.floor(Math.random() * 5) + 1;
            const assignedUsers = [];
            for (let j = 0; j < assignedUserCount; j++) {
                const randomAssignedUser =
                    users[Math.floor(Math.random() * userCount)]._id;
                if (!assignedUsers.includes(randomAssignedUser)) {
                    assignedUsers.push(randomAssignedUser);
                }
            }
            // Tạo ngày bắt đầu và kết thúc ngẫu nhiên trong vòng một năm
            const created_at = new Date(
                Date.now() -
                    Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
            );
            const deadline = new Date(
                created_at.getTime() +
                    Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
            );

            const newTask = {
                user_id: randomUser, // Thay thế bằng ObjectId của user thật nếu cần
                name: `Task ${i}`,
                desc: `Description for task ${i}`,
                created_at: created_at,
                deadline: deadline,
                status: Math.floor(Math.random() * 2), // Random status 0 hoặc 1
                create_by: randomUser, // Thay thế bằng ObjectId của user thật nếu cần
                is_delete: false,
                image: 'https://res-console.cloudinary.com/dklylkfoe/thumbnails/v1/image/upload/v1718182681/bGlmZXRlay9qN2Zpc2FmbXVubGNqazV2aWZoMg==/drilldown',
                delete_by: null,
                update_by: randomUpdateUser,
                tags: ['gia đình', 'riêng tư'],
                results: [], // Thêm trường results để chứa các result
                assigned_users: assignedUsers, // Danh sách các user được chỉ định
            };
            records.push(newTask);
            console.log(`Task ${i} created`);
        }

        const createdTasks = await taskModel.insertMany(records);
        console.log(`${count} task records inserted!`);

        // Gọi hàm tạo result records sau khi tạo task records
        await createResultRecords(createdTasks, userCount, users);
    } catch (err) {
        console.error('Error creating task records:', err);
    }
}

/**
 * Hàm chính để thêm bản ghi vào cơ sở dữ liệu.
 * Gọi các hàm `createResultRecords` và `createTaskRecords`.
 * @returns {Promise<void>} - Một Promise khi quá trình thêm bản ghi hoàn tất.
 */
async function run() {
    try {
        const count = 200000; // Số bản ghi cho mỗi mô hình
        for (i = 0; i < 50; i++) {
            const createTaskRecord = await createTaskRecords(count);
            console.log('còn ', 50 - i, ' lần');
        }
    } catch (err) {
        console.error('Error running the script:', err);
    }
}

module.exports = {
    run,
};
