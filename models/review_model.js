const db = require("../db/connection");
const { checkExists } = require("../db/seeds/utils");

exports.fetchReviewById = (review_id) => {
  return db
    .query(
      `SELECT reviews.*, COUNT(comments) AS comment_count
      FROM reviews
      LEFT JOIN comments
      ON reviews.review_id = comments.review_id
      WHERE reviews.review_id = $1
      GROUP BY reviews.review_id`,
      [review_id]
    )
    .then((results) => {
      if (!results.rows.length) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
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

exports.fetchAllReviews = (
  sort_by = "created_at",
  order = "desc",
  category
) => {
  const validSortBy = [
    "owner",
    "title",
    "review_id",
    "category",
    "created_at",
    "votes",
    "comment_count",
  ];
  const categoryArray = [];

  let queryStr = `SELECT reviews. *, COUNT(comments) AS comment_count
  FROM reviews
  LEFT JOIN comments
  ON reviews.review_id = comments.review_id`;

  if (category) {
    queryStr += ` WHERE category = $1 GROUP BY reviews.review_id`;
    categoryArray.push(category);
  } else {
    queryStr += ` GROUP BY reviews.review_id`;
  }

  if (validSortBy.includes(sort_by)) {
    queryStr += ` ORDER BY ${sort_by}`;
    if (order === "asc" || order === "desc") {
      queryStr += ` ${order}`;
    } else {
      return Promise.reject({ status: 400, msg: "Bad request" });
    }
  } else {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  return db.query(queryStr, categoryArray).then((results) => {
    if (!results.rows.length) {
      return checkExists("categories", "slug", category);
    }
    return results.rows;
  });
};
