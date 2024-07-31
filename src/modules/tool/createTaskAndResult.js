const { resultModel } = require('../result/result.model');
const { taskModel } = require('../task/task.model');
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');

const USER_ID = "6655f61a814c7f6072791ce0";
const TOTAL_TASKS = 100000;
const BATCH_SIZE = 1000;

// Xử lý batch:
// Xử lý dữ liệu theo batch giúp kiểm soát việc sử dụng bộ nhớ, cho phép xử lý lượng dữ liệu lớn hơn mà không gây quá tải hệ thống.

// Tối ưu hóa cho MongoDB:
// MongoDB được tối ưu hóa để xử lý các thao tác bulk insert hiệu quả.

// Thời gian thực thi ngắn hơn:
// Với dữ liệu lớn, thời gian thực thi sẽ ngắn hơn đáng kể so với phương pháp insert từng document.


async function generateDataInsertMany() {
    try {
        for (let i = 0; i < TOTAL_TASKS; i += BATCH_SIZE) {
            const taskBatch = [];
            const resultBatch = [];

            for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_TASKS; j++) {
                const taskId = new mongoose.Types.ObjectId();
                const resultCount = Math.floor(Math.random() * 5) + 1; // 1-5 results
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
                        outcome: ['failure', 'partial success', 'pending review', 'success'][Math.floor(Math.random() * 4)],
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
                    tags: [faker.lorem.word(), faker.lorem.word()],
                    results: results,
                });
            }

            await resultModel.insertMany(resultBatch);
            await taskModel.insertMany(taskBatch);

            console.log(`Đã tạo ${i + taskBatch.length} tasks`);
        }

        console.log('Hoàn thành tạo dữ liệu');
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.disconnect();
    }
}


async function generateDataInsertBulk() {
    try {
        for (let i = 0; i < TOTAL_TASKS; i += BATCH_SIZE) {
            const taskBulk = taskModel.collection.initializeUnorderedBulkOp();
            const resultBulk = resultModel.collection.initializeUnorderedBulkOp();

            for (let j = 0; j < BATCH_SIZE && i + j < TOTAL_TASKS; j++) {
                const taskId = new mongoose.Types.ObjectId();
                const resultCount = Math.floor(Math.random() * 5) + 1; // 1-5 results
                const results = [];

                for (let k = 0; k < resultCount; k++) {
                    const resultId = new mongoose.Types.ObjectId();
                    resultBulk.insert({
                        _id: resultId,
                        user_id: USER_ID,
                        task_id: taskId,
                        description: faker.lorem.paragraph(),
                        result_image: [faker.image.url(), faker.image.url()],
                        score: Math.floor(Math.random() * 101),
                        feedback: faker.lorem.sentence(),
                        outcome: ['failure', 'partial success', 'pending review', 'success'][Math.floor(Math.random() * 4)],
                    });
                    results.push(resultId);
                }

                taskBulk.insert({
                    _id: taskId,
                    user_id: USER_ID,
                    name: faker.lorem.words(3),
                    desc: faker.lorem.sentence(),
                    image: faker.image.url(),
                    deadline: faker.date.future(),
                    status: Math.random() < 0.5 ? 0 : 1,
                    create_by: USER_ID,
                    tags: [faker.lorem.word(), faker.lorem.word()],
                    results: results,
                });
            }

            await resultBulk.execute();
            await taskBulk.execute();

            console.log(`Đã tạo ${i + BATCH_SIZE} tasks`);
        }

        console.log('Hoàn thành tạo dữ liệu');
    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        mongoose.disconnect();
    }
}

module.exports = {
    generateDataInsertMany,
    generateDataInsertBulk,
}