import { useState } from "react";
import { createContext } from "react";
import axios from "axios";
import { toast } from "react-toastify"


export const AdminContext = createContext();

const AdminContextProvider = (props) => {

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '');
    const [doctors, setDoctors] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [dashData, setDashData] = useState(false);

    const backendUrl = "https://doc-appointment-system-backend-bvn5.onrender.com";

    const getAllDoctors = async () => {
        try { 

            const { data } = await axios.post(backendUrl + '/api/admin/all-doctors', {}, { headers: {  aToken }});
            if(data.success) {
                setDoctors(data.doctors)
                console.log("Doctors fetched successfully: ", data.doctors);
            } else {
                toast.error(data.message || "Failed to fetch doctors")
            }
            
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching doctors")
        }
    }

    const changeAvailability = async (docId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: {  aToken }});
            if(data.success) {
                toast.success(data.message || "Doctor Availability Changed");
                getAllDoctors();
            } else {
                toast.error(data.message || "Failed to update doctor availability")
            }
            
        } catch (error) {
            toast.error(error.message || "An error occurred while updating doctor availability");
        }
    }

    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: {  aToken }});
            if(data.success) {
                console.log("Appointments fetched successfully: ", data.appointments);
                setAppointments(data.appointments);
            } else {
                toast.error(data.message || "Failed to fetch appointments")
            }
            
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching appointments")
        }

    }

    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: {  aToken }});
            if(data.success) {
                toast.success(data.message || "Appointment cancelled successfully");
                getAllAppointments();
            } else {
                toast.error(data.message || "Failed to cancel appointment")
            }
            
        } catch (error) {
            toast.error(error.message || "An error occurred while cancelling appointment");
        }

    }

    const getDashData = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: {  aToken }});
            if(data.success) {
                setDashData(data.dashData);
            } else {
                toast.error(data.message || "Failed to fetch dashboard data")
            }
            
        } catch (error) {
            toast.error(error.message || "An error occurred while fetching dashboard data");
        }

    }

    const value = {
        aToken, setAToken,
        backendUrl, doctors,
        getAllDoctors, changeAvailability,
        appointments, setAppointments,
        getAllAppointments, cancelAppointment,
        dashData, getDashData
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
}

export default AdminContextProvider;
