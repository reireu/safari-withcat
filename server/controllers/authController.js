// 認証関連のコントローラー
const User = require('../models/userModel');
const AuthToken = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const authService = require('../services/authService');

exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // ユーザーが既に存在するかどうかを確認
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // パスワードをハッシュ化
        const hashedPassword = await authService.hashPassword(password);

        // 新しいユーザーを作成
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // ユーザーが存在するかどうかを確認
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // パスワードが一致するかどうかを確認
        const isMatch = await authService.comparePassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // トークンを生成
        const token = authService.generateToken(user);

        // トークンを保存
        const authToken = new AuthToken({ userId: user._id, token });
        await authToken.save();

        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.logout = async (req, res) => {
    try {
        // クライアントからトークンを取得
        const token = req.header('Authorization').replace('Bearer ', '');

        // トークンをデータベースから削除
        await AuthToken.findOneAndDelete({ token });

        res.json({ message: 'User logged out' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // ユーザーが存在するかどうかを確認
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User with this email does not exist' });
        }

        // リセットトークンを生成
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1時間有効
        await user.save();

        // メールを送信
        await authService.sendResetPasswordEmail(user, token);

        res.json({ message: 'Password reset email sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.resetPasswordConfirm = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        // トークンが有効かどうかを確認
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        // 新しいパスワードをハッシュ化
        user.password = await authService.hashPassword(newPassword);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
