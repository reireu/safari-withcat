// 認証関連のモデル
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // 1時間でトークンを無効にする
    }
});

const AuthToken = mongoose.model('AuthToken', authSchema);
module.exports = AuthToken;
