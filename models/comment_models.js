const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

exports.fetchCommentsByReviewId = (review_id) => {
  return db
    .query(
      `SELECT * FROM comments
      WHERE comments.review_id = $1`,
      [review_id]
    )
    .then((results) => {
      if (!results.rows.length) {
        return checkExists("reviews", "review_id", review_id);
      }
      return results.rows;
    });
};

exports.addNewCommentByReviewId = (username, body, review_id) => {
  if (!body || !username) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `INSERT INTO comments (author, body, review_id) 
        VALUES ($1, $2, $3) RETURNING *`,
      [username, body, review_id]
    )
    .then((results) => {
      return results.rows[0];
    });
};
