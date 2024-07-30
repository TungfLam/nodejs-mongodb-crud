const task = require('./task.model');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const countTasks = async (searchCondition) => {
  return await task.taskModel.countDocuments(searchCondition);
};

const findTasks = async (searchCondition, skip, limit) => {
  return await task.taskModel
    .find(searchCondition)
    .populate('results')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
};
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const findTaskById = async (taskId) => {
  return await task.taskModel.findById(taskId).populate('results');
};

const deleteTaskById = async (taskId, deleteBy) => {
  return await task.taskModel.findByIdAndUpdate(
    taskId,
    { delete_by: deleteBy, is_delete: true },
    { new: true },
  );
};

const updateTaskById = async (taskId, updateFields) => {
  return await task.taskModel.findByIdAndUpdate(taskId, updateFields, {
    new: true,
  });
};
const addNewTask = async (taskData) => {
  const newTask = new task.taskModel(taskData);
  return await newTask.save();
};

const findTasksByUserId = async (userId, skip, limit) => {
  return await task.taskModel
    .find({ user_id: userId, is_delete: false })
    .populate('results')
    .skip(skip)
    .limit(limit);
};

const countTasksByUserId = async (userId) => {
  return await task.taskModel.countDocuments({
    user_id: userId,
    is_delete: false,
  });
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png'],
  },
});

const upload = multer({ storage: storage });

module.exports = {
  countTasks,
  findTasks,
  isValidObjectId,
  findTaskById,
  deleteTaskById,
  updateTaskById,
  addNewTask,
  findTasksByUserId,
  countTasksByUserId,
  upload,
};
