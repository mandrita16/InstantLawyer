import { Router } from "express";
import {verifyJWT} from "../middleware/authMiddleware.js";
import {registerUser,loginUser, sendVerificationOTP, verifyEmailOTP, resendOTP} from "../controllers/user.controller.js";

const router = Router()

router.post('/register',registerUser)
router.post('/login',loginUser)
router.post("/send-otp", sendVerificationOTP);
router.post("/verify-otp", verifyEmailOTP);
router.post("/resend-otp", resendOTP);


export default router;