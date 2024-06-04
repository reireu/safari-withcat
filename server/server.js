// server.js
const express = require('express');
const app = express();
const port = 3000;

// サンプルルート
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// サーバーの起動
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
