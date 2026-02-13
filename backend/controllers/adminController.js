import validator from "validator";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";
import jwt from "jsonwebtoken";

import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";


// API for adding Doctors.

const addDoctor = async (req, res) => {

    try {
        const {name, email, password, speciality, degree, experience, about, fees, address} = req.body;
        const imageFile = req.file;
        
        // checking for all data to add doctor
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address){
            return res.json({success: false, message: "All fields are required"});
        } 

        // Validating email and password format
        if(!validator.isEmail(email)){
            return res.json({success: false, message: "Invalid email format"});
        }

        if(password.length < 8){
            return res.json({success: false, message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol"});
        }

        // Hashing the password before saving to database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Uploading the image to cloudinary
        const image_upload = await cloudinary.uploader.upload(imageFile.path, {
            resource_type: "image",
        });
        const imageUrl = image_upload.secure_url;

        const doctorData = {
            name,
            email,
            password: hashedPassword,
            image: imageUrl,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now(),
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.status(201).json({success: true, message: "Doctor added successfully"});

    } catch (error) {
        console.error("Error adding doctor:", error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API for Admin login
const loginAdmin = async (req, res) => {
    try {
        
        const {email, password} = req.body;

        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD){
            
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success: true,message: "Admin logged in successfully", token});

        } else {
            return res.json({success: false, message: "Invalid email or password"});
        }

        res.json({success: true, message: "Admin logged in successfully"});

    } catch (error) {
        console.error("Error logging in admin:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to get all doctors for admin dashboard
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find().select('-password');
        res.json({success: true, doctors});
        
    } catch (error) {
        console.error("Error fetching all doctors:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to get all appointments for admin dashboard
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({});
        res.json({success: true, appointments});
        
    } catch (error) {
        console.error("Error fetching all appointments:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to cancel appointment by admin
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);


        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled : true });

        // Remove the slot from the doctor's available slots
        const { docId, slotDate, slotTime } = appointmentData;

        const doctorData = await doctorModel.findById(docId);
        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({success: true, message: 'Appointment cancelled successfully'});
        
    } catch (error) {
        console.error("Error listing appointments:", error);
        res.status(500).json({success: false, message: error.message});
    }

}

// API to get dashboard data for admin
const adminDashboard = async (req, res) => {

    try {

        const doctors = await doctorModel.find({});
        const users = await userModel.find({});
        const appointments = await appointmentModel.find({});

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            latestAppointments: appointments.reverse().slice(0, 5),
        }

        res.json({success: true, dashData});

        
    } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        res.status(500).json({success: false, message: error.message});
    }

}

export { addDoctor, loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel, adminDashboard };