const user = require('./user.model');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const findUserById = async (userId) => {
  return await user.userModel.findById(userId);
};

const updatePassword = async (user, newPassword) => {
  user.password = newPassword;
  return await user.save();
};

const comparePassword = async (inputPassword, storedPassword) => {
  return await bcrypt.compare(inputPassword, storedPassword);
};

const updateUserById = async (userId, updateFields) => {
  return await user.userModel.findByIdAndUpdate(userId, updateFields, {
    new: true,
  });
};

const findUserByEmail = async (email) => {
  return await user.userModel.findOne({ email });
};

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const createUser = async (userData) => {
  const newUser = new user.userModel(userData);
  await newUser.save();
  return newUser.toObject();
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

module.exports = {
  findUserByEmail,
  comparePassword,
  findUserById,
  hashPassword,
  updatePassword,
  updateUserById,
  createUser,
  isValidObjectId,
};
