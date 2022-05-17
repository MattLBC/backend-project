const { fetchCommentsByReviewId } = require("../models/comment_models");

exports.getCommentsByReviewId = (req, res, next) => {
  const { review_id } = req.params;
  fetchCommentsByReviewId(review_id)
    .then((comments) => {
      if (!comments) {
        res.status(200).send({ msg: "No comments here yet!" });
      }
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};
