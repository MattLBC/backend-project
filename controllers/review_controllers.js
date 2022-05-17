const { fetchReviewById, updateReviews, fetchAllReviews } = require("../models/review_model");

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchReviews = (req, res, next) => {
  const { review_id } = req.params;
  const { inc_votes } = req.body;
  updateReviews(review_id, inc_votes)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getAllReviews =(req, res, next) => {
  fetchAllReviews().then((reviews) => {
    res.status(200).send({ reviews })
  })
  .catch((err) => {
    next(err);
  })
}