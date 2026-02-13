import express from 'express';
import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {

        const {token} =  req.headers;
        if(!token){
            return res.json({success: false, message: "Unauthorized access"});
        } 
        
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = token_decode.id || token_decode.userId;
        next();
        
    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({success: false, message: error.message});
    }
}

export default authUser;