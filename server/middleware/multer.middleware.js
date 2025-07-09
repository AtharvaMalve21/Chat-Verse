const multer = require("multer");

const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: async function (req, file, cb) {
    return cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
