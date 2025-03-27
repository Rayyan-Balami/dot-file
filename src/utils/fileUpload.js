import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

export const uploadOnCloudinary = async (filePath) => {
  try {
    // Check if file exists
    if (!filePath) {
      throw new Error("Please provide a file path");
    }
    
    // Configure cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    // Upload to cloudinary
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
    });
    
    console.log("SUCCESS: File uploaded to Cloudinary");
    return res;
  } catch (error) {
    console.error("ERROR: File not uploaded to Cloudinary", error);
    return null;
  } finally {
    // Clean up temp file regardless of success or failure
    if (filePath && fs.existsSync(filePath)) {
      console.log("Cleaning up temporary file:", filePath);
      fs.unlinkSync(filePath);
    }
  }
};
