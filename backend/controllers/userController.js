import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v2 as cloudinary } from 'cloudinary';
import Stripe from 'stripe';

import userModel from '../models/userModel.js';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';


// API for user registration
const registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if(!name || !email || !password) {
            return res.json({success: false, message: 'All fields are required' });
        }

        if(!validator.isEmail(email)) {
            return res.json({success: false, message: 'Invalid email format' });
        }

        if(password.length < 8) {
            return res.json({success: false, message: 'Password must be at least 8 characters long' });
        }

        // Hash the password before saving to the database
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({success: true, message: 'User registered successfully', token });

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API for user login
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
        const user = await userModel.findOne({ email });

        if(!user) {
            return res.json({success: false, message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch) {
            const token = jwt.sign({ id : user._id }, process.env.JWT_SECRET);
            res.json({success: true, message: 'User logged in successfully', token });
        } else {
            res.json({success: false, message: 'Invalid credentials' });
        }
        
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {

        const { userId } = req;
        const userData = await userModel.findById(userId).select('-password');
        res.json({success: true, userData});

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to update user profile data
const updateProfile = async (req, res) => {
    try {
        
        const { userId } = req;
        const { name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        if(!name || !phone || !dob || !gender) {
            return res.json({success: false, message: 'All fields are required' });
        }

        await userModel.findByIdAndUpdate(userId, { name, phone, address : JSON.parse(address), dob, gender});
        if(imageFile) {
            // Upload the image to Cloudinary and get the URL
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: 'image'});
            const imageUrl = imageUpload.secure_url;

            await userModel.findByIdAndUpdate(userId, { image: imageUrl });
        }
        res.json({success: true, message: 'Profile updated successfully'});

    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to Book an appointment with a doctor
const bookAppointment = async (req, res) => {
    try {

        const {userId} = req;
        const { docId, slotDate, slotTime } = req.body;

        const docData = await doctorModel.findById(docId).select('-password');
        if(!docData.available) {
            return res.json({success: false, message: 'Doctor is not available for appointments' });
        }

        let slots_booked = docData.slots_booked;
        // Check if the slot is available
        if(slots_booked[slotDate]) {
            if(slots_booked[slotDate].includes(slotTime)) {
                return res.json({success: false, message: 'Slot is already booked' });
            } else {
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select('-password');
        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount : docData.fees,
            slotTime,
            slotDate,
            date : Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // Save the updated slots_booked data for the doctor
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({success: true, message: 'Appointment booked successfully'});


        
    } catch (error) {
        console.error("Error booking appointment:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to get all appointments of a user
const listAppointments = async (req, res) => {
    try {

        const { userId } = req;
        const appointments = await appointmentModel.find({ userId });
        res.json({success: true, appointments});
        
    } catch (error) {
        console.error("Error listing appointments:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

// API to cancel an appointment
const cancelAppointment = async (req, res) => {
    try {

        const { userId } = req;
        const { appointmentId } = req.body;

        const appointmentData = await appointmentModel.findById(appointmentId);

        // Check if the appointment belongs to the user
        if(appointmentData.userId.toString() !== userId) {
            return res.json({success: false, message: 'Unauthorized action' });
        }

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

    
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// API to Pay Online using Stripe Checkout
const paymentStripe = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        
        // 1. Fetch appointment data
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        // 2. Create Stripe Checkout Session (Correct Method)
        const session = await stripeInstance.checkout.sessions.create({
            success_url: `${process.env.FRONTEND_URL}/verify-stripe?success=true&appointmentId=${appointmentId}`,
            cancel_url: `${process.env.FRONTEND_URL}/verify-stripe?success=false&appointmentId=${appointmentId}`,
            line_items: [
                {
                    price_data: {
                        currency: process.env.CURRENCY,
                        product_data: {
                            name: `Appointment with ${appointmentData.docData.name}`,
                        },
                        unit_amount: appointmentData.amount * 100, // Stripe expects cents/paise
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
        });

        res.json({ success: true, session_url: session.url });

    } catch (error) {
        // This will print the EXACT error in your backend terminal
        console.error("STRIPE_CONTROLLER_ERROR:", error); 
        res.status(500).json({ success: false, message: error.message });
    }
}

// API to verify payment (Called when user returns from Stripe)
const verifyStripe = async (req, res) => {
    try {
        const { appointmentId, success } = req.body;

        if (success === "true") {
            await appointmentModel.findByIdAndUpdate(appointmentId, { payment: true });
            res.json({ success: true, message: 'Payment successful' });
        } else {
            res.json({ success: false, message: 'Payment failed' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { registerUser, loginUser, getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentStripe, verifyStripe };