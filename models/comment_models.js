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
