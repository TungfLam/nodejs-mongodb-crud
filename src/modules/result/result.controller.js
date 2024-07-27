const resultService = require("./result.service");

// Hàm lấy danh sách kết quả khi được submit của mỗi task
const getResultsUserTasks = async (req, res) => {
  try {
    const task_id = req.params.id;
    const { limit, page, sort, filter } = req.query;
    // Kiểm tra id task tồn tại hay không
    if (!task_id) {
      throw new Error("Không tìm thấy id của user!");
    }
    // Biến nhận kết quả trả về từ resultService
    const response = await resultService.getResultsUserTasks(
      task_id,
      Number(limit) || 8,
      Number(page) || 0,
      sort,
      filter
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e,
    });
  }
};

// Hàm tạo mới 1 bản ghi khi submit result
const createResultsUserTask = (req, res) => {
  try {
    const task_id = req.params.id;
    const { user_id, description, score, outcome } = req.body;
    const outcome_exam = [
      "failure",
      "partial success",
      "pending review",
      "success",
    ];
    // Kiểm tra các trường nhận từ req.body có tồn tại giá trị không
    switch (false) {
      case user_id:
        throw new Error({ status: "ERR", message: "Không có user id" });
      case task_id:
        throw new Error({ status: "ERR", message: "Không có task id" });
      case description:
        throw new Error({ status: "ERR", message: "Không có description" });
      case score:
        throw new Error({ status: "ERR", message: "Không có score" });
      case outcome:
        throw new Error({ status: "ERR", message: "Không có outcome" });
      default:
        break;
    }
    // Kiểm tra trường điểm có phải dạng number không
    if (typeof score !== "number") {
      return res.status(400).json({
        status: "ERR",
        message: "score phải là số",
      });
    }
    // Kiểm tra outcome có thuộc phần tử trong mẫu cho trước không
    if (!outcome_exam.includes(outcome)) {
      return res.status(400).json({
        status: "ERR",
        message: "outcome phải là không thỏa mãn",
      });
    }
    const response = resultService.createResultsUserTask(req.body, task_id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e,
    });
  }
};

const updateResultsUserTask = async (req, res) => {
  try {
    const result_id = req.params.id;
    const data = Object.assign({}, req.body);
    const file = req.file;
    // Kiểm tra các trường nhận từ req.body có tồn tại giá trị không
    switch (false) {
      case data.user_id:
        throw new Error({ status: "ERR", message: "Không có user id" });
      case result_id:
        throw new Error({ status: "ERR", message: "Không có task id" });
      case data.description:
        throw new Error({ status: "ERR", message: "Không có description" });
      case data.score:
        throw new Error({ status: "ERR", message: "Không có score" });
      case data.outcome:
        throw new Error({ status: "ERR", message: "Không có outcome" });
      default:
        break;
    }
    const upload = await resultService.uploadImage(file);
    data.result_image = upload.url;
    const response = await resultService.updateResultsUserTask(result_id, data);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e,
    });
  }
};

const deleteResultsUserTask = (req, res) => {
  try {
    const result_id = req.params.id;
    // Kiểm tra result_id có tồn tại không
    if (!result_id) {
      return res.status(400).json({
        status: "ERR",
        message: "Không tìm thấy result_id",
      });
    }
    const response = resultService.deleteResultsUserTask(result_id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e,
    });
  }
};

module.exports = {
  getResultsUserTasks,
  createResultsUserTask,
  updateResultsUserTask,
  deleteResultsUserTask,
};
