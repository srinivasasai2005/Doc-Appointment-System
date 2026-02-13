import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '');

    const [appointments, setAppointments] = useState([]);

    const [dashData, setDashData] = useState(false);

    const [profileData, setProfileData] = useState(false);

    const getAppointments = async () => {

        try {

            const { data } = await axios.get( backendUrl + '/api/doctor/appointments', { headers : { dToken } } );
            if(data.success) {
                setAppointments(data.appointments);
            } else {
                toast.error(data.message);
            }
            
        } catch (error) {
            console.error("Error fetching doctor appointments:", error);
            toast.error("Error fetching doctor appointments");
        }

    }

    const completeAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post( backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers : { dToken } } );
            if(data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
            
        } catch (error) {
            console.error("Error completing appointment:", error);
            toast.error("Error completing appointment");
        }

    }

    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post( backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers : { dToken } } );
            if(data.success) {
                toast.success(data.message);
                getAppointments();
            } else {
                toast.error(data.message);
            }
            
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast.error("Error cancelling appointment");
        }

    }

    const getDashData = async () => {

        try {

            const { data } = await axios.get( backendUrl + '/api/doctor/dashboard', { headers : { dToken } } );
            if(data.success) {
                setDashData(data.dashData);
                console.log("Dashboard data:", data.dashData);

            } else {
                toast.error(data.message);
            }
            
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            toast.error("Error fetching dashboard data");
        }

    }

    const getProfileData = async () => {

        try {

            const { data } = await axios.get( backendUrl + '/api/doctor/profile', { headers : { dToken } } );
            if(data.success) {
                setProfileData(data.profileData);
                console.log("Doctor profile data:", data.profileData);
            } else {
                toast.error(data.message);
            }
            
        } catch (error) {
            console.error("Error fetching Doctor profile data:", error);
            toast.error("Error fetching Doctor profile data");
        }

    }


    const value = {
        backendUrl,
        dToken,
        setDToken,
        appointments, setAppointments,
        getAppointments,
        completeAppointment,
        cancelAppointment,
        dashData, setDashData,
        getDashData,
        profileData, setProfileData,
        getProfileData
    };

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    );
}

export default DoctorContextProvider;