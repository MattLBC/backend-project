const express = require("express");
const { getCategories } = require("./controllers/categories_controller");
const {
  getReviewById,
  patchReviews,
  getAllReviews,
} = require("./controllers/review_controllers");
const { getUsers } = require("./controllers/user_controllers");
const {
  getCommentsByReviewId,
  postCommentByReviewId,
} = require("./controllers/comment_controllers");

const app = express();
app.use(express.json());

app.get("/api/categories", getCategories);
app.get("/api/reviews", getAllReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.patch("/api/reviews/:review_id", patchReviews);
app.get("/api/users", getUsers);
app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.post("/api/reviews/:review_id/comments", postCommentByReviewId);


app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
    ``;
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "Route not found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "Internal server error" });
});

module.exports = app;
