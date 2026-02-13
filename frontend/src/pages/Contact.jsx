import React from 'react'
import { assets } from '../assets/assets'

const Contact = () => {
  return (
    <div>

      <div className='text-center text-2xl pt-10 text-gray-500'>
        <p>CONTACT <span className='font-medium text-gray-700'>US</span></p>
      </div>
    
      <div className='my-10 flex flex-col justify-center gap-10 md:flex-row mb-28 text-sm'>

        <img className='w-full md:max-w-[360px]' src={assets.contact_image} alt="" />

        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-lg text-gray-600'>Our OFFICE</p>
          <p className='text-gray-500'>Bulding No: 54/73/8890, Delloite <br />Hitech City, Hyderabad, India.</p>
          <p className='text-gray-500'>Phone: +91-7799556644 <br /> Email: contact@prescripto.com</p>
          <p className='font-semibold text-lg text-gray-600'>Careers at PRESCRIPTO</p>
          <p className='text-gray-500'>Learn more about our team and job openings.</p>
          <button className='border border-black text-sm px-8 py-4 hover:bg-black hover:text-white transition-all duration-500 cursor-pointer'>Explore Jobs</button>
        </div>

      </div>
    </div>
  )
}

export default Contact