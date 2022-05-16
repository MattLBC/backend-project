const express = require("express");
const { getCategories } = require("./controllers/categories_controller");

const app = express();

app.get("/api/categories", getCategories);

app.use("/*", (req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

module.exports = app;
