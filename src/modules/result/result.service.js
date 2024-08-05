const Result = require('./result.model');
const Task = require('../task/task.model');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
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
 * @param {number} limit - Số lượng bản ghi trên mỗi trang.
 * @param {number} page - Số trang hiện tại.
 * @param {Object} query - Các điều kiện lọc và sắp xếp.
 * @returns {Object} - Dữ liệu phản hồi chứa danh sách các thuộc tính.
 * @throws {Error} - Ném ra lỗi nếu gọi API thất bại.
 */
const getResultsUserTasks = async (id, limit, page, query) => {
    if (!id) throw new Error('Không nhận được id Task!');

    // Tạo điều kiện query cơ bản
    const filterQuery = buildFilterQuery(id, query);
    const sortQuery = buildSortQuery(query);

    // Thực hiện các truy vấn
    const [total_task, get_result] = await Promise.all([
        Result.resultModel.countDocuments(filterQuery),
        Result.resultModel
            .find(filterQuery)
            .limit(limit)
            .skip((page - 1) * limit)
            .sort(sortQuery)
            .select('-__v'),
    ]);

    // Tạo phản hồi phân trang
    const response = buildPaginationResponse(total_task, page, limit);
    response.data = get_result;
    return response;
};

/**
 * Tạo điều kiện lọc dựa trên các bộ lọc được truyền vào
 * @param {string} id - Id của task cần lấy danh sách kết quả.
 * @param {Object} query - Các điều kiện lọc và sắp xếp.
 * @returns {Object} - Đối tượng điều kiện lọc.
 */
const buildFilterQuery = (id, query) => {
    const filterQuery = { task_id: id, is_delete: false };

    Object.keys(query).forEach((key) => {
        const value = query[key];

        switch (key) {
            case 'date':
                filterQuery.created_at = createDateFilter(value, 'day');
                break;
            case 'month':
                filterQuery.created_at = createDateFilter(value, 'month');
                break;
            case 'year':
                filterQuery.created_at = createDateFilter(value, 'year');
                break;
            case 'date_range':
                const a = [1, 2, 4, 'ád'];
                console.log(value);
                console.log(a);
                if (Array.isArray(value) && value.length === 2) {
                    filterQuery.created_at = {
                        $gte: moment(value[0], 'YYYY-MM-DD')
                            .startOf('day')
                            .toDate(),
                        $lt: moment(value[1], 'YYYY-MM-DD')
                            .endOf('day')
                            .toDate(),
                    };
                }
                break;
            default:
                if (key.startsWith('sort_')) {
                    break;
                }
                filterQuery[key] = { $regex: value, $options: 'i' };
                break;
        }
    });

    return filterQuery;
};

/**
 * Tạo điều kiện sắp xếp dựa trên các bộ lọc được truyền vào
 * @param {Object} query - Các điều kiện lọc và sắp xếp.
 * @returns {Object} - Đối tượng điều kiện sắp xếp.
 */
const buildSortQuery = (query) => {
    const sortQuery = {};

    Object.keys(query).forEach((key) => {
        if (key.startsWith('sort_')) {
            const sortField = key.slice(5);
            sortQuery[sortField] = Number(query[key]) || 1;
        } else {
            const sortField = 'created_at';
            sortQuery[sortField] = Number(query[key]) || 1;
        }
    });

    return sortQuery;
};

/**
 * Tạo bộ lọc ngày
 * @param {string} value - Giá trị ngày.
 * @param {string} unit - Đơn vị thời gian ('day', 'month', 'year').
 * @returns {Object} - Đối tượng bộ lọc ngày.
 */
const createDateFilter = (value, unit) => ({
    $gte: moment(
        value,
        `YYYY${unit === 'day' ? '-MM-DD' : unit === 'month' ? '-MM' : ''}`,
    )
        .startOf(unit)
        .toDate(),
    $lt: moment(
        value,
        `YYYY${unit === 'day' ? '-MM-DD' : unit === 'month' ? '-MM' : ''}`,
    )
        .endOf(unit)
        .toDate(),
});

/**
 * Tạo phản hồi phân trang dựa trên tổng số bản ghi, trang hiện tại và số lượng bản ghi mỗi trang
 * @param {number} total_task - Tổng số bản ghi.
 * @param {number} page - Số trang hiện tại.
 * @param {number} limit - Số lượng bản ghi trên mỗi trang.
 * @returns {Object} - Đối tượng phản hồi phân trang.
 */
const buildPaginationResponse = (total_task, page, limit) => ({
    status: 'OK',
    message: 'SUCCESS',
    data: {},
    paginationInfo: {
        total: total_task,
        page_current: page,
        total_page: Math.ceil(total_task / limit),
        has_next_page: page < Math.ceil(total_task / limit),
        has_prev_page: page > 1,
    },
});

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
