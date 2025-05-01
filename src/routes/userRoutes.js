import { Router } from "express";
import {verifyJWT} from "../middleware/authMiddleware.js";
import {registerUser,loginUser} from "../controllers/user.controller.js";

const router = Router()

router.post('/register',registerUser)
router.post('/login',loginUser)


export default router;