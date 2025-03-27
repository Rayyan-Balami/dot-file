import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";

const registerUser = asyncHandler(async (req, res) => {
  const {email, fullname, username, password} = req.body;
  
  // Basic validation
  if(!email || !fullname || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }
  
  // Check existing user (correct)
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });
  
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  
  // File handling (improved)
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
  
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }
  
  // Upload avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Avatar upload failed");
  }
  
  // Upload cover image (if provided)
  let coverImage;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }
  
  // Create user (more efficient)
  const user = await User.create({
    username,
    email,
    fullname,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || ""
  });
  
  // Get user without sensitive fields
  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");
  
  // Return response (correct order)
  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Login user" });
});

export { registerUser, loginUser };