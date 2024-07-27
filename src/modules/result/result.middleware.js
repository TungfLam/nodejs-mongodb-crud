const moment = require("moment");

// Định nghĩa plugin định dạng timestamps
const timestampPlugin = (schema) => {
  // Thêm tùy chỉnh toJSON
  schema.set("toJSON", {
    transform: (doc, ret) => {
      if (ret.createdAt) {
        ret.createdAt = moment(ret.createdAt).format("YYYY-MM-DD HH:mm:ss");
      }
      if (ret.updatedAt) {
        ret.updatedAt = moment(ret.updatedAt).format("YYYY-MM-DD HH:mm:ss");
      }
      if (ret.birthDate) {
        ret.birthDate = moment(ret.birthDate).format("YYYY-MM-DD");
      }
      return ret;
    },
  });

  // Middleware để cập nhật updatedAt trước khi lưu
  schema.pre("save", function (next) {
    if (this.isNew) {
      this.createdAt = moment().format("YYYY-MM-DD HH:mm:ss");
    }
    this.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    next();
  });
  //khi update giữ nguyên giá trị createAt
  const updateMiddleware = function (next) {
    if (this._update.createdAt) {
      delete this._update.createdAt;
    }
    this._update.updatedAt = moment().format("YYYY-MM-DD HH:mm:ss");
    next();
  };

  schema.pre("findOneAndUpdate", updateMiddleware);
  schema.pre("updateOne", updateMiddleware);
  schema.pre("updateMany", updateMiddleware);
  schema.pre("update", updateMiddleware);
};

const blockCreateBy = (resultSchema) => {
  function preventUpdateCreatedBy(next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.createdBy) {
      delete update.$set.createdBy;
    } else if (update.createdBy) {
      delete update.createdBy;
    }
    next();
  }

  resultSchema.pre("updateOne", preventUpdateCreatedBy);
  resultSchema.pre("updateMany", preventUpdateCreatedBy);
  resultSchema.pre("findOneAndUpdate", preventUpdateCreatedBy);
  resultSchema.pre("findByIdAndUpdate", preventUpdateCreatedBy);
};

module.exports = {
  timestampPlugin,
  blockCreateBy,
};
