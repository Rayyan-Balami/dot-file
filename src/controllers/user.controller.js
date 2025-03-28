import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileUpload.js";
import jwt from "jsonwebtoken";

const cookiesOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "none",
};

const generateAccessAndRefreshToken = async (user) => {
  try {
    // Generate access token
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Access token and refresh token generation failed");
  }
};

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken ||
    req.headers["authorization"]?.replace("Bearer ", "");
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  let decoded;
  try {
    decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Session expired, please login again");
    }
    throw new ApiError(401, "Decoding refresh token failed");
  }
  const user = await User.findById(decoded._id);
  if (!user) {
    throw new ApiError(401, "user not found");
  }
  if (user.refreshToken !== incomingRefreshToken) {
    throw new ApiError(401, "Invalid refresh token");
  }
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .cookie("accessToken", accessToken, cookiesOptions)
    .json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        "Access token refreshed successfully"
      )
    );
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullname, username, password } = req.body;

  // Basic validation
  if (!email || !fullname || !username || !password) {
    throw new ApiError(400, "All fields are required");
  }

  // Check existing user (correct)
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
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
    coverImage: coverImage?.url || "",
  });

  // Get user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // Return response (correct order)
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if (!email && !username) {
    throw new ApiError(400, "Email or username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { username }] });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "invalid password");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookiesOptions)
    .cookie("accessToken", accessToken, cookiesOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // Clear refresh token from database (single operation)
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } }
  );

  // Clear cookies and send response
  return res
    .status(200)
    .clearCookie("refreshToken")
    .clearCookie("accessToken")
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
