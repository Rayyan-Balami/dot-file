import dotenv from "dotenv";
dotenv.config();

import { connectToDB } from "./db/index.js";
import { app } from "./app.js";

// Add console logs for debugging
console.log("In index file : Cloudinary Config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "API KEY EXISTS" : "MISSING API KEY",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "API SECRET EXISTS" : "MISSING API SECRET"
});

// Connect to the MongoDB database
connectToDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("ERROR: Server failed with error", error);
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(
        `SUCCESS: Server is running on port ${process.env.PORT || 8000}`
      );
    });
  })
  .catch((error) => {
    console.error("ERROR: Server failed to start", error);
    process.exit(1);
  });
