const db = require("../db/connection");

exports.fetchReviewById = (review_id) => {
  return db
    .query(
  `SELECT reviews.review_id, title, review_body, designer, review_img_url, reviews.votes, category, owner, reviews.created_at FROM reviews
  JOIN comments ON reviews.review_id = comments.review_id
  WHERE reviews.review_id = $1`,
      [review_id]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      results.rows[0].comment_count = results.rows.length
      return results.rows[0];
    });
};

exports.updateReviews = (review_id, inc_votes) => {
  if (!inc_votes) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `UPDATE reviews
      SET votes = votes + $2
      WHERE review_id = $1
      RETURNING *`,
      [review_id, inc_votes]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      return results.rows[0];
    });
};
