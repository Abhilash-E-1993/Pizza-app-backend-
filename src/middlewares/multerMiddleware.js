const multer = require('multer');
const path = require('path');
const fs = require('fs');

// make sure the upload dir exists (fresh clones / Render ephemeral fs)
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storageConfiguration = multer.diskStorage({
  destination: (req, file, next) => {
    next(null, uploadDir);
  },
  filename: (req, file, next) => {
    next(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

// only allow real image uploads
const fileFilter = (req, file, next) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    return next(null, true);
  }
  const error = new Error('only image files are allowed');
  error.statuscode = 400;
  return next(error);
};

const uploader = multer({
  storage: storageConfiguration,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = uploader;