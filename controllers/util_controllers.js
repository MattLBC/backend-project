const fs = require("fs")

exports.getEndpoints = (req, res, next) => {
    res.status(200).send(JSON.parse(fs.readFileSync("./endpoints.json")))
};
