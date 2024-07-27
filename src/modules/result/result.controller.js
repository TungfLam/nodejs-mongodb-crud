const resultService = require("./result.service");

// Hàm lấy danh sách kết quả khi được submit của mỗi task
const getResultsUserTasks = async (req, res) => {
  try {
    const task_id = req.params.id;
    const { limit, page, sort, filter } = req.query;
    // Kiểm tra id task tồn tại hay không
    if (!userId) {
      throw new Error("Không tìm thấy id của user!");
    }
    // Biến nhận kết quả trả về từ resultService
    const response = await resultService.getResultsUserTasks(task_id);
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
    if (typeof score !== "number") {
      return res.status(400).json({
        status: "ERR",
        message: "score phải là số",
      });
    }
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

module.exports = {
  getResultsUserTasks,
  createResultsUserTask,
};
