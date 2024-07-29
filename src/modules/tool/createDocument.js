const mongoose = require("mongoose");
const { resultModel } = require("../result/result.model"); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án
const { taskModel } = require("../task/task.model"); // Điều chỉnh đường dẫn tùy theo cấu trúc dự án

/**
 * Hàm tạo bản ghi mẫu cho `resultModel`.
 * @param {number} count - Số lượng bản ghi cần tạo.
 * @returns {Promise<void>} - Một Promise khi việc chèn bản ghi hoàn tất.
 */
async function createResultRecords(count) {
  try {
    // Lấy tất cả các task_id
    const tasks = await taskModel.find({}, "_id").exec();
    const taskCount = tasks.length;

    if (taskCount === 0) {
      console.log(
        "No tasks found. Please create tasks before creating results."
      );
      return;
    }

    let records = [];
    for (let i = 0; i < count; i++) {
      const randomTask = tasks[Math.floor(Math.random() * taskCount)];
      const newResult = {
        user_id: ["6655f61a814c7f6072791ce0", "6655f61a814c7f6072791ce0"][
          Math.floor(Math.random() * 2)
        ], // Thay thế bằng ObjectId của user thật nếu cần
        task_id: randomTask._id,
        description: `Description for result ${i}`,
        score: Math.floor(Math.random() * 101), // Random score từ 0 đến 100
        outcome: ["failure", "partial success", "pending review", "success"][
          Math.floor(Math.random() * 4)
        ],
        is_delete: false,
      };
      records.push(newResult);

      // Thêm result vào trường results của task
      const createdResult = await resultModel.create(newResult);
      await taskModel
        .updateOne(
          { _id: randomTask._id },
          { $push: { results: createdResult._id } }
        )
        .exec();

      console.log(`Result ${i} added to task ${randomTask._id}`);
    }
    console.log(`${count} result records inserted!`);
  } catch (err) {
    console.error("Error creating result records:", err);
  }
}
/**
 * Hàm tạo bản ghi mẫu cho `taskModel`.
 * @param {number} count - Số lượng bản ghi cần tạo.
 * @returns {Promise<void>} - Một Promise khi việc chèn bản ghi hoàn tất.
 */
async function createTaskRecords(count) {
  let records = [];
  for (let i = 0; i < count; i++) {
    records.push({
      user_id: ["66a70b2c4785031e6235d51c"], // Thay thế bằng ObjectId của user thật nếu cần
      name: `Task ${i}`,
      desc: `Description for task ${i}`,
      deadline: new Date(),
      status: Math.floor(Math.random() * 2), // Random status 0 hoặc 1
      create_by: "66a70b2c4785031e6235d51c", // Thay thế bằng ObjectId của user thật nếu cần
      is_delete: false,
      results: [], // Thêm trường results để chứa các result
    });
    console.log(`Task ${i} created`);
  }
  await taskModel.insertMany(records);
  console.log(`${count} task records inserted!`);
}

/**
 * Hàm chính để thêm bản ghi vào cơ sở dữ liệu.
 * Gọi các hàm `createResultRecords` và `createTaskRecords`.
 * @returns {Promise<void>} - Một Promise khi quá trình thêm bản ghi hoàn tất.
 */
async function run() {
  try {
    const count = 100000; // Số bản ghi cho mỗi mô hình
    const [createResultRecord] = await Promise.all([
      // createTaskRecords(count),
      createResultRecords(count),
    ]);
  } catch (err) {
    console.error("Error running the script:", err);
  }
}

module.exports = {
  run,
};
