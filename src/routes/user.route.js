import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the User API" });
});

router.post(
  "/register",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);

//secured routes
router.post("/logout",
  verifyJwt,
  logoutUser,
);


export default router;
