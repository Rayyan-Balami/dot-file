import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

export const connectToDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is not defined");
    }

    // Connect to MongoDB using the MONGODB_URI and DB_NAME
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `SUCCESS: Connected to MongoDB: ${connectionInstance.connection.name}`
    );
  } catch (error) {
    console.error("ERROR: Unable to connect to MongoDB", error);
    process.exit(1); // Exit the process if connection fails
  }
};
