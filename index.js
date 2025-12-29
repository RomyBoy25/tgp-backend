require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/user.model.js');
const cors = require('cors');
const userRoute = require('./routes/user.route.js');
const chapterRoute = require('./routes/chapter.route.js');
const councilRoute = require('./routes/council.route.js');
const authRoutes = require('./routes/auth.route.js');
const fundsRoute = require('./routes/funds.route.js')
const paymentRoute = require('./routes/payment.route.js')
const costRoute = require('./routes/cost.route.js')
const summaryRoute = require('./routes/summary.route.js')
const authMiddleware = require('./middleware/auth.js');
const path = require('path');

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended:false}));


// Routes
app.use("/api/users", authMiddleware, userRoute);
app.use("/api/chapters",authMiddleware, chapterRoute);
app.use("/api/council", authMiddleware, councilRoute);
app.use("/api/funds", authMiddleware, fundsRoute);
app.use("/api/payments", authMiddleware, paymentRoute);
app.use("/api/costs", authMiddleware, costRoute);
app.use("/api/summary", authMiddleware, summaryRoute);
app.use("/api/auth", authRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Connection failed:", error.message);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});