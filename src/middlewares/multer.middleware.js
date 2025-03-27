import multer from "multer";
import fs from "fs";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // Get original filename without extension
    const originalName = path.parse(file.originalname).name;
    const extension = path.parse(file.originalname).ext;

    // Check if file exists and create versioned name if needed
    let finalName = `${originalName}${extension}`;
    let version = 1;

    while (fs.existsSync(path.join("./public/temp", finalName))) {
      finalName = `${originalName}-v${version}${extension}`;
      version++;
    }

    cb(null, finalName);
  },
});

export const upload = multer({ storage });

