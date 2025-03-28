import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJwt = asyncHandler(async (req, _, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired, please login again");
    }
    throw new ApiError(401, "Invalid token");
  }

  // Find the complete user document
  const user = await User.findById(decoded._id).select("-password");

  if (!user) {
    throw new ApiError(401, "Invalid token or user not found");
  }

  // Set both decoded token and user document
  req.user = user;
  next();
});
