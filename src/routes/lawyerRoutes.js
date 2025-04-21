import { Router } from "express";
import {
    requestLawyer
} from "../controllers/lawyer.controller.js";
import { verifyJWT } from "../middleware/authMiddleware.js";

const router = Router();

// Public routes
// router.get("/lawyers", getAllLawyers);
// router.get("/lawyers/:lawyerId", getLawyerById);
//
// // Protected routes (require authentication)
// router.post("/appointments", verifyJWT, appointLawyer);
// router.get("/user/appointments", verifyJWT, getUserAppointments);
// router.patch("/appointments/:appointmentId", verifyJWT, updateAppointmentStatus);

router.post("/request", verifyJWT, requestLawyer);


export default router;