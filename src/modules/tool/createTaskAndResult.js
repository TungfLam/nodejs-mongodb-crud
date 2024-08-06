const { resultModel } = require('../result/result.model');
const { taskModel } = require('../task/task.model');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');

const USER_ID = new mongoose.Types.ObjectId('6655f61a814c7f6072791ce0');
const TOTAL_TASKS = 3238969;
const BATCH_SIZE = 2000;

// Xử lý batch:
// Xử lý dữ liệu theo batch giúp kiểm soát việc sử dụng bộ nhớ, cho phép xử lý lượng dữ liệu lớn hơn mà không gây quá tải hệ thống.

// Tối ưu hóa cho MongoDB:
// MongoDB được tối ưu hóa để xử lý các thao tác bulk insert hiệu quả.

// Thời gian thực thi ngắn hơn:
// Với dữ liệu lớn, thời gian thực thi sẽ ngắn hơn đáng kể so với phương pháp insert từng document.

const generateDataInsertBulk = async (req, res, next) => {
    try {
        let totalCreatedBulk = 0; // Lưu trữ tổng số lượng task đã được tạo

        // Chia dữ liệu thành các lô batch để xử lý
        for (let i = 0; i < TOTAL_TASKS; i += BATCH_SIZE) {
            // Khởi tạo bulk operation cho hai bảng task và result
            const taskBulk = taskModel.collection.initializeUnorderedBulkOp();
            const resultBulk =
                resultModel.collection.initializeUnorderedBulkOp();

            // Tạo và thêm dữ liệu cho mỗi batch
            for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_TASKS; j++) {
                const taskId = new mongoose.Types.ObjectId();
                const resultCount = Math.floor(Math.random() * 6) + 1;
                // const resultCount = 1;
                const results = []; // Mảng chứa các objectId của result cho task hiện tại

                // Tạo các document result ngẫu nhiên
                for (let k = 0; k < resultCount; k++) {
                    const resultId = new mongoose.Types.ObjectId();
                    resultBulk.insert({
                        // Thêm document result vào bulk operation
                        _id: resultId,
                        user_id: USER_ID,
                        task_id: taskId,
                        created_at: faker.date.future(),
                        updated_at: faker.date.future(),
                        description: faker.lorem.paragraph(),
                        result_image: [faker.image.url(), faker.image.url()],
                        score: Math.floor(Math.random() * 101),
                        feedback: faker.lorem.sentence(),
                        is_delete: false,
                        outcome: [
                            'failure',
                            'partial success',
                            'pending review',
                            'success',
                        ][Math.floor(Math.random() * 4)], // Outcome ngẫu nhiên.
                        duration: parseFloat((Math.random() * 5).toFixed(1)), // Thời gian hoàn thành ngẫu nhiên (từ 0 đến 5 giờ)
                        notes: faker.lorem.sentence(),
                        attachments: [
                            {
                                file_id: new mongoose.Types.ObjectId(),
                                file_name: faker.system.fileName(),
                                file_url: faker.internet.url(),
                            },
                        ],
                        approval_status: ['approved', 'rejected', 'pending'][
                            Math.floor(Math.random() * 3)
                        ], // Trạng thái phê duyệt ngẫu nhiên
                        tags: [faker.lorem.word(), faker.lorem.word()],
                        effort_level: ['low', 'medium', 'high'][
                            Math.floor(Math.random() * 3)
                        ], // Mức độ nỗ lực ngẫu nhiên
                        is_public: Math.random() < 0.5, // Trạng thái công khai ngẫu nhiên
                    });
                    results.push(resultId); // Thêm objectId của result vào mảng
                }

                const created_at = faker.date.recent({ days: 365 }); // Ngày trong quá khứ trong vòng 365 ngày
                const updated_at = faker.date.between({
                    from: created_at,
                    to: new Date(
                        created_at.getTime() + 365 * 24 * 60 * 60 * 1000,
                    ),
                }); // Ngày giữa created_at và 1 năm sau đó
                const deadline = faker.date.soon({ days: 365 }, updated_at); // Ngày trong vòng 1 năm từ updated_at

                // Tạo document task ngẫu nhiên và thêm vào bulk operation
                taskBulk.insert({
                    _id: taskId,
                    user_id: USER_ID,
                    name: faker.lorem.words(3),
                    desc: faker.lorem.sentence(),
                    image: faker.image.url(),
                    // created_at: faker.date.past(), // Ngày quá khứ
                    // updated_at: faker.date.between(created_at, new Date()), // Ngày giữa created_at và hiện tại
                    // deadline: faker.date.future(),
                    created_at, // Sử dụng giá trị đã khởi tạo
                    updated_at, // Sử dụng giá trị đã khởi tạo
                    deadline, // Ngày tương lai

                    // Các trường mới
                    progress: Math.floor(Math.random() * 101), // Tỷ lệ hoàn thành ngẫu nhiên (0 - 100%)
                    category: faker.lorem.word(), // Phân loại nhiệm vụ ngẫu nhiên
                    permissions: {
                        can_edit: Math.random() < 0.5, // Quyền chỉnh sửa ngẫu nhiên
                        can_delete: Math.random() < 0.5, // Quyền xóa ngẫu nhiên
                        can_view: Math.random() < 0.5, // Quyền xem ngẫu nhiên
                    },
                    reminders: [
                        {
                            time: faker.date.future(), // Thời gian nhắc nhở ngẫu nhiên
                            message: faker.lorem.sentence(), // Thông điệp nhắc nhở ngẫu nhiên
                        },
                    ],
                    feedback: [
                        {
                            user_id: USER_ID, // Giả định user_id là ObjectId ngẫu nhiên
                            rating: Math.floor(Math.random() * 6), // Đánh giá ngẫu nhiên (0-5)
                            comment: faker.lorem.sentence(), // Nhận xét ngẫu nhiên
                        },
                    ],
                    completed_address: faker.location.streetAddress(), // Địa chỉ hoàn thành ngẫu nhiên

                    note1: faker.lorem.words(3),
                    note2: faker.lorem.words(3),
                    note3: faker.lorem.words(3),
                    note4: faker.lorem.words(3),
                    note5: faker.lorem.words(3),
                    note6: faker.lorem.words(3),
                    note7: faker.lorem.words(3),
                    note8: faker.lorem.words(3),
                    note9: faker.lorem.words(3),
                    note10: faker.lorem.words(3),

                    status: Math.random() < 0.5 ? 0 : 1,
                    create_by: USER_ID,
                    update_by: USER_ID,
                    is_delete: false,
                    delete_by: null,
                    priority: ['low', 'medium', 'high'][
                        Math.floor(Math.random() * 3)
                    ], // Độ ưu tiên ngẫu nhiên
                    estimated_time: parseFloat((Math.random() * 10).toFixed(1)), // Thời gian ước tính ngẫu nhiên (từ 0 đến 10 giờ)
                    actual_time_spent: parseFloat(
                        (Math.random() * 10).toFixed(1),
                    ), // Thời gian thực tế ngẫu nhiên (từ 0 đến 10 giờ)
                    is_completed: Math.random() < 0.5, // Trạng thái hoàn thành ngẫu nhiên
                    difficulty: ['easy', 'intermediate', 'hard'][
                        Math.floor(Math.random() * 3)
                    ], // Độ khó ngẫu nhiên
                    resources: [faker.internet.url(), faker.internet.url()], // Các tài liệu tham khảo ngẫu nhiên
                    location: ['Online', 'Office', 'Home'][
                        Math.floor(Math.random() * 3)
                    ], // Địa điểm ngẫu nhiên
                    attachments: [
                        {
                            file_id: new mongoose.Types.ObjectId(),
                            file_name: faker.system.fileName(),
                            file_url: faker.internet.url(),
                        },
                    ],
                    tags: [faker.lorem.word(), faker.lorem.word()],
                    results: results,
                });
            }

            // Thực thi bulk operation cho result và task
            await resultBulk.execute();
            await taskBulk.execute();

            totalCreatedBulk += taskBulk.length;
            console.log(`Đã tạo ${i + BATCH_SIZE} tasks`);
        }

        console.log('Hoàn thành tạo dữ liệu Bulk');
        return res.status(200).json({
            status: 1,
            msg: 'Hoàn thành tạo dữ liệu Bulk',
            totalCreated: totalCreatedBulk,
        });
    } catch (error) {
        console.error('Lỗi:', error);
        return res.status(500).json({
            status: 0,
            msg: 'Đã xảy ra lỗi khi tạo dữ liệu',
            error: error.message,
        });
    }
};

const generateDataInsertMany = async (req, res, next) => {
    try {
        let totalCreated = 0;

        for (let i = 0; i < TOTAL_TASKS; i += BATCH_SIZE) {
            const taskBatch = [];
            const resultBatch = [];

            for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_TASKS; j++) {
                const taskId = new mongoose.Types.ObjectId();
                const resultCount = Math.floor(Math.random() * 2) + 1; // 1-5 results
                const results = [];

                for (let k = 0; k < resultCount; k++) {
                    const resultId = new mongoose.Types.ObjectId();
                    resultBatch.push({
                        _id: resultId,
                        user_id: USER_ID,
                        task_id: taskId,
                        description: faker.lorem.paragraph(),
                        result_image: [faker.image.url(), faker.image.url()],
                        score: Math.floor(Math.random() * 101),
                        feedback: faker.lorem.sentence(),
                        outcome: [
                            'failure',
                            'partial success',
                            'pending review',
                            'success',
                        ][Math.floor(Math.random() * 4)],
                        duration: parseFloat((Math.random() * 5).toFixed(1)), // Thời gian hoàn thành ngẫu nhiên (từ 0 đến 5 giờ)
                        notes: faker.lorem.sentence(),
                        attachments: [
                            {
                                file_id: new mongoose.Types.ObjectId(),
                                file_name: faker.system.fileName(),
                                file_url: faker.internet.url(),
                            },
                        ],
                        approval_status: ['approved', 'rejected', 'pending'][
                            Math.floor(Math.random() * 3)
                        ], // Trạng thái phê duyệt ngẫu nhiên
                        tags: [faker.lorem.word(), faker.lorem.word()],
                        effort_level: ['low', 'medium', 'high'][
                            Math.floor(Math.random() * 3)
                        ], // Mức độ nỗ lực ngẫu nhiên
                        is_public: Math.random() < 0.5, // Trạng thái công khai ngẫu nhiên
                    });
                    results.push(resultId);
                }

                taskBatch.push({
                    _id: taskId,
                    user_id: USER_ID,
                    name: faker.lorem.words(3),
                    desc: faker.lorem.sentence(),
                    image: faker.image.url(),
                    deadline: faker.date.future(),
                    status: Math.random() < 0.5 ? 0 : 1,
                    create_by: USER_ID,
                    update_by: USER_ID,
                    is_delete: false,
                    delete_by: USER_ID,
                    priority: ['low', 'medium', 'high'][
                        Math.floor(Math.random() * 3)
                    ], // Độ ưu tiên ngẫu nhiên
                    estimated_time: parseFloat((Math.random() * 10).toFixed(1)), // Thời gian ước tính ngẫu nhiên (từ 0 đến 10 giờ)
                    actual_time_spent: parseFloat(
                        (Math.random() * 10).toFixed(1),
                    ), // Thời gian thực tế ngẫu nhiên (từ 0 đến 10 giờ)
                    is_completed: Math.random() < 0.5, // Trạng thái hoàn thành ngẫu nhiên
                    difficulty: ['easy', 'intermediate', 'hard'][
                        Math.floor(Math.random() * 3)
                    ], // Độ khó ngẫu nhiên
                    resources: [faker.internet.url(), faker.internet.url()], // Các tài liệu tham khảo ngẫu nhiên
                    location: ['Online', 'Office', 'Home'][
                        Math.floor(Math.random() * 3)
                    ], // Địa điểm ngẫu nhiên
                    attachments: [
                        {
                            file_id: new mongoose.Types.ObjectId(),
                            file_name: faker.system.fileName(),
                            file_url: faker.internet.url(),
                        },
                    ],
                    tags: [faker.lorem.word(), faker.lorem.word()],
                    results: results,
                });
            }

            await resultModel.insertMany(resultBatch);
            await taskModel.insertMany(taskBatch);

            totalCreated += taskBatch.length;
            console.log(`Đã tạo ${totalCreated} tasks`);
        }

        console.log('Hoàn thành tạo dữ liệu insertMany');
        return res.status(200).json({
            status: 1,
            msg: 'Hoàn thành tạo dữ liệu insertMany',
            totalCreated: totalCreated,
        });
    } catch (error) {
        console.error('Lỗi:', error);
        return res.status(500).json({
            status: 0,
            msg: 'Đã xảy ra lỗi khi tạo dữ liệu',
            error: error.message,
        });
    }
};

module.exports = {
    generateDataInsertMany,
    generateDataInsertBulk,
};
