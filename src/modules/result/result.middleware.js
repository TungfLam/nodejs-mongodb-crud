const moment = require('moment');

// Định nghĩa plugin định dạng timestamps
const timestampPlugin = (schema) => {
    // Thêm tùy chỉnh toJSON
    schema.set('toJSON', {
        transform: (doc, ret) => {
            if (ret.created_at) {
                ret.created_at = moment(ret.created_at).format(
                    'YYYY-MM-DD HH:mm:ss',
                );
            }
            if (ret.updated_at) {
                ret.updated_at = moment(ret.updated_at).format(
                    'YYYY-MM-DD HH:mm:ss',
                );
            }
            return ret;
        },
    });

    // Middleware để cập nhật updated_at trước khi lưu
    schema.pre('save', function (next) {
        if (this.isNew) {
            this.created_at = moment().format('YYYY-MM-DD HH:mm:ss');
        }
        this.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        next();
    });
    //khi update giữ nguyên giá trị createAt
    const updateMiddleware = function (next) {
        if (this._update.created_at) {
            delete this._update.created_at;
        }
        this._update.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
        next();
    };

    schema.pre('findOneAndUpdate', updateMiddleware);
    schema.pre('updateOne', updateMiddleware);
    schema.pre('updateMany', updateMiddleware);
    schema.pre('update', updateMiddleware);
};

const blockCreateBy = (resultSchema) => {
    function preventUpdateCreatedBy(next) {
        const update = this.getUpdate();
        if (update.$set && update.$set.created_by) {
            delete update.$set.created_by;
        } else if (update.created_by) {
            delete update.created_by;
        }
        next();
    }

    resultSchema.pre('updateOne', preventUpdateCreatedBy);
    resultSchema.pre('updateMany', preventUpdateCreatedBy);
    resultSchema.pre('findOneAndUpdate', preventUpdateCreatedBy);
    resultSchema.pre('findByIdAndUpdate', preventUpdateCreatedBy);
};

module.exports = {
    timestampPlugin,
    blockCreateBy,
};
