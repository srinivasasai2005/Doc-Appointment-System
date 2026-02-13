import React, { useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyStripe = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get('success');
    const appointmentId = searchParams.get('appointmentId');
    
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/verify-stripe',
                { success, appointmentId },
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                navigate('/my-appointments');
            } else {
                toast.error(data.message);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            navigate('/');
        }
    };

    useEffect(() => {
        if (token && appointmentId) {
            verifyPayment();
        }
    }, [token, appointmentId]);

    return (
        <div className='min-h-[60vh] flex items-center justify-center'>
            <div className="w-20 h-20 border-4 border-gray-300 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );
};

export default VerifyStripe;