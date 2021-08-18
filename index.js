const path = require('path');
require('./db/mongoose');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routers/user-router');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
