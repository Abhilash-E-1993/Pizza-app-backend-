const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ensure uploads folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const storageConfiguration = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const uploader = multer({ storage: storageConfiguration });

module.exports = uploader;