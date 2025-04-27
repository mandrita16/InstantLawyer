import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/lawyerRoutes.js";

const app = express();


const corsOptions = {
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Add your frontend URLs here
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser());


app.use('/api/v1/user',userRoutes)
app.use("/api/v1/lawyer-appointment", appointmentRoutes);








export {app};