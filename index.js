const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

// mongoose setup
const mongoUrl = process.env.MONGO_URL;
mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
});

const db = mongoose.connection;

db.on("error", (error) => {
  console.log(error);
});

db.once("open", () => {
  console.log("MongoDB connected");
});

// app setup
const app = express();
const port = process.env.PORT || 3000;
app.use(morgan("dev"));
app.use(express.json());

// routes middleware
app.get("/", (req, res) => {
  res.send("connected to simple blog backend");
});
app.use("/posts", postRouter);
app.use("/users", userRouter);

// error handling middleware

app.use((req, res, next) => {
  const error = new Error("Page Not Found!");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: false,
    data: null,
    error: error.message,
  });
});

// start server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
