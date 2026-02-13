import React, { useContext, useState } from 'react'
import axios from 'axios';

import { assets } from '../assets/assets.js';
import { AppContext } from '../context/AppContext.jsx';
import { toast } from 'react-toastify';

const MyProfile = () => {

  const { userData, setUserData, token, backendUrl, loadUserProfileData } = useContext(AppContext);
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(false);
  
  const updateUserProfileData = async () => {

    try {

      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);

      image && formData.append('image', image);

      const { data } = await axios.post(backendUrl + '/api/user/update-profile', formData, { headers: { token }});
      if (data.success) {
        toast.success('Profile updated successfully');
        await loadUserProfileData();
        setIsEdit(false);
        setImage(false);
      } else {
        toast.error(data.message);
      }
      
    } catch (error) {
        console.log(error);
        toast.error(error.message);
    }

  }
  
  if (!userData) {
    return <div>Loading profile...</div>;
  }

  return userData && (
    <div className='max-w-lg flex flex-col gap-2 text-sm'>

      {
        isEdit
        ? <label htmlFor="image">
            <div className='inline-block relative cursor-pointer'>
              <img className='w-36 rounded opacity-75' src={image ? URL.createObjectURL(image) : userData.image} alt="" />
              <img className='w-10 absolute bottom-12 right-12' src={image ? '' : assets.upload_icon} alt="" />
            </div>
            <input type="file" id='image' hidden onChange={(e) => setImage(e.target.files[0])} />
          </label>
        : <img className='w-36 rounded' src={userData.image} alt={userData.name} />
      }

      {
        isEdit
        ? <input 
            className='bg-gray-50 text-3xl font-medium max-w-60 mt-4'
            type="text" value={userData.name} 
            onChange={e => setUserData(prev => ({...prev,name:e.target.value}))}/>
        : <p className='font-medium text-3xl text-neutral-800 mt-4'>{userData.name}</p>
      }
      <hr className='h-[1px] bg-zinc-400 border-none' />

      <div>
        <p className='font-medium text-neutral-500 mt-3'>CONTACT INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Email Id :</p>
          <p className='text-blue-500'>{userData.email}</p>
          <p className='font-medium'>Phone :</p>
          {
            isEdit
            ? <input 
                className='bg-gray-100 max-w-52'
                type="text" value={userData.phone} 
                onChange={e => setUserData(prev => ({...prev,phone:e.target.value}))}/>
            : <p className='text-blue-500'>{userData.phone}</p>
          }
          <p className='font-medium'>Address :</p>
          {
            isEdit
            ? <p>
              <input 
              className='bg-gray-100'
              value={userData.address.line1}
              onChange={e => setUserData(prev => ({...prev,address: {...prev.address, line1: e.target.value}}))} 
              type="text" />
              <br />
              <input 
              className='bg-gray-100'
              value={userData.address.line2}
              onChange={e => setUserData(prev => ({...prev,address: {...prev.address, line2: e.target.value}}))} 
              type="text" />
            </p>
            : <p className='text-gray-600'>
              {userData.address.line1}
              <br />
              {userData.address.line2}
            </p>
          }
        </div>
      </div>

      <div>
        <p className='font-medium text-neutral-500 mt-3'>BASIC INFORMATION</p>
        <div className='grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700'>
          <p className='font-medium'>Gender :</p>
          {
            isEdit
            ? <select 
              className='bg-gray-100 max-w-20'
              value={userData.gender}
              onChange={(e) => setUserData(prev => ({...prev, gender: e.target.value}))}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select> 
            : <p className='text-gray-600'>{userData.gender}</p>
          }
          <p className='font-medium'>Date of Birth :</p>
          {
            isEdit ? <input 
                        className='max-w-28 bg-gray-100'
                        type="date" 
                        onChange={(e) => setUserData(prev => ({...prev, dob: e.target.value}))} 
                        value={userData.dob}/>
            : <p className='text-gray-600'>{userData.dob}</p>
          }
        </div>
      </div>

      <div className='mt-10'>
        {
          isEdit
          ? <button 
              className='bg-primary text-white  px-6 py-2 rounded-full text-sm font-medium hover:text-primary hover:bg-transparent border border-primary duration-300 cursor-pointer'
              onClick={updateUserProfileData}>Save Information</button>
          : <button 
              className='bg-primary text-white px-6 py-2 rounded-full text-sm font-medium hover:text-primary hover:bg-transparent border border-primary duration-300 cursor-pointer'
              onClick={() => setIsEdit(true)}>Edit</button>
        }
      </div>
    </div>
  )
}

export default MyProfile