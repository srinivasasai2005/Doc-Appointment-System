import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
    try {

        const { docId } = req.body;

        const docData = await doctorModel.findById(docId);
        await doctorModel.findByIdAndUpdate(docId, {available: !docData.available});

        res.json({success: true, message: "Doctor availability updated successfully"});
        
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

const doctorList = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select(["-password", "-email"]);
        res.json({success: true, doctors});
        
    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API for doctor login
const loginDoctor = async (req, res) => {

    try {

        const { email, password } = req.body;
        
        const doctor = await doctorModel.findOne({ email });

        if(!doctor) {
            return res.json({success: false, message: "Invalid credentials"});
        }

        const isMatch = await bcrypt.compare(password, doctor.password);

        if(isMatch) {
            const token = jwt.sign({ doctorId: doctor._id }, process.env.JWT_SECRET);
            res.json({success: true, message: "Doctor logged in successfully", token, doctor}); // ------ Token and doctor details sent in response
        } else {
            res.json({success: false, message: "Invalid email or password"});
        }
        
        
    } catch (error) {
        console.error("Error logging in doctor:", error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API for to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    
    try {

        const { docId } = req;
        const appointments = await appointmentModel.find({ docId });

        res.json({success: true, appointments});

    } catch (error) {
        console.error("Error fetching doctor appointments:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to mark appointment as completed by doctor
const appointmentComplete = async (req, res) => {

    try {

        const { appointmentId } = req.body;
        const { docId } = req;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if(appointmentData && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
            res.json({success: true, message: "Appointment marked as completed"});
        } else {
            res.json({success: false, message: "Appointment not found or unauthorized"});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API to mark appointment as cancelled by doctor
const appointmentCancel = async (req, res) => {

    try {

        const { appointmentId } = req.body;
        const { docId } = req;

        const appointmentData = await appointmentModel.findById(appointmentId);
        if(appointmentData && appointmentData.docId.toString() === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
            res.json({success: true, message: "Appointment marked as cancelled"});
        } else {
            res.json({success: false, message: "Appointment not found or unauthorized"});
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API to get dashboard data in doctor panel
const doctorDashboard = async (req, res) => {

    try {

        const { docId } = req;
        const appointments = await appointmentModel.find({ docId });

        let earnings = 0;

        appointments.map((item) => {
            if(item.isCompleted || item.payment) {
                earnings += item.amount;
            }
        })

        let patients = [];
        
        appointments.map((item) => {
            if(!patients.includes(item.userId.toString())) {
                patients.push(item.userId.toString());
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }

        res.json({success: true, dashData});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API to get doctor profile from doctor panel 
const doctorProfile = async (req, res) => {
    
    try {

        const { docId } = req;
        const profileData = await doctorModel.findById(docId).select("-password");
        res.json({success: true, profileData});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API to update doctor profile from doctor panel
const updateDoctorProfile = async (req, res) => {

    try {

        const { docId } = req;
        const { fees, available, address } = req.body;

        await doctorModel.findByIdAndUpdate(docId, { fees, available, address });
        
        res.json({success: true, message: "Profile updated successfully"});
        
    } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: error.message});
    }

}

export {changeAvailability, doctorList, loginDoctor, appointmentsDoctor, appointmentComplete, appointmentCancel, doctorDashboard, doctorProfile, updateDoctorProfile};