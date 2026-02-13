import express from 'express';
import jwt from 'jsonwebtoken';

const authAdmin = async (req, res, next) => {
    try {

        const {atoken} =  req.headers;
        if(!atoken){
            return res.json({success: false, message: "Unauthorized access"});
        } 
        const token_decode = jwt.verify(atoken, process.env.JWT_SECRET);
        if(token_decode !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            return res.json({success: false, message: "Unauthorized access"});
        }

        next();
        
    } catch (error) {
        console.error("Error logging in admin:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

export default authAdmin;