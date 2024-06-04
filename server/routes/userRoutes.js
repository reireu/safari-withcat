// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ユーザー作成
router.post('/register', userController.register);

// ユーザーログイン
router.post('/login', userController.login);

// 他のユーザー関連のルート
// 例: router.get('/:id', userController.getUserById);

module.exports = router;
