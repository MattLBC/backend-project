const {
  fetchCommentsByReviewId,
  addNewCommentByReviewId,
} = require("../models/comment_models");

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  fetchCommentsByReviewId(review_id)
    .then((comments) => {
      if (!comments) {
        res.status(200).send({ msg: "No comments here yet!" });
      } else {
        res.status(200).send({ comments });
      }
    })
    .catch((err) => {
      next(err);
    });
};

exports.postCommentByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  const { username, body } = req.body;
  addNewCommentByReviewId(username, body, review_id)
    .then((newComment) => {
      res.status(201).send(newComment);
    })
    .catch((err) => {
      next(err);
    });
};
