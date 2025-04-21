import { Lawyer } from "../models/lawyer.model.js";
import { Appointment } from "../models/appointment.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../emailTemplates/emailTransporter.js";


export const requestLawyer = asyncHandler(async (req, res) => {
    const { specialization, appointmentDate, purpose, notes } = req.body;
    const userId = req.user._id;

    if (!specialization || !appointmentDate || !purpose) {
        throw new ApiError(400, "Specialization, appointment date, and purpose are required");
    }

    const request = await Appointment.create({
        user: userId,
        appointmentDate: new Date(appointmentDate),
        purpose,
        notes: notes || "",
        fee: 0, // optional, can be updated later
        status: 'pending' // still pending until offline match
        // no lawyer assigned yet
    });

    const populatedRequest = await Appointment.findById(request._id)
        .populate("user", "fullname email username");

    // Optionally notify admin or send confirmation
    const user = await User.findById(userId);
    const emailHtml = `
    <h2>Appointment Request Received</h2>
    <p>Dear ${user.fullname},</p>
    <p>We've received your appointment request under <strong>${specialization}</strong> for ${new Date(appointmentDate).toLocaleString()}.</p>
    <p>Our team will contact you shortly to assign a lawyer and confirm the details.</p>
    <p><strong>Purpose:</strong> ${purpose}</p>
    `;

    try {
        await sendEmail({
            sendTo: user.email,
            subject: "Appointment Request Received",
            html: emailHtml
        });
    } catch (err) {
        console.log("Email sending error:", err);
    }

    return res.status(201).json(
        new ApiResponse(201, populatedRequest, "Your appointment request has been submitted")
    );
});






// export const getAllLawyers = asyncHandler(async (req, res) => {
//     const lawyers = await Lawyer.find({ availability: true });
//
//     if (!lawyers || lawyers.length === 0) {
//         return res.status(200).json(
//             new ApiResponse(200, [], "No lawyers are available at the moment")
//         );
//     }
//
//     return res.status(200).json(
//         new ApiResponse(200, lawyers, "Lawyers fetched successfully")
//     );
// });







// // Get lawyer by ID
// export const getLawyerById = asyncHandler(async (req, res) => {
//     const { lawyerId } = req.params;
//
//     const lawyer = await Lawyer.findById(lawyerId);
//
//     if (!lawyer) {
//         throw new ApiError(404, "Lawyer not found");
//     }
//
//     return res.status(200).json(
//         new ApiResponse(200, lawyer, "Lawyer details fetched successfully")
//     );
// });
//
// // Create an appointment with a lawyer
// export const appointLawyer = asyncHandler(async (req, res) => {
//     const { lawyerId, appointmentDate, purpose, notes } = req.body;
//     const userId = req.user._id; // This will come from auth middleware
//
//     // Validate input
//     if (!lawyerId || !appointmentDate || !purpose) {
//         throw new ApiError(400, "Lawyer ID, appointment date and purpose are required");
//     }
//
//     // Check if lawyer exists
//     const lawyer = await Lawyer.findById(lawyerId);
//     if (!lawyer) {
//         throw new ApiError(404, "Lawyer not found");
//     }
//
//     // Check if lawyer is available
//     if (!lawyer.availability) {
//         throw new ApiError(400, "This lawyer is not available for new appointments");
//     }
//
//     // Create the appointment
//     const appointment = await Appointment.create({
//         user: userId,
//         lawyer: lawyerId,
//         appointmentDate: new Date(appointmentDate),
//         purpose,
//         notes: notes || "",
//         fee: lawyer.ratePerHour // You might want to calculate the fee based on expected hours
//     });
//
//     // Populate appointment with user and lawyer details for the response
//     const populatedAppointment = await Appointment.findById(appointment._id)
//         .populate("user", "fullname email username")
//         .populate("lawyer", "fullname specialization email phone");
//
//     // Get user for sending email notification
//     const user = await User.findById(userId);
//
//     // Send confirmation email to user
//     const emailHtml = `
//     <h2>Appointment Confirmation</h2>
//     <p>Dear ${user.fullname},</p>
//     <p>Your appointment with ${lawyer.fullname} has been scheduled for ${new Date(appointmentDate).toLocaleString()}.</p>
//     <p><strong>Purpose:</strong> ${purpose}</p>
//     <p><strong>Lawyer Specialization:</strong> ${lawyer.specialization}</p>
//     <p><strong>Status:</strong> Pending confirmation from the lawyer</p>
//     <p>You will receive another email once the lawyer confirms your appointment.</p>
//     <p>Thank you for using our service!</p>
//     `;
//
//     try {
//         await sendEmail({
//             sendTo: user.email,
//             subject: "Lawyer Appointment Confirmation",
//             html: emailHtml
//         });
//     } catch (error) {
//         console.log("Error sending appointment confirmation email:", error);
//         // We continue with the process even if email fails
//     }
//
//     return res.status(201).json(
//         new ApiResponse(201, populatedAppointment, "Appointment created successfully")
//     );
// });
//
// // Get all appointments for a user
// export const getUserAppointments = asyncHandler(async (req, res) => {
//     const userId = req.user._id; // From auth middleware
//
//     const appointments = await Appointment.find({ user: userId })
//         .populate("lawyer", "fullname specialization email phone")
//         .sort({ appointmentDate: -1 });
//
//     return res.status(200).json(
//         new ApiResponse(200, appointments, "User appointments fetched successfully")
//     );
// });
//
// // Update appointment status (cancel by user)
// export const updateAppointmentStatus = asyncHandler(async (req, res) => {
//     const { appointmentId } = req.params;
//     const { status } = req.body;
//     const userId = req.user._id; // From auth middleware
//
//     if (!status || !['cancelled'].includes(status)) {
//         throw new ApiError(400, "Valid status is required");
//     }
//
//     const appointment = await Appointment.findById(appointmentId);
//
//     if (!appointment) {
//         throw new ApiError(404, "Appointment not found");
//     }
//
//     // Ensure the user owns this appointment
//     if (appointment.user.toString() !== userId.toString()) {
//         throw new ApiError(403, "You are not authorized to update this appointment");
//     }
//
//     // Prevent updating completed appointments
//     if (appointment.status === 'completed') {
//         throw new ApiError(400, "Cannot update a completed appointment");
//     }
//
//     appointment.status = status;
//     await appointment.save();
//
//     const updatedAppointment = await Appointment.findById(appointmentId)
//         .populate("lawyer", "fullname specialization email phone");
//
//     return res.status(200).json(
//         new ApiResponse(200, updatedAppointment, "Appointment status updated successfully")
//     );
// });


