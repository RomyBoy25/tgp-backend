require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./model/user.model.js');
const cors = require('cors');
const userRoute = require('./routes/user.route.js');
const chapterRoute = require('./routes/chapter.route.js');
const councilRoute = require('./routes/council.route.js');
const authRoutes = require('./routes/auth.route.js');
const eventRoute = require('./routes/event.route.js')
const batchRoute = require('./routes/batch.route.js')
const fundRoute = require('./routes/fund.route.js')
const pledgeRoute = require('./routes/pledge.route.js');
const publicRoute = require('./routes/public.route.js');
const authMiddleware = require('./middleware/auth.js');
const path = require('path');

const app = express();
app.use(cors());

app.use(express.json({ limit: "5mb" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: "50mb",
  })
);
app.use("/api/public", publicRoute);
// Routes
app.use("/api/users", authMiddleware, userRoute);
app.use("/api/chapters",authMiddleware, chapterRoute);
app.use("/api/council", authMiddleware, councilRoute);
app.use("/api/events", authMiddleware, eventRoute);
app.use("/api/batches", authMiddleware, batchRoute);
app.use("/api/funds", authMiddleware, fundRoute );
app.use("/api/pledges", authMiddleware, pledgeRoute );
app.use("/api/auth", authRoutes);


app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Connection failed:", error.message);
  });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});