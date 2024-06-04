// models/userModel.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // 他のユーザー関連のフィールド
});

const User = mongoose.model('User', userSchema);

module.exports = User;
