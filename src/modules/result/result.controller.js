const resultService = require('./result.service');

// Hàm lấy danh sách kết quả khi được submit của mỗi task
const getResultsUserTasks = async (req, res) => {
  try {
    const task_id = req.params.task_id;
    const { limit, page, sort, filter } = req.query;
    // Kiểm tra id task tồn tại hay không
    if (!task_id) {
      throw new Error('Không tìm thấy id của task!');
    }
    // Biến nhận kết quả trả về từ resultService
    const response = await resultService.getResultsUserTasks(
      task_id,
      Number(limit) || 8,
      Number(page) || 0,
      sort,
      filter,
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e,
    });
  }
};

// Hàm tạo mới 1 bản ghi khi submit result
const createResultsUserTask = async (req, res) => {
  try {
    const task_id = req.params.task_id;
    const { user_id, description, score, outcome, ...data } = req.body;
    const outcome_exam = [
      'failure',
      'partial success',
      'pending review',
      'success',
    ];
    console.log('req.body', task_id);
    const file = req.file;
    // Kiểm tra user_id có giá trị ko
    if (!user_id) {
      return res.status(400).json({
        status: 'ERR',
        message: 'không tìm thấy user_id',
      });
    }
    // Kiểm tra description có giá trị ko
    if (!description) {
      return res.status(400).json({
        status: 'ERR',
        message: 'không tìm thấy description',
      });
    }
    // Kiểm tra trường điểm có phải dạng number không
    if (typeof Number(score) !== 'number') {
      return res.status(400).json({
        status: 'ERR',
        message: 'score phải là số',
      });
    }
    // Kiểm tra outcome có thuộc phần tử trong mẫu cho trước không
    if (!outcome_exam.includes(outcome)) {
      return res.status(400).json({
        status: 'ERR',
        message: 'outcome phải là 1 trong những dữ liệu có sẵn',
      });
    }
    if (file) {
      const upload = await resultService.uploadImage(file);
      if (upload) {
        data.result_image = upload.url;
      }
    }
    const response = await resultService.createResultsUserTask(
      req.body,
      task_id,
    );
    return res.status(200).json(response);
  } catch (e) {
    return res.status(400).json({
      message: e,
    });
  }
};

// Hàm lấy chi tiết dữ liệu của 1 result
const getDetailResultsUserTask = async (req, res) => {
  try {
    const result_id = req.params.result_id;
    if (!result_id) {
      return res.status(400).json({
        status: 'ERR',
        message: 'không tìm thấy result_id',
      });
    }
    const response = await resultService.getDetailResultsUserTask(result_id);
    return res.status(200).json(response);
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const updateResultsUserTask = async (req, res) => {
  try {
    const result_id = req.params.result_id;
    const data = req.body;
    const file = req.files;
    const outcome_exam = [
      'failure',
      'partial success',
      'pending review',
      'success',
    ];
    if (!data.user_id) {
      return res.status(400).json({
        status: 'ERR',
        message: 'không tìm thấy user_id',
      });
    }
    // Kiểm tra description có giá trị ko
    if (!data.description) {
      return res.status(400).json({
        status: 'ERR',
        message: 'không tìm thấy description',
      });
    }
    // Kiểm tra trường điểm có phải dạng number không
    if (typeof Number(data.score) !== 'number') {
      return res.status(400).json({
        status: 'ERR',
        message: 'score phải là số',
      });
    }
    // Kiểm tra outcome có thuộc phần tử trong mẫu cho trước không
    if (!outcome_exam.includes(data.outcome)) {
      return res.status(400).json({
        status: 'ERR',
        message: 'outcome phải là 1 trong những dữ liệu có sẵn',
      });
    }
    const upload = await resultService.uploadImage(file);
    if (upload) {
      data.result_image = upload.url;
    }
    const response = await resultService.updateResultsUserTask(
      result_id,
      req.body,
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
  }
};

const deleteResultsUserTask = async (req, res) => {
  try {
    const result_id = req.params.result_id;
    // Kiểm tra result_id có tồn tại không
    if (!result_id) {
      return res.status(400).json({
        status: 'ERR',
        message: 'Không tìm thấy result_id',
      });
    }
    const response = await resultService.deleteResultsUserTask(result_id);
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
  getDetailResultsUserTask,
};
