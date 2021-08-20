require('./db/mongoose');
const express = require('express');
const cors = require('cors');
const userRouter = require('./routers/user-router');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(userRouter);

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
