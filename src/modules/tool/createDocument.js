const mongoose = require('mongoose');
const { resultModel } = require('../result/result.model'); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án
const { taskModel } = require('../task/task.modell'); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án

// Hàm tạo bản ghi mẫu cho `resultModel`
async function createResultRecords(count) {
  let records = [];
  for (let i = 0; i < count; i++) {
    records.push({
      user_id: new mongoose.Types.ObjectId(), // Thay thế bằng ObjectId của user thật nếu cần
      task_id: new mongoose.Types.ObjectId(), // Thay thế bằng ObjectId của task thật nếu cần
      description: `Description for result ${i}`,
      score: Math.floor(Math.random() * 101), // Random score từ 0 đến 100
      outcome: ['failure', 'partial success', 'pending review', 'success'][
        Math.floor(Math.random() * 4)
      ],
      is_delete: false,
    });
  }
  await resultModel.insertMany(records);
  console.log(`${count} result records inserted!`);
}

// Hàm tạo bản ghi mẫu cho `taskModel`
async function createTaskRecords(count) {
  let records = [];
  for (let i = 0; i < count; i++) {
    records.push({
      user_id: new mongoose.Types.ObjectId(), // Thay thế bằng ObjectId của user thật nếu cần
      name: `Task ${i}`,
      desc: `Description for task ${i}`,
      deadline: new Date(),
      status: Math.floor(Math.random() * 2), // Random status 0 hoặc 1
      create_by: new mongoose.Types.ObjectId(), // Thay thế bằng ObjectId của user thật nếu cần
      is_delete: false,
    });
  }
  await taskModel.insertMany(records);
  console.log(`${count} task records inserted!`);
}

// Sử dụng các hàm trên để thêm bản ghi
async function run() {
  try {
    const count = 500000; // Số bản ghi cho mỗi mô hình
    await createResultRecords(count);
    await createTaskRecords(count);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

module.exports = {
  run,
};
