const Result = require("./result.model");

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} id - Id của task cần lấy danh sách kết quả.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const getResultsUserTasks = (id, limit, page, sort, filter) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Kiểm tra id user có tồn tại không
      if (!id) {
        throw new Error("Không nhận được id Task!");
      }
      // Lấy tổng số bản ghi trong bảng Result
      const total_task = await Result.resultModel.countDocuments({
        task_id: id,
      });
      const response = {
        status: "OK",
        message: "SUCCESS",
        data: {},
        total: total_task,
        pageCurrent: page + 1,
        totalPage: Math.ceil(total_task / limit),
      };
      // Kiểm tra có filter được truyền vào không
      if (filter) {
        console.log("check");
        const lable = filter[0];
        // Bỏ qua số lượng task đã được lọc và bắt đầu tìm từ user thứ page * limit
        // Tìm kiếm theo trường filter[0] với giá trị filter[1]
        const get_result_filter = await Result.resultModel.find({
          task_id: id,
          is_delete: false,
          [lable]: { $regex: filter[1] },
        });
        //   .limit(limit)
        //   .skip(page * limit);
        response.data = get_result_filter;
        resolve(response);
      }
      // Kiểm tra có filter được truyền vào không
      if (sort) {
        console.log("check");

        const object_sort = {};
        object_sort[sort[1]] = sort[0];
        //sort sắp xếp theo trường sort[1] theo thứ tự sort[0]
        //lọc số user được tìm từ đầu(limit), bỏ qua số lượng user đã được lọc và bắt đầu tìm từ user thứ page * limit
        const get_result_sort = await Result.resultModel.find({
          task_id: id,
          is_delete: false,
        });
        //   .limit(limit)
        //   .skip(page * limit)
        //   .sort(object_sort);
        response.data = get_result_sort;
        resolve(response);
      }
      console.log("check");

      // Biến lấy danh sách result trong db nếu không có filter và sort
      const get_result = await Result.resultModel.find({
        task_id: id,
        is_delete: false,
      });
      // .limit(limit)
      // .skip(page * limit);
      console.log(get_result);
      response.data = get_result;
      resolve(response);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} data - data được nhận từ req.body.
 * @param {string} task_id - Id của task cần lấy danh sách kết quả.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const createResultsUserTask = async (data, task_id) => {
  try {
    if (!data) {
      throw new Error({ message: "không nhận được data" });
    }
    const { user_id, description, score, outcome } = data;
    const result_task = await Result.resultModel.create({
      user_id,
      task_id,
      description,
      score,
      outcome,
    });
    if (!result_task) {
      throw new Error({ message: "không thêm được result mới!" });
    }
    return result_task;
  } catch (e) {
    throw e;
  }
};

module.exports = {
  getResultsUserTasks,
  createResultsUserTask,
};
