import express from 'express';
import jwt from 'jsonwebtoken';

const authDoctor = async (req, res, next) => {
    try {

        const {dtoken} =  req.headers;
        if(!dtoken){
            return res.json({success: false, message: "Unauthorized access"});
        } 
        
        const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
        req.docId = token_decode.id || token_decode.doctorId; 
        next();
        
    } catch (error) {
        console.error("Error logging in Doctor:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

export default authDoctor;