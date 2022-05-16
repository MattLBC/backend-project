const db = require("../db/connection");

exports.fetchCategories = () => {
  return db.query(`SELECT * FROM categories`).then((results) => {
    return results.rows;
  });
};

exports.fetchReviewById = (review_id) => {
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
      return results.rows[0];
    });
};
``