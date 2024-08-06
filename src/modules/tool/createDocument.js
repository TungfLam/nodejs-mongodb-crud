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
        let records = [];
        let bulkOps = [];
        tasks.forEach((task) => {
            const resultCount = Math.floor(Math.random() * 2) + 1;
            for (let i = 0; i < resultCount; i++) {
                const randomUser =
                    users[Math.floor(Math.random() * userCount)]._id;
                const randomUpdateUser =
                    users[Math.floor(Math.random() * userCount)]._id;
                const randomReviewer =
                    users[Math.floor(Math.random() * userCount)]._id;

                const newResult = {
                    user_id: randomUser,
                    task_id: task._id,
                    description: `Description for result ${i}`,
                    score: Math.floor(Math.random() * 101),
                    outcome: [
                        'failure',
                        'partial success',
                        'pending review',
                        'success',
                    ][Math.floor(Math.random() * 4)],
                    update_by: randomUpdateUser,
                    result_image: 'https://example.com/image.jpg',
                    is_delete: false,
                    feedback: `Task ${task._id} đã được feedback bởi ${randomUser}`,
                    delete_by: null,
                    duration: Math.floor(Math.random() * 24),
                    notes: `Notes for result ${i}`,
                    attachments: [
                        {
                            file_id: `file_id_${i}`,
                            file_name: `file_name_${i}`,
                            file_url: 'https://example.com/file_url',
                        },
                    ],
                    approval_status: ['approved', 'rejected', 'pending'][
                        Math.floor(Math.random() * 3)
                    ],
                    tags: [`tag_${i}`],
                    effort_level: ['low', 'medium', 'high'][
                        Math.floor(Math.random() * 3)
                    ],
                    is_public: Math.random() < 0.5,

                    // Dữ liệu ngẫu nhiên cho các trường mới
                    reviewer_id: randomReviewer,
                    review_date: new Date(),
                    comments: `Comments for result ${i}`,
                    improvement_suggestions: `Suggestions for result ${i}`,
                    related_tasks: [task._id],
                    next_steps: `Next steps for result ${i}`,
                    performance_level: ['low', 'medium', 'high'][
                        Math.floor(Math.random() * 3)
                    ],
                    created_by: randomUser,
                    updated_by: randomUpdateUser,
                    deleted_by: null,
                };
                records.push(newResult);
                console.log(`result ${i} created`);
            }
        });

        const createdResults = await resultModel.insertMany(records);
        createdResults.forEach((result) => {
            bulkOps.push({
                updateOne: {
                    filter: { _id: result.task_id },
                    update: { $push: { results: result._id } },
                },
            });
        });

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
            const randomReviewer =
                users[Math.floor(Math.random() * userCount)]._id;
            const start_date = new Date(
                Date.now() -
                    Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
            );
            const end_date = new Date(
                start_date.getTime() +
                    Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
            );

            const newTask = {
                user_id: randomUser,
                name: `Task ${i}`,
                desc: `Description for task ${i}`,
                start_date: start_date,
                end_date: end_date,
                deadline: new Date(
                    start_date.getTime() +
                        Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
                ),
                status: Math.floor(Math.random() * 2),
                create_by: randomUser,
                is_delete: false,
                image: 'https://example.com/image.jpg',
                delete_by: null,
                update_by: randomUpdateUser,
                tags: ['tag1', 'tag2'],
                results: [],
                assigned_users: users
                    .slice(0, Math.floor(Math.random() * userCount))
                    .map((user) => user._id),

                // Dữ liệu ngẫu nhiên cho các trường mới
                review_date: new Date(),
                reviewed_by: randomReviewer,
                review_notes: `Review notes for task ${i}`,
                follow_up_tasks: [],
                associated_projects: [],
                task_type: ['research', 'development', 'testing', 'deployment'][
                    Math.floor(Math.random() * 4)
                ],
                complexity: ['low', 'medium', 'high'][
                    Math.floor(Math.random() * 3)
                ],
                milestones: [
                    `Milestone 1 for task ${i}`,
                    `Milestone 2 for task ${i}`,
                ],
                task_url: `https://example.com/task/${i}`,
                is_urgent: Math.random() < 0.5,
            };
            records.push(newTask);
            console.log(`Task ${i} created`);
        }

        const createdTasks = await taskModel.insertMany(records);
        console.log(`${count} task records inserted!`);

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
        const count = 50000; // Số bản ghi cho mỗi mô hình
        for (i = 0; i < 60; i++) {
            await createTaskRecords(count);
            console.log('còn ', 60 - i, ' lần');
        }
    } catch (err) {
        console.error('Error running the script:', err);
    }
}

module.exports = {
    run,
};
