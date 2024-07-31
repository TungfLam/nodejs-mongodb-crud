const Result = require('./result.model');
const Task = require('../task/task.model');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const cloudinary = require('cloudinary').v2;

// Cấu hình cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
        throw new Error('Không nhận được id Task!');
      }
      // Lấy tổng số bản ghi trong bảng Result
      const total_task = await Result.resultModel.countDocuments({
        task_id: id,
        is_delete: false,
      });
      const response = {
        status: 'OK',
        message: 'SUCCESS',
        data: {},
        paginationInfo: {
          total: total_task,
          page_current: page + 1,
          total_page: Math.ceil(total_task / limit),
          hasNextPage: page + 1 < Math.ceil(total_task / limit),
          hasPrevPage: page + 1 > 1,
        },
      };
      // Kiểm tra có filter được truyền vào không
      if (filter) {
        const lable = filter[0];
        // Bỏ qua số lượng task đã được lọc và bắt đầu tìm từ user thứ page * limit
        // Tìm kiếm theo trường filter[0] với giá trị filter[1]
        const get_result_filter = await Result.resultModel
          .find({
            task_id: id,
            is_delete: false,
            [lable]: { $regex: filter[1] },
          })
          .limit(limit)
          .skip(page * limit);
        response.data = get_result_filter;
        resolve(response);
      }
      // Kiểm tra có sort được truyền vào không
      if (sort) {
        const object_sort = {};
        object_sort[sort[1]] = Number(sort[0]);
        //sort sắp xếp theo trường sort[1] theo thứ tự sort[0](1,-1)
        //lọc số user được tìm từ đầu(limit), bỏ qua số lượng user đã được lọc và bắt đầu tìm từ user thứ page * limit
        const get_result_sort = await Result.resultModel
          .find({
            task_id: id,
            is_delete: false,
          })
          .limit(limit)
          .skip(page * limit)
          .sort(object_sort);
        response.data = get_result_sort;
        resolve(response);
      }
      // Biến lấy danh sách result trong db nếu không có filter và sort
      const get_result = await Result.resultModel.find({
        task_id: id,
        is_delete: false,
      });
      // .limit(limit)
      // .skip(page * limit);
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
 * @param {string} task_id - Id của task cần thêm mới kết quả.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const createResultsUserTask = async (data, task_id) => {
  try {
    // Kiểm tra data từ req.query có tồn tại không
    if (!data) {
      throw new Error({ message: 'không nhận được data' });
    }
    // Kiểm tra có tồn tại task id không
    if (!task_id) {
      throw new Error({ message: 'không nhận được task id' });
    }
    const { user_id, description, score, outcome, ...body } = data;
    // Tạo mới bản ghi từ các trường nhận được
    const result_task = await Result.resultModel.create({
      user_id,
      task_id,
      description,
      score,
      outcome,
      ...body,
    });
    if (!result_task) {
      throw new Error({ message: 'không thêm được result mới!' });
    }
    await Task.taskModel.findByIdAndUpdate(task_id, {
      $push: { results: result_task },
      updated_at: new Date(),
    });
    return { status: 'OK', message: 'SUCCESS', data: result_task };
  } catch (e) {
    throw e;
  }
};

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} id - Id của result cần lấy danh sách kết quả.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const getDetailResultsUserTask = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Result.resultModel.findOne({
        _id: id,
      });
      if (result === null) {
        resolve({
          status: '404',
          message: 'ko tìm thấy kết quả',
        });
      }
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: result,
      });
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} result_id - Id của result cần sửa thông tin.
 * @param {string} data - data được nhận từ req.body.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const updateResultsUserTask = async (result_id, data) => {
  try {
    // Kiểm tra data từ req.query có tồn tại không
    if (!data) {
      throw new Error({ message: 'không nhận được data' });
    }
    // Kiểm tra có tồn tại task id không
    if (!result_id) {
      throw new Error({ message: 'không nhận được result_id id' });
    }
    const update_result = await Result.resultModel.findByIdAndUpdate(
      result_id,
      data,
      {
        new: true,
      },
    );
    if (!update_result) {
      throw new Error({ message: 'không sửa được result!' });
    }
    return { status: 'OK', message: 'SUCCESS', data: update_result };
  } catch (e) {
    throw e;
  }
};

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} result_id - Id của result cần xóa file cũ.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const deleteFile = async (result_id) => {
  try {
    // Kiểm tra có tồn tại task id không
    if (!result_id) {
      throw new Error({ message: 'không nhận được result_id id' });
    }
    const re = await Result.resultModel.findById({ _id: result_id });
    re.result_image.map((image) => {
      const fileToDelete = path.join(__dirname, `../../../${image}`);
      fs.unlink(fileToDelete, (err) => {
        if (err) {
          console.error('Không thể xóa file:', err);
          return;
        }
        console.log('File đã được xóa thành công.');
      });
    });
  } catch (e) {
    throw e;
  }
};

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} file - ảnh được tải lên.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const uploadImage = (file) => {
  return new Promise(async (resolve, reject) => {
    try {
      //Kiểm tra file được tải lên
      if (!file) {
        return resolve({
          status: '404',
          message: 'no image file provided',
        });
      }
      //tích hợp tải file lên cloudinary
      cloudinary.uploader
        .upload_stream({ folder: 'uploads' }, (error, result) => {
          if (error) {
            return reject(error);
          }
          return resolve({
            public_id: result.public_id,
            url: result.secure_url,
          });
        })
        .end(buffer);
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * Lấy danh sách kết quả khi được submit của mỗi user
 * @param {string} id - Id của result cần xóa.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const deleteResultsUserTask = async (id) => {
  try {
    // Kiểm tra data từ req.query có tồn tại không
    if (!id) {
      throw new Error({ message: 'không nhận được id result' });
    }
    // Tìm bản ghi có id tương ứng và sửa is_delete thành true
    await Result.resultModel.findByIdAndUpdate(
      id,
      { is_delete: true },
      { new: true },
    );
    return { status: '200', message: 'delete success!!' };
  } catch (e) {
    throw e;
  }
};

module.exports = {
  getResultsUserTasks,
  createResultsUserTask,
  updateResultsUserTask,
  deleteResultsUserTask,
  uploadImage,
  getDetailResultsUserTask,
  deleteFile,
};
