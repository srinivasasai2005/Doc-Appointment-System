import React, { useContext } from 'react'
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { loadStripe } from '@stripe/stripe-js';
import { useNavigate } from 'react-router-dom';

import { AppContext } from '../context/AppContext.jsx';
import { useEffect } from 'react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const MyAppointments = () => {

  const { backendUrl, token, getDoctorsData } = useContext(AppContext);
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const slotDateFormat = (slotDate) => {
    const dateArray = slotDate.split('_');
    return dateArray[0] + ' ' + months[Number(dateArray[1]) - 1] + ' ' + dateArray[2];
  }

  const getUserAppointments = async () => {
    try {

      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers : { token } });
      if(data.success) {
        setAppointments(data.appointments.reverse());
      }
      
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      toast.error(error.message || 'Error fetching appointments');
    }
  }

  const cancelAppointment = async (appointmentId) => {

    try {

      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers : { token } });
      if(data.success) {
        toast.success(data.message);
        getUserAppointments();
        getDoctorsData();
      } else {
        toast.error(data.message);
      }
      
    } catch (error) {
      console.error("Error fetching user appointments:", error);
      toast.error(error.message || 'Error fetching appointments');
    }

  }

  const initPay = (order) => {

    const options = {
      key: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      amount: order.amount,
      currency: order.currency,
      name: 'Prescripto',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log(response);

        try {

          const { data } = await axios.post(backendUrl + '/api/user/verify-stripe', { stripe_order_id : response.order_id }, { headers : { token } });
          if(data.success) {
            getUserAppointments();
            navigate('/my-appointments');
            toast.success(data.message);
          }
          
        } catch (error) {
            console.error( error);
            toast.error(error.message || 'Error verifying payment');
        }
      }

    }

    const stp = new window.Stripe(options)
    stp.open()

  }

  const appointmentStripe = async (appointmentId) => {
      try {
          const { data } = await axios.post(
              backendUrl + '/api/user/payment-stripe', 
              { appointmentId }, 
              { headers: { token } }
          );

          if (data.success) {
              // Redirect user to Stripe's secure checkout page
              window.location.replace(data.session_url);
          } else {
              toast.error(data.message);
          }
      } catch (error) {
          console.error("Error making payment:", error);
          toast.error(error.message);
      }
  }
  

  useEffect(() => {
    if(token) {
      getUserAppointments();
    }
  }, [token]);


  return (
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointments</p>

      <div>
        {
          appointments.slice(0, 3).map((item, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-100 rounded-lg' src={item.docData.image} alt="" />
              </div>
              <div className='text-sm flex-1 text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address :</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm font-medium text-neutral-700'>Date & Time :</span> {slotDateFormat(item.slotDate)} | {item.slotTime}</p>
              </div>
              <div></div>
              <div className='flex flex-col gap-2 justify-end'>
                {!item.cancelled && item.payment && !item.isCompleted && <button className='text-sm text-green-600 text-center sm:min-w-48 py-2 border rounded-lg bg-green-100 cursor-not-allowed'>Payment Successful</button>}
                {!item.cancelled && !item.payment && !item.isCompleted && <button onClick={() => appointmentStripe(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded-lg hover:bg-green-600 hover:text-white transition-all duration-300 cursor-pointer'>Pay Online</button>}
                {!item.cancelled && !item.isCompleted && <button onClick={() => cancelAppointment(item._id)} className='text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300 cursor-pointer'>Cancel Appointment</button>}
                {item.cancelled && !item.isCompleted && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment Cancelled</button>}
                {!item.cancelled && item.isCompleted && <button className='sm:min-w-48 py-2 border border-green-500 rounded text-green-500'>Completed</button>}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default MyAppointments