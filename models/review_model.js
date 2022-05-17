const db = require("../db/connection");

exports.fetchReviewById = (review_id) => {
  if(isNaN(parseInt(review_id))){
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  const comment_count = db
    .query(
      `SELECT * FROM comments 
      WHERE review_id = $1`,
      [review_id]
    )
    .then((results) => {
      return results.rows.length;
    });
  return db
    .query(
      `SELECT * FROM reviews
      WHERE review_id = $1`,
      [review_id]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
      results.rows[0].comment_count = comment_count;
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
