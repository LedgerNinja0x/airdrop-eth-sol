const fs = require("fs");
const json2xls = require("json2xls");
import path from "path";

const handler = async (req, res) => {
  if (req.method === "POST") {
    const { flag, data } = req.body;
    if (!flag) {
      return res.status(200).json({
        status: "error",
        error: "No start and end date defined!",
      });
    }

    try {
      const excel = json2xls(data, {
        fields: [
            "_id",
            "provider",
            "username",
            "avatar",
            "twitterVerified",
            "userRating",
            "ethAddress",
            "solAddress",
            "ethBalance",
            "solBalance",
            "ethGas",
            "solGas",
            "location",
            "followers_count",
            "following_count",
            "like_count",
            "twitt_username",
            "firstTag",
            "message",
            "createdAt",
            "IP",
            "tokenBalance",
            "tokenValue",
            "id"
        ],
      });

      await fs.writeFileSync("./public/manifest.xlsx", excel, "binary");
      const filePath = path.join(process.cwd(), "/public/manifest.xlsx");
      const manifestBuffer = fs.createReadStream(filePath);

      await new Promise(function (resolve) {
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=manifest.xlsx"
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader("Content-Length", `${manifestBuffer.size}`);
        manifestBuffer.pipe(res);
        manifestBuffer.on("end", resolve);
        manifestBuffer.on("error", function (err) {
          if (err.code === "ENOENT") {
            res.status(400).json({
              error: "error",
              error: "Sorry we could not find the file you requested!",
            });
            res.end();
          } else {
            res.status(500).json({
              error: "error",
              message: "Sorry, something went wrong!",
            });
            res.end();
          }
        });
      });
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        status: "error",
        msg: error.message,
      });
    }
  }
};

export default handler;