import React from 'react'

import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Footer = () => {

    const navigate = useNavigate();

  return (
    <div className='md:mx-10'>
        <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

            {/* ---- left section */}
            <div>
                <img className='mb-5 w-40' src={assets.logo} alt="Logo" />
                <p className='w-full md:w-2/3 text-gray-600 leading-6'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Autem neque dolore eos corrupti impedit recusandae, architecto placeat? Laborum libero commodi ut et assumenda at quasi!</p>
            </div>

            {/* ---- center section */}
            <div>
                <p className='text-xl font-medium mb-5'>COMPANY</p>
                <ul className='flex flex-col gap-2 text-gray-600 cursor-pointer font-medium'>
                    <li onClick={() => { navigate('/'); window.scrollTo(0, 0)}} className='hover:text-primary hover:translate-y-[-4px] transition-all duration-300'>Home</li>
                    <li onClick={() => {navigate('/about'); window.scrollTo(0, 0)}} className='hover:text-primary hover:translate-y-[-4px] transition-all duration-300'>About Us</li>
                    <li onClick={() => {navigate('/contact'); window.scrollTo(0, 0)}} className='hover:text-primary hover:translate-y-[-4px] transition-all duration-300'>Contact Us</li>
                    <li onClick={() => {navigate('/privacy-policy'); window.scrollTo(0, 0)}} className='hover:text-primary hover:translate-y-[-4px] transition-all duration-300'>Privacy Policy</li>
                </ul>
            </div>

            {/* ---- right section */}
            <div>
                <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                <ul className='flex flex-col gap-2 text-gray-600 cursor-pointer font-medium'>
                    <li className='hover:text-primary hover:translate-y-[-4px] transition-all duration-300'>+91-7799556644</li>
                    <li className='hover:text-primary hover:translate-y-[-4px] transition-all duration-300'>prescripto@gmail.com</li>
                </ul>
            </div>

        </div>

        <div>
            <hr />
            <p className='text-center text-sm text-gray-500 py-4'>Copyright © 2026 Prescripto. All rights reserved.</p>
        </div>
    </div>
  )
}

export default Footer